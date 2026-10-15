"""Workout plan endpoints (create a plan once, reuse it when training)."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/plans", tags=["plans"])


def _to_out(p: models.WorkoutPlan) -> schemas.PlanOut:
    items = []
    for it in p.items:
        o = schemas.PlanExerciseOut(exercise_id=it.exercise_id, position=it.position)
        if it.exercise:
            o.exercise_name = it.exercise.name
            o.muscle_group = it.exercise.muscle_group
            o.target_part = it.exercise.target_part
            o.body_parts = it.exercise.body_parts
        items.append(o)
    return schemas.PlanOut(id=p.id, name=p.name, muscle_groups=p.muscle_groups, items=items)


@router.get("", response_model=List[schemas.PlanOut])
def list_plans(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    rows = db.query(models.WorkoutPlan).order_by(models.WorkoutPlan.name).all()
    return [_to_out(p) for p in rows]


@router.post("", response_model=schemas.PlanOut, status_code=201)
def create_plan(body: schemas.PlanIn,
                db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    p = models.WorkoutPlan(name=body.name, muscle_groups=body.muscle_groups)
    for i, it in enumerate(body.items):
        p.items.append(models.WorkoutPlanExercise(
            exercise_id=it.exercise_id, position=it.position or i))
    db.add(p)
    db.commit()
    db.refresh(p)
    return _to_out(p)


@router.put("/{plan_id}", response_model=schemas.PlanOut)
def update_plan(plan_id: int, body: schemas.PlanIn,
                db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    p = db.get(models.WorkoutPlan, plan_id)
    if not p:
        raise HTTPException(404, "Plan not found")
    p.name, p.muscle_groups = body.name, body.muscle_groups
    p.items.clear()
    for i, it in enumerate(body.items):
        p.items.append(models.WorkoutPlanExercise(
            exercise_id=it.exercise_id, position=it.position or i))
    db.commit()
    db.refresh(p)
    return _to_out(p)


@router.delete("/{plan_id}", status_code=204)
def delete_plan(plan_id: int, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    p = db.get(models.WorkoutPlan, plan_id)
    if not p:
        raise HTTPException(404, "Plan not found")
    db.delete(p)
    db.commit()
