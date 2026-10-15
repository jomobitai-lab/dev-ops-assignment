"""TrackMate API — FastAPI application."""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from .db import Base, engine, get_db
from . import models  # noqa: F401  (registers the tables)
from .seed import seed_exercises
from .auth import check_password, create_token
from . import schemas
from .routers import (
    exercises, workouts, body_weight, nutrition,
    earnings, achievements, sleep, goals, stats, plans,
)

app = FastAPI(title="TrackMate API", version="1.0.0")

# Allow the frontend to call the API (personal app — open CORS is fine).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def init_db():
    """Create tables if missing and seed the exercise library."""
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        seed_exercises(db)
    finally:
        db.close()


# Runs once when the module loads (works for local + serverless cold start).
init_db()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/login", response_model=schemas.TokenOut)
def login(body: schemas.LoginIn):
    if not check_password(body.password):
        raise HTTPException(401, "Wrong password")
    return {"token": create_token()}


# Register all feature routers.
for r in (exercises, workouts, body_weight, nutrition,
          earnings, achievements, sleep, goals, stats, plans):
    app.include_router(r.router)
