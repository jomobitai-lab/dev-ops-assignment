"""Smoke + contract tests for the TrackMate API (run in CI against SQLite)."""
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def _auth():
    r = client.post("/api/login", json={"password": "testpass"})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['token']}"}


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "UP"


def test_ready_checks_db():
    r = client.get("/ready")
    assert r.status_code == 200
    assert r.json()["status"] == "READY"


def test_metrics_exposed():
    r = client.get("/metrics")
    assert r.status_code == 200
    # Prometheus exposition format
    assert "http_requests" in r.text or "# HELP" in r.text


def test_login_wrong_password():
    assert client.post("/api/login", json={"password": "nope"}).status_code == 401


def test_protected_route_needs_auth():
    assert client.get("/api/exercises").status_code == 401


def test_exercises_seeded_with_targets():
    data = client.get("/api/exercises", headers=_auth()).json()
    assert len(data) > 0
    # the schema fields added for the body map must be present
    assert all("target_part" in e and "body_parts" in e for e in data)


def test_workout_plan_crud():
    h = _auth()
    exercises = client.get("/api/exercises", headers=h).json()
    body = {
        "name": "Test Plan",
        "muscle_groups": "Chest",
        "items": [{"exercise_id": exercises[0]["id"], "position": 0}],
    }
    created = client.post("/api/plans", headers=h, json=body)
    assert created.status_code == 201
    plan = created.json()
    assert plan["items"][0]["exercise_name"] == exercises[0]["name"]
    assert client.delete(f"/api/plans/{plan['id']}", headers=h).status_code == 204


def test_custom_exercise_derives_body_parts():
    h = _auth()
    r = client.post("/api/exercises", headers=h, json={"name": "My Lift", "muscle_group": "Back"})
    assert r.status_code == 201
    created = r.json()
    assert created["is_custom"] == 1
    assert created["body_parts"]  # auto-derived from the muscle group


def test_profile_round_trip():
    h = _auth()
    r = client.put("/api/profile", headers=h, json={
        "name": "Tester", "height_cm": 180, "default_rest_seconds": 120, "weekly_goal": 4,
    })
    assert r.status_code == 200
    assert client.get("/api/profile", headers=h).json()["default_rest_seconds"] == 120
