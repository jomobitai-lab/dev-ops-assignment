"""Goals / targets endpoints (set weight, calories, protein, savings targets)."""
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/goals", tags=["goals"])


@router.get("", response_model=List[schemas.GoalOut])
def list_goals(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    return db.query(models.Goal).all()


@router.put("", response_model=schemas.GoalOut)
def set_goal(body: schemas.GoalIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    """Create or update a goal by its type (one goal per type)."""
    row = db.query(models.Goal).filter(models.Goal.type == body.type).first()
    if row:
        row.target_value = body.target_value
        row.note = body.note
    else:
        row = models.Goal(**body.model_dump())
        db.add(row)
    db.commit(); db.refresh(row)
    return row
