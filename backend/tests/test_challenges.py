from __future__ import annotations

import json
from itertools import count

import pytest
from fastapi.testclient import TestClient

from prooflab_api.challenges import CHALLENGES
from prooflab_api.main import app


_account_numbers = count()


def account_client() -> TestClient:
    client = TestClient(app)
    number = next(_account_numbers)
    response = client.post(
        "/auth/register",
        json={
            "email": f"challenge-{number}@example.test",
            "password": "prooflab-password",
            "goal": "practice-problems",
            "confidence": "developing",
        },
    )
    assert response.status_code == 201
    return client


def _contains_private_fields(value: object) -> bool:
    serialized = json.dumps(value).lower()
    return any(field in serialized for field in ("canonicaltarget", "canonical_target", "validatorkey", "validator_key", "accepted_answer", "rejected_answer"))


def test_challenge_routes_require_an_authenticated_account() -> None:
    anonymous = TestClient(app)
    assert anonymous.get("/challenges").status_code == 401
    assert anonymous.post("/challenges/001/submit", json={"latex": "x = 5"}).status_code == 401


def test_challenge_registry_has_the_planned_public_mix_without_private_contracts() -> None:
    client = account_client()
    assert len(CHALLENGES) == 30
    catalog = client.get("/challenges")
    assert catalog.status_code == 200
    assert len(catalog.json()) == 30
    assert not _contains_private_fields(catalog.json())
    for definition in CHALLENGES:
        detail = client.get(f"/challenges/{definition.id}")
        assert detail.status_code == 200
        assert definition.canonical_target not in json.dumps(detail.json())


@pytest.mark.parametrize("definition", CHALLENGES, ids=lambda challenge: challenge.id)
def test_every_challenge_records_account_owned_submissions_without_leaking_contracts(definition) -> None:
    client = account_client()
    response = client.post(f"/challenges/{definition.id}/submit", json={"latex": definition.accepted_answer})
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "accepted"
    assert isinstance(body["submissionId"], int)
    assert body["attemptCount"] == 1
    assert body["earnedXp"] > 0
    assert not _contains_private_fields(body)


@pytest.mark.parametrize("definition", CHALLENGES, ids=lambda challenge: challenge.id)
def test_every_challenge_rejects_private_negative_contracts(definition) -> None:
    client = account_client()
    body = client.post(f"/challenges/{definition.id}/submit", json={"latex": definition.rejected_answer}).json()
    expected_status = "format-error" if definition.id in {"022", "023"} else "incorrect"
    assert body["status"] == expected_status
    assert body["earnedXp"] == 0
    assert definition.canonical_target not in json.dumps(body)


def test_submission_history_is_private_to_the_authenticated_account() -> None:
    owner = account_client()
    other = account_client()
    assert owner.post("/challenges/003/submit", json={"latex": "x < -2"}).status_code == 200
    assert owner.post("/challenges/003/submit", json={"latex": "x > -2"}).status_code == 200

    history = owner.get("/challenges/003/submissions")
    assert [(item["submittedLatex"], item["status"]) for item in history.json()] == [("x > -2", "incorrect"), ("x < -2", "accepted")]
    assert other.get("/challenges/003/submissions").json() == []


def test_catalog_progress_marks_wrong_attempts_and_accepted_solutions_per_account() -> None:
    owner = account_client()
    other = account_client()
    assert owner.post("/challenges/001/submit", json={"latex": "x = 4"}).status_code == 200
    assert owner.get("/challenges/progress").json() == [{"challengeId": "001", "status": "attempting", "attemptCount": 1}]
    assert other.get("/challenges/progress").json() == []

    assert owner.post("/challenges/001/submit", json={"latex": "x = 5"}).status_code == 200
    assert owner.get("/challenges/progress").json() == [{"challengeId": "001", "status": "solved", "attemptCount": 2}]


def test_xp_is_idempotent_and_mastery_requires_three_distinct_accepted_activities() -> None:
    client = account_client()
    first = client.post("/challenges/001/submit", json={"latex": "x = 5"}).json()
    retry = client.post("/challenges/001/submit", json={"latex": "x = 5"}).json()
    assert first["earnedXp"] == 35
    assert retry["earnedXp"] == 0

    assert client.post("/challenges/006/submit", json={"latex": "x = 5"}).json()["masteryStatus"] == "practicing"
    final = client.post("/challenges/008/submit", json={"latex": "x = 9"}).json()
    assert final["masteryStatus"] == "mastered"
    dashboard = client.get("/me/dashboard").json()
    algebra = next(item for item in dashboard["mastery"] if item["conceptId"] == "algebra.linear-equations")
    assert algebra["distinctSuccesses"] == 3
    assert algebra["firstTrySuccesses"] >= 1


def test_preview_is_authenticated_but_never_returns_a_verdict() -> None:
    client = account_client()
    response = client.post("/challenges/003/preview", json={"latex": "x < -2"})
    assert response.status_code == 200
    assert response.json()["visualization"]["phase"] == "draft"
    assert "status" not in json.dumps(response.json())
