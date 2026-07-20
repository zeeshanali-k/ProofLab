from __future__ import annotations

import json

import pytest
from fastapi.testclient import TestClient

from prooflab_api.challenges import CHALLENGES
from prooflab_api.main import app


client = TestClient(app)
SUBMISSION_SESSION_ID = "6ee8ea9b-81a9-49fd-95c2-a97c4e28945b"


def _submission(latex: str, session_id: str = SUBMISSION_SESSION_ID) -> dict[str, str]:
    return {"latex": latex, "anonymousSessionId": session_id}


def _contains_private_fields(value: object) -> bool:
    serialized = json.dumps(value).lower()
    return any(field in serialized for field in ("canonicaltarget", "canonical_target", "validatorkey", "validator_key", "accepted_answer", "rejected_answer"))


def test_challenge_registry_has_the_planned_public_mix() -> None:
    assert len(CHALLENGES) == 30
    assert [challenge.id for challenge in CHALLENGES] == [f"{number:03d}" for number in range(1, 31)]
    assert {topic: sum(challenge.topic == topic for challenge in CHALLENGES) for topic in {challenge.topic for challenge in CHALLENGES}} == {
        "Algebra": 8,
        "Inequalities": 6,
        "Calculus": 9,
        "Complex": 7,
    }


def test_catalog_and_detail_routes_never_expose_private_contract_data() -> None:
    catalog = client.get("/challenges")
    assert catalog.status_code == 200
    assert len(catalog.json()) == 30
    assert not _contains_private_fields(catalog.json())

    for definition in CHALLENGES:
        detail = client.get(f"/challenges/{definition.id}")
        assert detail.status_code == 200
        assert detail.json()["id"] == definition.id
        assert not _contains_private_fields(detail.json())
        assert definition.canonical_target not in json.dumps(detail.json())


@pytest.mark.parametrize("definition", CHALLENGES, ids=lambda challenge: challenge.id)
def test_every_challenge_accepts_its_private_valid_contract_answer(definition) -> None:
    response = client.post(f"/challenges/{definition.id}/submit", json=_submission(definition.accepted_answer))
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "accepted"
    assert body["rule"]
    assert body["visualization"]["phase"] == "accepted"
    assert isinstance(body["submissionId"], int)
    assert body["attemptCount"] >= 1
    assert not _contains_private_fields(body)


@pytest.mark.parametrize("definition", CHALLENGES, ids=lambda challenge: challenge.id)
def test_every_challenge_rejects_its_private_negative_contract_answer_without_leaking_targets(definition) -> None:
    response = client.post(f"/challenges/{definition.id}/submit", json=_submission(definition.rejected_answer))
    assert response.status_code == 200
    body = response.json()
    expected_status = "format-error" if definition.id in {"022", "023"} else "incorrect"
    assert body["status"] == expected_status
    assert body["rule"] is None
    serialized = json.dumps(body)
    assert definition.canonical_target not in serialized
    assert "missingSolutionsLatex" not in serialized
    assert "expectedSolutionsLatex" not in serialized
    assert "verifiedRepairLatex" not in serialized


@pytest.mark.parametrize("challenge_id, latex, visualizer", [("003", "x < -2", "number-line"), ("005", "\\{2i\\}", "complex-plane")])
def test_visual_previews_are_learner_only_and_never_include_verdicts(challenge_id: str, latex: str, visualizer: str) -> None:
    response = client.post(f"/challenges/{challenge_id}/preview", json={"latex": latex})
    assert response.status_code == 200
    body = response.json()
    assert set(body) == {"visualization"}
    assert body["visualization"]["type"] == visualizer
    assert body["visualization"]["phase"] == "draft"
    assert "status" not in json.dumps(body)


def test_expanded_equation_noop_and_malformed_root_set_get_safe_rejections() -> None:
    no_op = client.post("/challenges/002/submit", json=_submission("(x + 2)^2 = 25"))
    assert no_op.json()["status"] == "incorrect"

    malformed = client.post("/challenges/005/submit", json=_submission("\\{2i"))
    assert malformed.json()["status"] == "format-error"


def test_submission_history_is_private_to_the_browser_session_and_contains_only_learner_data() -> None:
    owner_session = "cfcc8800-b43d-4983-9a80-10e813cfe224"
    other_session = "d751c5b5-0b85-451c-8dc6-92e9ee1c8104"

    accepted = client.post("/challenges/003/submit", json=_submission("x < -2", owner_session))
    rejected = client.post("/challenges/003/submit", json=_submission("x > -2", owner_session))
    assert accepted.json()["attemptCount"] == 1
    assert rejected.json()["attemptCount"] == 2

    history = client.get("/challenges/003/submissions", headers={"X-ProofLab-Session": owner_session})
    assert history.status_code == 200
    assert [(item["submittedLatex"], item["status"]) for item in history.json()] == [
        ("x > -2", "incorrect"),
        ("x < -2", "accepted"),
    ]
    assert not _contains_private_fields(history.json())
    assert all(set(item) == {"id", "challengeId", "submittedLatex", "status", "createdAt"} for item in history.json())

    private_history = client.get("/challenges/003/submissions", headers={"X-ProofLab-Session": other_session})
    assert private_history.status_code == 200
    assert private_history.json() == []


def test_submission_history_requires_a_valid_session_identifier() -> None:
    assert client.get("/challenges/003/submissions").status_code == 422
    assert client.get("/challenges/003/submissions", headers={"X-ProofLab-Session": "not-a-session"}).status_code == 422
