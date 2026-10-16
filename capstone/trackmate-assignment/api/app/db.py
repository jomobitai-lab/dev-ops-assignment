"""Database setup (SQLAlchemy engine + session)."""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from .config import settings

url = settings.DATABASE_URL

# Some providers give a URL starting with "postgres://"; SQLAlchemy wants "postgresql://".
if url.startswith("postgres://"):
    url = url.replace("postgres://", "postgresql://", 1)

# SQLite needs a special flag; Postgres does not.
connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}

# pool_pre_ping keeps serverless/pooled connections healthy.
engine = create_engine(url, connect_args=connect_args, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency that gives one DB session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
