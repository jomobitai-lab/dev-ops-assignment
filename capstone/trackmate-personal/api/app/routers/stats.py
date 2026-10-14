"""Dashboard stats: summary numbers, personal records, activity heatmap."""
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..db import get_db
from ..auth import require_auth
from .. import models

router = APIRouter(prefix="/api/stats", tags=["stats"])


def _goal(db, gtype):
    g = db.query(models.Goal).filter(models.Goal.type == gtype).first()
    return g.target_value if g else None


@router.get("/summary")
def summary(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    today = date.today()

    latest_bw = (db.query(models.BodyWeight)
                 .order_by(models.BodyWeight.date.desc()).first())
    today_nutrition = (db.query(models.NutritionLog)
                       .filter(models.NutritionLog.date == today).first())
    total_earnings = db.query(func.coalesce(func.sum(models.Earning.amount), 0)).scalar()
    total_workouts = db.query(models.Workout).count()
    avg_sleep = db.query(func.coalesce(func.avg(models.SleepLog.hours), 0)).scalar()

    # current gym streak: consecutive days with a workout, ending today or yesterday
    dates = {d[0] for d in db.query(models.Workout.date).distinct().all()}
    streak = 0
    cur = today if today in dates else today - timedelta(days=1)
    while cur in dates:
        streak += 1
        cur -= timedelta(days=1)

    return {
        "current_weight": latest_bw.weight_kg if latest_bw else None,
        "target_weight": _goal(db, "weight"),
        "today_calories": today_nutrition.calories if today_nutrition else 0,
        "target_calories": _goal(db, "calories"),
        "today_protein": today_nutrition.protein_g if today_nutrition else 0,
        "target_protein": _goal(db, "protein"),
        "total_earnings": round(total_earnings, 2),
        "savings_goal": _goal(db, "savings"),
        "total_workouts": total_workouts,
        "gym_streak": streak,
        "avg_sleep_hours": round(avg_sleep, 1),
    }


@router.get("/prs")
def personal_records(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    """Best (heaviest) set per exercise."""
    rows = (
        db.query(
            models.Exercise.name,
            func.max(models.WorkoutSet.weight_kg).label("max_weight"),
        )
        .join(models.WorkoutSet, models.WorkoutSet.exercise_id == models.Exercise.id)
        .group_by(models.Exercise.name)
        .order_by(func.max(models.WorkoutSet.weight_kg).desc())
        .all()
    )
    return [{"exercise": name, "max_weight_kg": w} for name, w in rows]


@router.get("/activity")
def activity(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    """Workout count per day (for the calendar heatmap)."""
    rows = (
        db.query(models.Workout.date, func.count(models.Workout.id))
        .group_by(models.Workout.date)
        .all()
    )
    return [{"date": d.isoformat(), "count": c} for d, c in rows]
