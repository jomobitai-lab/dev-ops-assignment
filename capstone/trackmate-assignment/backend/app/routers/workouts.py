"""Workout endpoints (full CRUD, each workout has many sets)."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/workouts", tags=["workouts"])


def _to_out(w: models.Workout) -> schemas.WorkoutOut:
    sets = []
    for s in w.sets:
        out = schemas.WorkoutSetOut.model_validate(s)
        out.exercise_name = s.exercise.name if s.exercise else None
        sets.append(out)
    return schemas.WorkoutOut(
        id=w.id, date=w.date, day_label=w.day_label, notes=w.notes, sets=sets
    )


@router.get("", response_model=List[schemas.WorkoutOut])
def list_workouts(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    rows = db.query(models.Workout).order_by(models.Workout.date.desc()).all()
    return [_to_out(w) for w in rows]


@router.get("/{workout_id}", response_model=schemas.WorkoutOut)
def get_workout(workout_id: int,
                db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    w = db.get(models.Workout, workout_id)
    if not w:
        raise HTTPException(404, "Workout not found")
    return _to_out(w)


@router.post("", response_model=schemas.WorkoutOut, status_code=201)
def create_workout(body: schemas.WorkoutIn,
                   db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    w = models.Workout(date=body.date, day_label=body.day_label, notes=body.notes)
    for s in body.sets:
        w.sets.append(models.WorkoutSet(**s.model_dump()))
    db.add(w)
    db.commit()
    db.refresh(w)
    return _to_out(w)


@router.put("/{workout_id}", response_model=schemas.WorkoutOut)
def update_workout(workout_id: int, body: schemas.WorkoutIn,
                   db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    w = db.get(models.Workout, workout_id)
    if not w:
        raise HTTPException(404, "Workout not found")
    w.date, w.day_label, w.notes = body.date, body.day_label, body.notes
    w.sets.clear()
    for s in body.sets:
        w.sets.append(models.WorkoutSet(**s.model_dump()))
    db.commit()
    db.refresh(w)
    return _to_out(w)


@router.delete("/{workout_id}", status_code=204)
def delete_workout(workout_id: int,
                   db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    w = db.get(models.Workout, workout_id)
    if not w:
        raise HTTPException(404, "Workout not found")
    db.delete(w)
    db.commit()
