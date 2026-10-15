"""Exercise template library endpoints."""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/exercises", tags=["exercises"])

# Muscle group -> body-map keys, so a custom exercise highlights sensibly
# without the user needing to know body-map internals.
GROUP_BODY = {
    "Chest": "chest",
    "Back": "upper-back,lower-back,trapezius",
    "Legs": "quadriceps,hamstring,calves,gluteal",
    "Shoulders": "front-deltoids,back-deltoids",
    "Biceps": "biceps",
    "Triceps": "triceps",
    "Forearms": "forearm",
    "Core": "abs,obliques",
}


@router.get("", response_model=List[schemas.ExerciseOut])
def list_exercises(muscle_group: Optional[str] = None,
                   db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    q = db.query(models.Exercise)
    if muscle_group:
        q = q.filter(models.Exercise.muscle_group == muscle_group)
    return q.order_by(models.Exercise.muscle_group, models.Exercise.name).all()


@router.post("", response_model=schemas.ExerciseOut, status_code=201)
def add_exercise(body: schemas.ExerciseIn,
                 db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    data = body.model_dump()
    # fill sensible defaults so a custom exercise highlights on the body map
    if not data.get("body_parts"):
        data["body_parts"] = GROUP_BODY.get(data["muscle_group"], "")
    if not data.get("target_part"):
        data["target_part"] = data["muscle_group"]
    ex = models.Exercise(**data, is_custom=1)
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return ex


@router.get("/{exercise_id}/last", response_model=schemas.LastPerformanceOut)
def last_performance(exercise_id: int,
                     db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    """How this exercise went last time + all-time PR, so you know what to beat."""
    ex = db.get(models.Exercise, exercise_id)
    if not ex:
        raise HTTPException(404, "Exercise not found")

    out = schemas.LastPerformanceOut(exercise_id=exercise_id, exercise_name=ex.name)

    # all-time heaviest weight for this exercise
    pr = (db.query(func.max(models.WorkoutSet.weight_kg))
          .filter(models.WorkoutSet.exercise_id == exercise_id).scalar())
    out.pr_weight = pr

    # most recent workout that used this exercise
    last_workout = (
        db.query(models.Workout)
        .join(models.WorkoutSet, models.WorkoutSet.workout_id == models.Workout.id)
        .filter(models.WorkoutSet.exercise_id == exercise_id)
        .order_by(models.Workout.date.desc())
        .first()
    )
    if last_workout:
        out.last_date = last_workout.date
        # best (heaviest) set of this exercise in that session
        best = None
        for s in last_workout.sets:
            if s.exercise_id == exercise_id and (best is None or s.weight_kg > best.weight_kg):
                best = s
        if best:
            out.last_best_weight = best.weight_kg
            out.last_best_reps = best.reps
            out.last_comment = best.comment
    return out
