from fastapi.testclient import TestClient

from prooflab_api.config import load_backend_environment
from prooflab_api.main import app
from prooflab_api.teaching import (
    LocalEvidenceTeachingProvider,
    OllamaTeachingProvider,
    OpenAICompatibleTeachingProvider,
    get_teaching_provider,
)


client = TestClient(app)


def step(identifier: str, latex: str, kind: str) -> dict[str, str]:
    return {"id": identifier, "latex": latex, "kind": kind}


def verify(mode: str, previous: dict[str, str], next_step: dict[str, str]) -> dict:
    response = client.post("/verify", json={"mode": mode, "previousStep": previous, "nextStep": next_step})
    assert response.status_code == 200
    return response.json()


def test_health_endpoint_is_ready() -> None:
    assert client.get("/health").json() == {"status": "ok"}


def test_preserves_valid_and_invalid_algebra_behaviour() -> None:
    valid = verify(
        "algebra",
        step("s1", "(x + 2)^2 = 25", "equation"),
        step("s2", "x^2 + 4x + 4 = 25", "equation"),
    )
    assert valid["status"] == "valid"
    assert valid["rule"] == "expand-square"

    invalid = verify(
        "algebra",
        step("s1", "(x + 2)^2 = 25", "equation"),
        step("s2", "x^2 + 4 = 25", "equation"),
    )
    assert invalid["status"] == "invalid"
    assert invalid["likelyMissingTerm"] == "4 x"
    assert invalid["evidence"]["kind"] == "evaluation"
    assert invalid["evidence"]["inputLatex"] == "x = 3"


def test_solution_substitution_remains_supported() -> None:
    result = verify(
        "algebra",
        step("s1", "x^2 - 5x + 6 = 0", "equation"),
        step("s2", "x = 2", "equation"),
    )
    assert result["status"] == "valid"
    assert result["rule"] == "solution-substitution"


def test_derivative_mode_returns_exact_and_sampled_evidence() -> None:
    valid = verify(
        "derivative",
        step("s1", "f(x) = x^3 + 2x", "function"),
        step("s2", "f'(x) = 3x^2 + 2", "derivative"),
    )
    assert valid["status"] == "valid"
    assert valid["rule"] == "differentiate-polynomial"

    invalid = verify(
        "derivative",
        step("s1", "f(x) = x^3 + 2x", "function"),
        step("s2", "f'(x) = 3x + 2", "derivative"),
    )
    assert invalid["status"] == "invalid"
    assert invalid["evidence"]["kind"] == "derivative-check"
    assert invalid["verifiedRepairLatex"] == "f'(x) = 3 x^{2} + 2"


def test_derivative_mode_accepts_mathlive_prime_notation() -> None:
    result = verify(
        "derivative",
        step("s1", "f(x) = x^2", "function"),
        step("s2", "f^{\\prime}(x) = 2x", "derivative"),
    )
    assert result["status"] == "valid"


def test_derivative_mode_honestly_rejects_trigonometry() -> None:
    result = verify(
        "derivative",
        step("s1", "f(x) = sin(x)", "function"),
        step("s2", "f'(x) = cos(x)", "derivative"),
    )
    assert result["status"] == "unsupported"


def test_complex_simplification_compares_both_components() -> None:
    valid = verify(
        "complex-simplify",
        step("s1", "(2 + 3i)(1 - 2i)", "expression"),
        step("s2", "8 - i", "expression"),
    )
    assert valid["status"] == "valid"

    invalid = verify(
        "complex-simplify",
        step("s1", "(2 + 3i)(1 - 2i)", "expression"),
        step("s2", "8 + i", "expression"),
    )
    assert invalid["status"] == "invalid"
    assert invalid["evidence"]["kind"] == "complex-comparison"


def test_complex_solution_set_requires_both_rational_imaginary_roots() -> None:
    incomplete = verify(
        "complex-solve",
        step("s1", "x^2 + 4 = 0", "equation"),
        step("s2", "\\{2i\\}", "solution-set"),
    )
    assert incomplete["status"] == "invalid"
    assert incomplete["evidence"]["missingSolutionsLatex"] == ["- 2 i"]

    complete = verify(
        "complex-solve",
        step("s1", "x^2 + 4 = 0", "equation"),
        step("s2", "\\{2i,-2i\\}", "solution-set"),
    )
    assert complete["status"] == "valid"
    assert complete["rule"] == "complex-solution-set"


def test_local_provider_is_available_without_a_model(monkeypatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "local")
    assert isinstance(get_teaching_provider(), LocalEvidenceTeachingProvider)
    response = client.post(
        "/explain",
        json={
            "mode": "repair",
            "previousStep": "(x+2)^2 = 25",
            "nextStep": "x^2 + 4 = 25",
            "verification": {
                "status": "invalid",
                "summary": "The expanded expression is missing a term.",
                "verifiedRepairLatex": "x^2 + 4x + 4 = 25",
            },
        },
    )
    assert response.status_code == 200
    assert response.json()["repairLatex"] == "x^2 + 4x + 4 = 25"


def test_provider_selection_preserves_ollama_and_openai_compatible(monkeypatch) -> None:
    monkeypatch.setenv("AI_PROVIDER", "ollama")
    assert isinstance(get_teaching_provider(), OllamaTeachingProvider)
    monkeypatch.setenv("AI_PROVIDER", "openai-compatible")
    assert isinstance(get_teaching_provider(), OpenAICompatibleTeachingProvider)


def test_local_env_files_load_without_overriding_exported_values(tmp_path, monkeypatch) -> None:
    project_dir = tmp_path / "prooflab"
    package_dir = project_dir / "backend" / "prooflab_api"
    package_dir.mkdir(parents=True)
    (project_dir / ".env").write_text("AI_PROVIDER=openai-compatible\n", encoding="utf-8")
    (package_dir.parent / ".env").write_text("AI_PROVIDER=ollama\n", encoding="utf-8")
    (package_dir / ".env").write_text("AI_PROVIDER=local\n", encoding="utf-8")

    monkeypatch.delenv("AI_PROVIDER", raising=False)
    load_backend_environment(package_dir)
    assert isinstance(get_teaching_provider(), LocalEvidenceTeachingProvider)

    monkeypatch.setenv("AI_PROVIDER", "openai-compatible")
    load_backend_environment(package_dir)
    assert isinstance(get_teaching_provider(), OpenAICompatibleTeachingProvider)
