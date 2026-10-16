"""Earnings endpoints (CRUD)."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/earnings", tags=["earnings"])


@router.get("", response_model=List[schemas.EarningOut])
def list_e(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    return db.query(models.Earning).order_by(models.Earning.date.desc()).all()


@router.post("", response_model=schemas.EarningOut, status_code=201)
def add_e(body: schemas.EarningIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = models.Earning(**body.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row


@router.put("/{item_id}", response_model=schemas.EarningOut)
def update_e(item_id: int, body: schemas.EarningIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = db.get(models.Earning, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row


@router.delete("/{item_id}", status_code=204)
def delete_e(item_id: int, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = db.get(models.Earning, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row); db.commit()
