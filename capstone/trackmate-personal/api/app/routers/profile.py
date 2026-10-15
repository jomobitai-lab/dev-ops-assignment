"""Single-user profile / preferences."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..auth import require_auth
from .. import models, schemas

router = APIRouter(prefix="/api/profile", tags=["profile"])


def _get_or_create(db: Session) -> models.Profile:
    p = db.query(models.Profile).first()
    if not p:
        p = models.Profile()
        db.add(p)
        db.commit()
        db.refresh(p)
    return p


@router.get("", response_model=schemas.ProfileOut)
def get_profile(db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    return _get_or_create(db)


@router.put("", response_model=schemas.ProfileOut)
def update_profile(body: schemas.ProfileIn,
                   db: Session = Depends(get_db), _: bool = Depends(require_auth)):
    p = _get_or_create(db)
    p.name = body.name
    p.height_cm = body.height_cm
    p.default_rest_seconds = body.default_rest_seconds
    p.weekly_goal = body.weekly_goal
    db.commit()
    db.refresh(p)
    return p
