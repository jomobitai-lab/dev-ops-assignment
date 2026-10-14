"""Nutrition (calories + macros) endpoints (CRUD)."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/nutrition", tags=["nutrition"])


@router.get("", response_model=List[schemas.NutritionOut])
def list_n(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    return db.query(models.NutritionLog).order_by(models.NutritionLog.date).all()


@router.post("", response_model=schemas.NutritionOut, status_code=201)
def add_n(body: schemas.NutritionIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = models.NutritionLog(**body.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row


@router.put("/{item_id}", response_model=schemas.NutritionOut)
def update_n(item_id: int, body: schemas.NutritionIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = db.get(models.NutritionLog, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row


@router.delete("/{item_id}", status_code=204)
def delete_n(item_id: int, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = db.get(models.NutritionLog, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row); db.commit()
