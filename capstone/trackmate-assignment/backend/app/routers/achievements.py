"""Achievements endpoints (CRUD)."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/achievements", tags=["achievements"])


@router.get("", response_model=List[schemas.AchievementOut])
def list_a(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    return db.query(models.Achievement).order_by(models.Achievement.date.desc()).all()


@router.post("", response_model=schemas.AchievementOut, status_code=201)
def add_a(body: schemas.AchievementIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = models.Achievement(**body.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row


@router.put("/{item_id}", response_model=schemas.AchievementOut)
def update_a(item_id: int, body: schemas.AchievementIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = db.get(models.Achievement, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row


@router.delete("/{item_id}", status_code=204)
def delete_a(item_id: int, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = db.get(models.Achievement, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row); db.commit()
