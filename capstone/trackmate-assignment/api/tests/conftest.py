"""Test setup: run the app against a throwaway SQLite DB with a known password.

Imported by pytest before the test modules, so these env vars are in place
before `app.main` (which builds the DB engine on import) is loaded.
"""
import os
import pathlib
import sys
import tempfile

# Make the `app` package importable no matter where pytest is invoked from.
API_DIR = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(API_DIR))

os.environ["APP_PASSWORD"] = "testpass"
os.environ["SECRET_KEY"] = "test-secret"

_db = pathlib.Path(tempfile.gettempdir()) / "trackmate_test.db"
if _db.exists():
    _db.unlink()
os.environ["DATABASE_URL"] = f"sqlite:///{_db}"
