"""Exercise template library endpoints."""
from typing import Optional, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/exercises", tags=["exercises"])


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
    ex = models.Exercise(**body.model_dump(), is_custom=1)
    db.add(ex)
    db.commit()
    db.refresh(ex)
    return ex
