"""TrackMate API — FastAPI application."""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import inspect, text, select, func
from prometheus_fastapi_instrumentator import Instrumentator

from .db import Base, engine, get_db
from . import models  # noqa: F401  (registers the tables)
from .seed import seed_exercises, TEMPLATES
from .auth import check_password, create_token
from . import schemas
from .routers import (
    exercises, workouts, body_weight, nutrition,
    earnings, achievements, sleep, goals, stats, plans, profile,
)

app = FastAPI(title="TrackMate API", version="1.0.0")

# Allow the frontend to call the API (personal app — open CORS is fine).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Expose Prometheus metrics at /metrics for scraping (request count, latency…).
Instrumentator().instrument(app).expose(app, endpoint="/metrics")


# Columns added after the first release — added to existing DBs on startup so
# older databases keep working without a manual reset (lightweight auto-migrate).
_NEW_COLUMNS = {
    "exercises": [
        ("target_part", "VARCHAR(80) DEFAULT ''"),
        ("body_parts", "VARCHAR(120) DEFAULT ''"),
    ],
}


def _migrate():
    """Add any missing columns to existing tables (SQLite & Postgres safe)."""
    insp = inspect(engine)
    existing = set(insp.get_table_names())
    for table, columns in _NEW_COLUMNS.items():
        if table not in existing:
            continue
        have = {c["name"] for c in insp.get_columns(table)}
        with engine.begin() as conn:
            for name, ddl in columns:
                if name not in have:
                    conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {name} {ddl}"))


def _backfill(db):
    """Fill target_part / body_parts on seeded exercises that pre-date them."""
    by_name = {t[0]: (t[3], t[4]) for t in TEMPLATES}
    changed = False
    for ex in db.query(models.Exercise).all():
        if (not ex.target_part) and ex.name in by_name:
            ex.target_part, ex.body_parts = by_name[ex.name]
            changed = True
    if changed:
        db.commit()


def init_db():
    """Create tables if missing, migrate older DBs, and seed the library."""
    Base.metadata.create_all(bind=engine)   # creates any brand-new tables
    _migrate()                              # adds new columns to old tables
    db = next(get_db())
    try:
        seed_exercises(db)
        _backfill(db)
    finally:
        db.close()


# Runs once when the module loads (works for local + serverless cold start).
init_db()


@app.get("/health")
def health():
    """Liveness: the process is up (cheap, no dependencies)."""
    return {"status": "UP"}


@app.get("/ready")
def ready(db: Session = Depends(get_db)):
    """Readiness: can we actually serve traffic? Verifies database access."""
    db.execute(select(func.count(models.Exercise.id)))
    return {"status": "READY"}


# Kept for the frontend's existing health check (same as /health).
@app.get("/api/health")
def api_health():
    return {"status": "ok"}


@app.post("/api/login", response_model=schemas.TokenOut)
def login(body: schemas.LoginIn):
    if not check_password(body.password):
        raise HTTPException(401, "Wrong password")
    return {"token": create_token()}


# Register all feature routers.
for r in (exercises, workouts, body_weight, nutrition,
          earnings, achievements, sleep, goals, stats, plans, profile):
    app.include_router(r.router)
