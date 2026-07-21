from __future__ import annotations

import json
from itertools import count

from fastapi.testclient import TestClient

from prooflab_api.challenges import CHALLENGES
from prooflab_api.curriculum import CURRICULUM_NODES, GUIDED_MISSIONS, curriculum_node_for_challenge
from prooflab_api.main import app
from prooflab_api.progress import GUIDED_CONCEPTS, concept_for_challenge


_account_numbers = count()


def account_client(track: str = "learner") -> TestClient:
    client = TestClient(app)
    number = next(_account_numbers)
    response = client.post(
        "/auth/register",
        json={
            "email": f"curriculum-{number}@example.test",
            "password": "prooflab-password",
            "goal": "practice-problems",
            "confidence": "developing",
            "activeTrack": track,
        },
    )
    assert response.status_code == 201
    return client


def _contains_private_contract(value: object) -> bool:
    serialized = json.dumps(value).lower()
    return any(field in serialized for field in ("canonicaltarget", "validatorkey", "accepted_answer", "rejected_answer", "comparator", "template_seed"))


def test_curriculum_catalog_is_account_owned_and_never_hard_gates_nodes() -> None:
    anonymous = TestClient(app)
    assert anonymous.get("/curriculum").status_code == 401

    client = account_client(track="professional")
    response = client.get("/curriculum")
    assert response.status_code == 200
    body = response.json()

    assert body["progressSummary"] == {
        "introducedConceptIds": [],
        "masteredConceptIds": [],
        "recommendedTrack": "professional",
    }
    assert len(body["nodes"]) == len(CURRICULUM_NODES)
    assert {node["id"] for node in body["nodes"]} == {node.id for node in CURRICULUM_NODES}
    assert {node["strand"] for node in body["nodes"]} >= {
        "Number & quantitative foundations",
        "Geometry & trigonometry",
        "Calculus",
        "Discrete math & probability",
        "Statistics & data",
        "Linear algebra & numerical methods",
        "Applied modeling & optimization",
    }
    assert all("available now" in item["reason"].lower() or item["catchUpNodeId"] for item in body["recommendations"])
    assert not _contains_private_contract(body)


def test_registry_maps_every_current_guided_mission_and_leetmath_challenge() -> None:
    mapped_mission_ids = {mission_id for node in CURRICULUM_NODES for mission_id in node.mission_ids}
    mapped_challenge_ids = {challenge_id for node in CURRICULUM_NODES for challenge_id in node.leet_math_challenge_ids}

    assert mapped_mission_ids == {mission.id for mission in GUIDED_MISSIONS}
    assert mapped_challenge_ids == {challenge.id for challenge in CHALLENGES}
    assert set(GUIDED_CONCEPTS) == mapped_mission_ids
    assert all(GUIDED_CONCEPTS[mission.id] for mission in GUIDED_MISSIONS)
    assert all(curriculum_node_for_challenge(challenge.id) is not None for challenge in CHALLENGES)
    assert all(concept_for_challenge(challenge.id) for challenge in CHALLENGES)


def test_curriculum_node_detail_exposes_only_public_guided_mission_metadata() -> None:
    client = account_client()
    response = client.get("/curriculum/calculus.derivatives")
    assert response.status_code == 200
    body = response.json()

    assert body["id"] == "calculus.derivatives"
    assert body["allowedExperiences"] == ["guided-prooflab", "leetmath"]
    assert {mission["id"] for mission in body["missions"]} == {
        "polynomial-derivative",
        "trig-chain-derivative",
        "product-rule-derivative",
        "repeated-derivative",
    }
    assert body["missions"][0]["curriculumNodeId"] == "calculus.derivatives"
    assert body["missions"][0]["allowedExperiences"] == ["guided-prooflab"]
    assert not _contains_private_contract(body)
    assert client.get("/curriculum/not-a-node").status_code == 404


def test_challenge_catalog_includes_the_curriculum_mapping_without_changing_existing_contracts() -> None:
    client = account_client()
    response = client.get("/challenges")
    assert response.status_code == 200
    catalog = response.json()

    assert len(catalog) == len(CHALLENGES)
    assert all(item["curriculumNodeId"] for item in catalog)
    assert all(item["strand"] for item in catalog)
    assert not _contains_private_contract(catalog)
