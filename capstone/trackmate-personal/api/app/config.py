"""App configuration read from environment variables."""
import os


class Settings:
    # Database: use DATABASE_URL if set (Neon/Postgres), else a local SQLite file.
    DATABASE_URL: str = os.getenv("DATABASE_URL") or "sqlite:///./trackmate.db"

    # Single-user login password (set this in .env / Vercel env).
    APP_PASSWORD: str = os.getenv("APP_PASSWORD", "changeme")

    # Secret used to sign login tokens (set a long random value in production).
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")

    # How long a login stays valid (hours).
    TOKEN_HOURS: int = int(os.getenv("TOKEN_HOURS", "720"))  # 30 days


settings = Settings()
