from __future__ import annotations

import json
from itertools import count

from fastapi.testclient import TestClient

from prooflab_api.database import PracticeInstance, get_session_factory
from prooflab_api.foundations import FOUNDATION_TEMPLATES, check_foundation_response, generate_foundation_practice
from prooflab_api.main import app
from prooflab_api.practice import private_payload


_accounts = count()


def _client() -> TestClient:
    client = TestClient(app)
    number = next(_accounts)
    response = client.post(
        "/auth/register",
        json={
            "email": f"foundation-{number}@example.test",
            "password": "prooflab-password",
            "goal": "understand-concepts",
            "confidence": "new",
            "activeTrack": "explorer",
        },
    )
    assert response.status_code == 201
    return client


def _answer_for(instance_id: str) -> str:
    with get_session_factory()() as db:
        instance = db.get(PracticeInstance, instance_id)
        assert instance is not None
        values = private_payload(instance)
        numerator, denominator = int(values["canonicalNumerator"]), int(values["canonicalDenominator"])
        return str(numerator) if denominator == 1 else f"{numerator}/{denominator}"


def test_all_twenty_templates_are_seeded_and_accept_their_canonical_quantity() -> None:
    assert len(FOUNDATION_TEMPLATES) == 20
    assert {template.node_id for template in FOUNDATION_TEMPLATES} == {
        "foundations.counting-place-value", "foundations.integers-operations", "foundations.order-factors-multiples",
        "foundations.fractions", "foundations.decimals", "foundations.percentages", "foundations.ratios-rates-proportions",
        "foundations.units-measurement", "foundations.estimation", "foundations.financial-arithmetic",
    }
    for index, template in enumerate(FOUNDATION_TEMPLATES, start=1):
        practice = generate_foundation_practice(template, index)
        answer = str(practice.canonical_answer.numerator) if practice.canonical_answer.denominator == 1 else f"{practice.canonical_answer.numerator}/{practice.canonical_answer.denominator}"
        accepted, _, normalized = check_foundation_response(practice, answer)
        assert accepted, template.id
        assert normalized
        rejected, _, _ = check_foundation_response(practice, "not a number")
        assert not rejected


def test_financial_template_seeds_cover_every_authored_usd_context() -> None:
    template = next(item for item in FOUNDATION_TEMPLATES if item.id == "foundation-finance-practice")
    prompts = [generate_foundation_practice(template, seed).prompt.lower() for seed in range(1, 250)]
    assert any("off" in prompt for prompt in prompts)
    assert any("sales tax" in prompt for prompt in prompts)
    assert any("tip" in prompt for prompt in prompts)
    assert any("unit price" in prompt for prompt in prompts)
    assert any("weekly budget" in prompt for prompt in prompts)
    assert any("simple interest" in prompt for prompt in prompts)


def test_practice_lifecycle_hides_private_answers_and_only_awards_each_template_once() -> None:
    client = _client()
    template_id = "foundation-finance-practice"
    first = client.post("/practice/next", json={"templateId": template_id})
    assert first.status_code == 200
    public = first.json()
    assert public["status"] == "active"
    assert all(secret not in json.dumps(public).lower() for secret in ("seed", "canonical", "privatepayload", "tolerance"))

    resumed = client.post("/practice/next", json={"templateId": template_id})
    assert resumed.json()["instanceId"] == public["instanceId"]
    assert client.post(f"/practice/{public['instanceId']}/verify", json={"response": "wrong"}).json()["status"] == "invalid"
    incorrect = client.post(f"/practice/{public['instanceId']}/submit", json={"response": "wrong"})
    assert incorrect.json()["status"] == "invalid"

    accepted = client.post(f"/practice/{public['instanceId']}/submit", json={"response": _answer_for(public['instanceId'])})
    assert accepted.status_code == 200
    assert accepted.json()["status"] == "valid"
    assert accepted.json()["earnedXp"] == 25
    assert client.get(f"/practice/{public['instanceId']}").json()["status"] == "completed"

    fresh = client.post("/practice/next", json={"templateId": template_id, "restart": True}).json()
    assert fresh["instanceId"] != public["instanceId"]
    repeated = client.post(f"/practice/{fresh['instanceId']}/submit", json={"response": _answer_for(fresh['instanceId'])})
    assert repeated.json()["earnedXp"] == 0


def test_two_distinct_foundation_activities_master_their_module_and_are_account_owned() -> None:
    owner, stranger = _client(), _client()
    instance_ids = []
    for template_id in ("foundation-fractions-visual", "foundation-fractions-practice"):
        instance = owner.post("/practice/next", json={"templateId": template_id}).json()
        instance_ids.append(instance["instanceId"])
        owner.post(f"/practice/{instance['instanceId']}/submit", json={"response": "wrong"})
        result = owner.post(f"/practice/{instance['instanceId']}/submit", json={"response": _answer_for(instance['instanceId'])})
        assert result.json()["status"] == "valid"
    assert stranger.get(f"/practice/{instance_ids[0]}").status_code == 404
    dashboard = owner.get("/me/dashboard").json()
    mastery = next(item for item in dashboard["mastery"] if item["conceptId"] == "foundations.fractions")
    assert mastery["status"] == "mastered"
    assert mastery["distinctSuccesses"] == 2
