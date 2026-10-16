"""Body weight endpoints (CRUD)."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/body-weight", tags=["body-weight"])


@router.get("", response_model=List[schemas.BodyWeightOut])
def list_bw(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    return db.query(models.BodyWeight).order_by(models.BodyWeight.date).all()


@router.post("", response_model=schemas.BodyWeightOut, status_code=201)
def add_bw(body: schemas.BodyWeightIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = models.BodyWeight(**body.model_dump())
    db.add(row); db.commit(); db.refresh(row)
    return row


@router.put("/{item_id}", response_model=schemas.BodyWeightOut)
def update_bw(item_id: int, body: schemas.BodyWeightIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = db.get(models.BodyWeight, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    for k, v in body.model_dump().items():
        setattr(row, k, v)
    db.commit(); db.refresh(row)
    return row


@router.delete("/{item_id}", status_code=204)
def delete_bw(item_id: int, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = db.get(models.BodyWeight, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row); db.commit()
