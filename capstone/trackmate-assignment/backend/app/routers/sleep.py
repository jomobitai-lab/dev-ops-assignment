"""Sleep endpoints (CRUD). Hours are computed from sleep/wake times."""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/sleep", tags=["sleep"])


def _hours(sleep_time, wake_time) -> float:
    delta = (wake_time - sleep_time).total_seconds() / 3600.0
    return round(delta, 2) if delta >= 0 else 0.0


@router.get("", response_model=List[schemas.SleepOut])
def list_s(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    return db.query(models.SleepLog).order_by(models.SleepLog.date).all()


@router.post("", response_model=schemas.SleepOut, status_code=201)
def add_s(body: schemas.SleepIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = models.SleepLog(
        date=body.date, sleep_time=body.sleep_time, wake_time=body.wake_time,
        hours=_hours(body.sleep_time, body.wake_time),
    )
    db.add(row); db.commit(); db.refresh(row)
    return row


@router.put("/{item_id}", response_model=schemas.SleepOut)
def update_s(item_id: int, body: schemas.SleepIn, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = db.get(models.SleepLog, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    row.date, row.sleep_time, row.wake_time = body.date, body.sleep_time, body.wake_time
    row.hours = _hours(body.sleep_time, body.wake_time)
    db.commit(); db.refresh(row)
    return row


@router.delete("/{item_id}", status_code=204)
def delete_s(item_id: int, db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    row = db.get(models.SleepLog, item_id)
    if not row:
        raise HTTPException(404, "Not found")
    db.delete(row); db.commit()
