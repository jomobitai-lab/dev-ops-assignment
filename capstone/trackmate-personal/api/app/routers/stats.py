"""Dashboard stats: summary numbers, personal records, activity heatmap."""
from collections import Counter
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

    # Weekly streak: you train a few days a week on alternate days, so a daily
    # streak is wrong. Instead: count workout sessions per ISO week, and the streak
    # is how many weeks in a row you hit your weekly goal. Rest days never break it.
    prof = db.query(models.Profile).first()
    weekly_goal = int((prof.weekly_goal if prof else None) or _goal(db, "weekly_workouts") or 3)
    dates = {d[0] for d in db.query(models.Workout.date).distinct().all()}
    week_counts = Counter((d.isocalendar()[0], d.isocalendar()[1]) for d in dates)

    def wkey(dt):
        iso = dt.isocalendar()
        return (iso[0], iso[1])

    this_week = week_counts.get(wkey(today), 0)
    streak = 0
    cur = today
    # a not-yet-finished current week shouldn't break the streak, so if this week's
    # goal isn't met yet, start counting from last week.
    if week_counts.get(wkey(cur), 0) < weekly_goal:
        cur = cur - timedelta(days=7)
    while week_counts.get(wkey(cur), 0) >= weekly_goal:
        streak += 1
        cur = cur - timedelta(days=7)

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
        "week_streak": streak,              # consecutive weeks hitting the goal
        "this_week_workouts": this_week,
        "weekly_goal": weekly_goal,
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


@router.get("/muscle-balance")
def muscle_balance(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    """Number of sets logged per muscle group (for the radar chart)."""
    groups = ["Chest", "Back", "Legs", "Shoulders", "Biceps", "Triceps", "Forearms", "Core"]
    rows = (
        db.query(models.Exercise.muscle_group, func.count(models.WorkoutSet.id))
        .join(models.WorkoutSet, models.WorkoutSet.exercise_id == models.Exercise.id)
        .group_by(models.Exercise.muscle_group)
        .all()
    )
    counts = {g: c for g, c in rows}
    return [{"group": g, "sets": counts.get(g, 0)} for g in groups]
