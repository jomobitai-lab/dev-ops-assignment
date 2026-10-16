# TrackMate API — FastAPI served by uvicorn.
# Build context: this directory (capstone/trackmate-assignment/backend).
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

# curl is only needed for the container HEALTHCHECK below.
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies first so this layer is cached across code changes.
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Alembic migrations + application code.
COPY alembic.ini ./
COPY alembic ./alembic
COPY app ./app

# Drop root privileges.
RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# Fails the container's health status if the API stops responding.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD curl -fsS http://localhost:8000/health || exit 1

# Apply DB migrations, then start the API. (uvicorn --workers scales request handling.)
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2"]
