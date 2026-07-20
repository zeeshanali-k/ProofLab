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


def test_inequality_mode_normalizes_linear_regions_and_returns_number_line_evidence() -> None:
    valid = verify(
        "inequality",
        step("s1", "-2x + 3 > 7", "inequality"),
        step("s2", "-2x > 4", "inequality"),
    )
    assert valid["status"] == "valid"
    assert valid["rule"] == "inequality-region-preserved"
    assert valid["evidence"]["kind"] == "inequality-region"
    assert valid["evidence"]["previousRegion"] == {"boundaryLatex": "-2", "direction": "left", "inclusive": False}
    assert valid["evidence"]["testValueLatex"] == "0"
    assert valid["evidence"]["previousIncludesTest"] is False
    assert 0 <= valid["evidence"]["numberLine"]["testValuePosition"] <= 100

    corrected = verify(
        "inequality",
        step("s2", "-2x > 4", "inequality"),
        step("s3", "x < -2", "inequality"),
    )
    assert corrected["status"] == "valid"


def test_inequality_mode_handles_inclusivity_and_exposes_sign_flip_counterexamples() -> None:
    inclusive = verify(
        "inequality",
        step("s1", "x - 3 \\leq 0", "inequality"),
        step("s2", "x ≤ 3", "inequality"),
    )
    assert inclusive["status"] == "valid"
    assert inclusive["evidence"]["previousRegion"]["inclusive"] is True

    endpoint_mistake = verify(
        "inequality",
        step("s1", "x - 3 \\le 0", "inequality"),
        step("s2", "x < 3", "inequality"),
    )
    assert endpoint_mistake["status"] == "invalid"
    assert endpoint_mistake["rule"] == "inequality-region-mismatch"
    assert endpoint_mistake["evidence"]["testValueLatex"] == "3"
    assert endpoint_mistake["evidence"]["previousIncludesTest"] is True
    assert endpoint_mistake["evidence"]["submittedIncludesTest"] is False

    sign_flip = verify(
        "inequality",
        step("s2", "-2x > 4", "inequality"),
        step("s3", "x > -2", "inequality"),
    )
    assert sign_flip["status"] == "invalid"
    assert sign_flip["rule"] == "inequality-sign-flip"
    assert sign_flip["evidence"]["testValueLatex"] == "0"
    assert sign_flip["evidence"]["previousIncludesTest"] is False
    assert sign_flip["evidence"]["submittedIncludesTest"] is True
    assert sign_flip["verifiedRepairLatex"] == "x < -2"


def test_inequality_mode_rejects_non_linear_constant_and_chained_claims() -> None:
    for latex in ("x^2 < 4", "2 < 4", "x < 2 < 3"):
        result = verify(
            "inequality",
            step("s1", latex, "inequality"),
            step("s2", "x < 3", "inequality"),
        )
        assert result["status"] == "unsupported"


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


def test_derivative_mode_supports_trigonometry_chain_rules_and_repeated_notation() -> None:
    trig = verify(
        "derivative",
        step("s1", "f(x) = \\sin(3x^2 + 1)", "function"),
        step("s2", "f'(x) = 6x\\cos(3x^2 + 1)", "derivative"),
    )
    assert trig["status"] == "valid"
    assert trig["rule"] == "differentiate-trigonometric"

    repeated = verify(
        "derivative",
        step("s2", "f'(x) = 3x^2 + \\cos(x)", "derivative"),
        step("s3", "f^{\\prime\\prime}(x) = 6x - \\sin(x)", "derivative"),
    )
    assert repeated["status"] == "valid"

    tangent = verify(
        "derivative",
        step("s1", "f(x) = \\tan(2x)", "function"),
        step("s2", "f'(x) = 2\\tan(2x)^2 + 2", "derivative"),
    )
    assert tangent["status"] == "valid"


def test_derivative_mode_coaches_same_skipped_and_backward_derivative_orders_without_an_answer() -> None:
    same_order = verify(
        "derivative",
        step("s2", "f'(x) = 6x\\cos(3x^2 + 1)", "derivative"),
        step("s3", "f'(x) = 36x\\sin(3x^2 + 1)", "derivative"),
    )
    assert same_order["status"] == "invalid"
    assert same_order["rule"] == "derivative-order"
    assert "f''(x)" in same_order["summary"]
    assert "product rule" in same_order["summary"]
    assert "chain rule" in same_order["summary"]
    assert same_order["evidence"] is None
    assert same_order["verifiedRepairLatex"] is None

    skipped_order = verify(
        "derivative",
        step("s1", "f(x) = x^3", "function"),
        step("s2", "f''(x) = 6x", "derivative"),
    )
    assert skipped_order["status"] == "invalid"
    assert skipped_order["rule"] == "derivative-order"
    assert "f'(x)" in skipped_order["summary"]

    backward_order = verify(
        "derivative",
        step("s2", "f''(x) = 6x", "derivative"),
        step("s3", "f'(x) = 3x^2", "derivative"),
    )
    assert backward_order["status"] == "invalid"
    assert backward_order["rule"] == "derivative-order"
    assert "f'''(x)" in backward_order["summary"]


def test_integral_mode_checks_restricted_antiderivatives_and_requires_c() -> None:
    valid = verify(
        "integral",
        step("s1", "\\int 3x^2 + \\cos(2x + 1)\\, dx", "expression"),
        step("s2", "F(x) = x^3 + \\frac{1}{2}\\sin(2x + 1) + C", "antiderivative"),
    )
    assert valid["status"] == "valid"
    assert valid["rule"] == "indefinite-integral"

    missing_constant = verify(
        "integral",
        step("s1", "\\int x^2 \\, dx", "expression"),
        step("s2", "F(x) = \\frac{1}{3}x^3", "antiderivative"),
    )
    assert missing_constant["status"] == "invalid"
    assert "+ C" in missing_constant["summary"]

    unsupported = verify(
        "integral",
        step("s1", "\\int \\tan(x) \\, dx", "expression"),
        step("s2", "F(x) = x + C", "antiderivative"),
    )
    assert unsupported["status"] == "unsupported"


def assess(mode: str, given: dict[str, str], terminal: dict[str, str], steps: list[dict[str, str]], goal: dict | None) -> dict:
    response = client.post(
        "/assess-completion",
        json={
            "mode": mode,
            "givenStep": given,
            "terminalLearnerStep": terminal,
            "learnerSteps": steps,
            "canonicalGoal": goal,
        },
    )
    assert response.status_code == 200
    return response.json()


def test_completion_reports_canonical_status_without_disclosing_an_answer() -> None:
    given = step("s1", "f(x) = x^3 + \\sin(x)", "function")
    first = step("s2", "f'(x) = 3x^2 + \\cos(x)", "derivative")
    second = step("s3", "f''(x) = 6x - \\sin(x)", "derivative")
    complete = assess(
        "derivative",
        given,
        second,
        [first, second],
        {"kind": "derivative", "terminalDerivativeOrder": 2},
    )
    assert complete == {"status": "complete"}

    in_progress = assess(
        "derivative",
        given,
        first,
        [first],
        {"kind": "derivative", "terminalDerivativeOrder": 2},
    )
    assert in_progress == {"status": "in-progress"}

    bad_first = step("s2", "f'(x) = 3x^2 + \\sin(x)", "derivative")
    needs_correction = assess(
        "derivative",
        given,
        second,
        [bad_first, second],
        {"kind": "derivative", "terminalDerivativeOrder": 2},
    )
    assert needs_correction == {"status": "needs-correction"}

    open_ended = assess("integral", step("s1", "\\int x \\, dx", "expression"), step("s2", "F(x) = x^2 + C", "antiderivative"), [], None)
    assert open_ended == {"status": "not-applicable"}


def test_completion_and_reveal_support_complex_tasks_but_not_open_ended_ones() -> None:
    complex_given = step("s1", "(2 + 3i)(1 - 2i)", "expression")
    terminal = step("s2", "8 - i", "expression")
    assert assess("complex-simplify", complex_given, terminal, [terminal], {"kind": "complex-simplify"}) == {"status": "complete"}

    reveal = client.post(
        "/reveal-final-form",
        json={"mode": "complex-simplify", "givenStep": complex_given, "canonicalGoal": {"kind": "complex-simplify"}},
    )
    assert reveal.status_code == 200
    assert reveal.json() == {"canonicalLatex": "8 - i"}

    roots_given = step("roots", "x^2 + 4 = 0", "equation")
    incomplete_roots = step("roots-answer", "\\{2i\\}", "solution-set")
    assert assess("complex-solve", roots_given, incomplete_roots, [incomplete_roots], {"kind": "complex-solve"}) == {"status": "needs-correction"}
    roots_reveal = client.post(
        "/reveal-final-form",
        json={"mode": "complex-solve", "givenStep": roots_given, "canonicalGoal": {"kind": "complex-solve"}},
    )
    assert roots_reveal.status_code == 200
    assert roots_reveal.json() == {"canonicalLatex": "\\{2 i, - 2 i\\}"}

    derivative_reveal = client.post(
        "/reveal-final-form",
        json={
            "mode": "derivative",
            "givenStep": step("s1", "f(x) = \\sin(2x)", "function"),
            "canonicalGoal": {"kind": "derivative", "terminalDerivativeOrder": 1},
        },
    )
    assert derivative_reveal.status_code == 200
    assert derivative_reveal.json()["canonicalLatex"].startswith("f'(x) =")

    rejected = client.post(
        "/reveal-final-form",
        json={"mode": "integral", "givenStep": step("s1", "\\int x \\, dx", "expression"), "canonicalGoal": None},
    )
    assert rejected.status_code == 400

    algebra_rejected = client.post(
        "/reveal-final-form",
        json={"mode": "algebra", "givenStep": step("s1", "x + 1 = 2", "equation"), "canonicalGoal": None},
    )
    assert algebra_rejected.status_code == 400


def test_fixed_target_inequalities_support_completion_and_final_form_reveal() -> None:
    given = step("s1", "-2x + 3 > 7", "inequality")
    balance = step("s2", "-2x > 4", "inequality")
    answer = step("s3", "x < -2", "inequality")
    assert assess("inequality", given, answer, [balance, answer], {"kind": "inequality"}) == {"status": "complete"}

    wrong_answer = step("s3", "x > -2", "inequality")
    assert assess("inequality", given, wrong_answer, [balance, wrong_answer], {"kind": "inequality"}) == {"status": "needs-correction"}
    assert assess("inequality", given, answer, [balance, answer], None) == {"status": "not-applicable"}

    reveal = client.post(
        "/reveal-final-form",
        json={"mode": "inequality", "givenStep": given, "canonicalGoal": {"kind": "inequality"}},
    )
    assert reveal.status_code == 200
    assert reveal.json() == {"canonicalLatex": "x < -2"}


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
