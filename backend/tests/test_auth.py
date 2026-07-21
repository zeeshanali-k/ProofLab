from __future__ import annotations

from itertools import count

from fastapi.testclient import TestClient

from prooflab_api.database import AuthSession, get_session_factory, utc_now
from prooflab_api.main import app


_emails = count()


def credentials(**overrides: str) -> dict[str, str]:
    email = f"learner-{next(_emails)}@example.test"
    payload = {
        "email": email,
        "password": "prooflab-password",
        "goal": "understand-concepts",
        "confidence": "new",
    }
    payload.update(overrides)
    return payload


def registered_client(payload: dict[str, str] | None = None) -> tuple[TestClient, dict[str, str]]:
    client = TestClient(app)
    payload = payload or credentials()
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    return client, payload


def test_register_validates_password_and_rejects_duplicate_email() -> None:
    client = TestClient(app)
    payload = credentials()
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    assert response.json()["profile"]["activeTrack"] == "explorer"
    assert "prooflab_session" in response.headers["set-cookie"]
    assert client.post("/auth/register", json=payload).status_code == 409
    assert client.post("/auth/register", json=credentials(password="too-short")).status_code == 422


def test_login_failure_message_is_identical_for_unknown_and_wrong_password() -> None:
    client, payload = registered_client()
    wrong_password = client.post("/auth/login", json={"email": payload["email"], "password": "wrong-password"})
    unknown = client.post("/auth/login", json={"email": "missing@example.test", "password": "wrong-password"})
    assert wrong_password.status_code == unknown.status_code == 401
    assert wrong_password.json()["detail"] == unknown.json()["detail"] == "Invalid email or password."


def test_login_session_restoration_logout_and_expiry() -> None:
    client, payload = registered_client()
    assert client.get("/auth/me").status_code == 200
    assert client.post("/auth/logout").status_code == 204
    assert client.get("/auth/me").status_code == 401
    assert client.post("/auth/login", json={"email": payload["email"], "password": payload["password"]}).status_code == 200
    with get_session_factory()() as db:
        session = db.query(AuthSession).order_by(AuthSession.created_at.desc()).first()
        assert session is not None
        session.expires_at = utc_now().replace(year=2000)
        db.commit()
    assert client.get("/auth/me").status_code == 401


def test_profile_updates_are_private_and_strict() -> None:
    first, _ = registered_client()
    second, _ = registered_client()
    response = first.patch("/me/profile", json={"activeTrack": "professional", "gamificationEnabled": False})
    assert response.status_code == 200
    assert response.json()["profile"]["activeTrack"] == "professional"
    assert second.get("/auth/me").json()["profile"]["activeTrack"] == "explorer"
    assert first.patch("/me/profile", json={"activeTrack": "leader"}).status_code == 422
