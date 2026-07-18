from __future__ import annotations

from collections.abc import Iterable

import sympy as sp

from .contracts import (
    ClaimKind,
    ComplexComparisonEvidence,
    DerivativeEvidence,
    EquationEvaluation,
    EvaluationEvidence,
    ProblemMode,
    ProofStep,
    SolutionSetEvidence,
    VerificationResult,
    VerificationStatus,
)
from .parser import MathSyntaxError, X, parse_derivative, parse_equation, parse_expression, parse_function, parse_solution_set


SAMPLE_VALUES = (3, -7, -3, -2, -1, 0, 1, 2, 7)


def _latex(value: sp.Expr | int | float) -> str:
    return sp.latex(sp.simplify(value))


def _display_number(value: sp.Expr) -> str:
    return _latex(value)


def _unsupported(error: MathSyntaxError) -> VerificationResult:
    return VerificationResult(
        status=VerificationStatus.UNSUPPORTED,
        summary="ProofLab cannot verify this kind of step yet.",
        limitations=[str(error)],
    )


def _inconclusive(message: str) -> VerificationResult:
    return VerificationResult(
        status=VerificationStatus.INCONCLUSIVE,
        summary="ProofLab could not confirm this transition.",
        limitations=[message],
    )


def _is_zero(value: sp.Expr) -> bool:
    return sp.simplify(value) == 0


def _equations_are_proportional(first: sp.Expr, second: sp.Expr) -> bool:
    if _is_zero(first) and _is_zero(second):
        return True
    if _is_zero(first) or _is_zero(second):
        return False
    quotient = sp.cancel(first / second)
    return not quotient.has(X) and quotient != 0


def _evaluation_evidence(previous: tuple[sp.Expr, sp.Expr], next_step: tuple[sp.Expr, sp.Expr]) -> EvaluationEvidence | None:
    previous_left, previous_right = previous
    next_left, next_right = next_step
    for value in SAMPLE_VALUES:
        before_left = sp.simplify(previous_left.subs(X, value))
        before_right = sp.simplify(previous_right.subs(X, value))
        after_left = sp.simplify(next_left.subs(X, value))
        after_right = sp.simplify(next_right.subs(X, value))
        if not _is_zero((before_left - before_right) - (after_left - after_right)):
            return EvaluationEvidence(
                kind="evaluation",
                inputLatex=f"x = {value}",
                previous=EquationEvaluation(
                    leftLatex=_latex(before_left),
                    rightLatex=_latex(before_right),
                    leftValue=_display_number(before_left),
                    rightValue=_display_number(before_right),
                ),
                next=EquationEvaluation(
                    leftLatex=_latex(after_left),
                    rightLatex=_latex(after_right),
                    leftValue=_display_number(after_left),
                    rightValue=_display_number(after_right),
                ),
            )
    return None


def _square_expansion(previous: tuple[sp.Expr, sp.Expr], next_step: tuple[sp.Expr, sp.Expr]) -> tuple[str | None, str | None]:
    previous_left, previous_right = previous
    next_left, next_right = next_step
    expanded = sp.expand(previous_left)
    if not _is_zero(previous_right - next_right):
        return None, None
    if not _is_zero(expanded - next_left):
        return None, None
    polynomial = sp.Poly(previous_left, X)
    if polynomial.degree() != 2:
        return None, None
    return "expand-square", f"{_latex(expanded)} = {_latex(previous_right)}"


def _balance_operation(previous: tuple[sp.Expr, sp.Expr], next_step: tuple[sp.Expr, sp.Expr]) -> bool:
    previous_left, previous_right = previous
    next_left, next_right = next_step
    if _is_zero((previous_left - next_left) - (previous_right - next_right)):
        return not (_is_zero(previous_left - next_left) and _is_zero(previous_right - next_right))
    residual_before = sp.expand(previous_left - previous_right)
    residual_after = sp.expand(next_left - next_right)
    return _equations_are_proportional(residual_before, residual_after)


def _missing_square_term(previous: tuple[sp.Expr, sp.Expr], next_step: tuple[sp.Expr, sp.Expr]) -> str | None:
    previous_left, previous_right = previous
    next_left, next_right = next_step
    if not _is_zero(previous_right - next_right):
        return None
    expected = sp.expand(previous_left)
    difference = sp.expand(expected - next_left)
    try:
        polynomial = sp.Poly(difference, X)
    except sp.PolynomialError:
        return None
    if polynomial.degree() == 1 and polynomial.coeff_monomial(X) != 0 and polynomial.coeff_monomial(1) == 0:
        return _latex(polynomial.coeff_monomial(X) * X)
    return None


def _proposed_solution(equation: tuple[sp.Expr, sp.Expr]) -> sp.Expr | None:
    left, right = equation
    if left == X and not right.has(X):
        return right
    if right == X and not left.has(X):
        return left
    return None


def _solution_evidence(previous: tuple[sp.Expr, sp.Expr], proposed: sp.Expr) -> EvaluationEvidence:
    left, right = previous
    before_left = sp.simplify(left.subs(X, proposed))
    before_right = sp.simplify(right.subs(X, proposed))
    return EvaluationEvidence(
        kind="evaluation",
        inputLatex=f"x = {_latex(proposed)}",
        previous=EquationEvaluation(
            leftLatex=_latex(before_left),
            rightLatex=_latex(before_right),
            leftValue=_display_number(before_left),
            rightValue=_display_number(before_right),
        ),
        next=EquationEvaluation(
            leftLatex=_latex(proposed),
            rightLatex=_latex(proposed),
            leftValue=_display_number(proposed),
            rightValue=_display_number(proposed),
        ),
    )


def verify_algebra(previous_step: ProofStep, next_step: ProofStep) -> VerificationResult:
    if previous_step.kind != ClaimKind.EQUATION or next_step.kind != ClaimKind.EQUATION:
        return _unsupported(MathSyntaxError("Algebra steps must both be equations."))
    previous = parse_equation(previous_step.latex)
    next_equation = parse_equation(next_step.latex)
    if (proposed := _proposed_solution(next_equation)) is not None:
        if _is_zero(previous[0].subs(X, proposed) - previous[1].subs(X, proposed)):
            return VerificationResult(
                status=VerificationStatus.VALID,
                rule="solution-substitution",
                summary=f"x = {_latex(proposed)} satisfies the previous equation.",
            )
        return VerificationResult(
            status=VerificationStatus.INVALID,
            rule="solution-substitution",
            summary=f"x = {_latex(proposed)} does not satisfy the previous equation.",
            evidence=_solution_evidence(previous, proposed),
        )
    previous_residual = sp.expand(previous[0] - previous[1])
    next_residual = sp.expand(next_equation[0] - next_equation[1])
    if _equations_are_proportional(previous_residual, next_residual):
        expansion_rule, repair = _square_expansion(previous, next_equation)
        if expansion_rule:
            return VerificationResult(
                status=VerificationStatus.VALID,
                rule=expansion_rule,
                summary="Nice—every term from the square is present.",
                verifiedRepairLatex=repair,
            )
        if _balance_operation(previous, next_equation):
            return VerificationResult(
                status=VerificationStatus.VALID,
                rule="balance-operation",
                summary="Nice—both sides changed in a way that preserves the equation.",
            )
        return VerificationResult(
            status=VerificationStatus.VALID,
            rule="equivalent-rearrangement",
            summary="This step preserves the equation.",
        )

    evidence = _evaluation_evidence(previous, next_equation)
    missing_term = _missing_square_term(previous, next_equation)
    return VerificationResult(
        status=VerificationStatus.INVALID,
        rule="equivalent-rearrangement",
        summary="The expanded expression is missing a term." if missing_term else "These equations are not equivalent.",
        evidence=evidence,
        likelyMissingTerm=missing_term,
        verifiedRepairLatex=(f"{_latex(sp.expand(previous[0]))} = {_latex(previous[1])}" if missing_term else None),
    )


def verify_derivative(previous_step: ProofStep, next_step: ProofStep) -> VerificationResult:
    if previous_step.kind != ClaimKind.FUNCTION or next_step.kind != ClaimKind.DERIVATIVE:
        return _unsupported(MathSyntaxError("A derivative transition goes from f(x) = … to f'(x) = …."))
    function = parse_function(previous_step.latex)
    submitted = parse_derivative(next_step.latex)
    expected = sp.expand(sp.diff(function, X))
    expected_latex = f"f'(x) = {_latex(expected)}"
    if _is_zero(expected - submitted):
        return VerificationResult(
            status=VerificationStatus.VALID,
            rule="differentiate-polynomial",
            summary="Nice—this is the correct derivative.",
            verifiedRepairLatex=expected_latex,
        )
    for value in SAMPLE_VALUES:
        expected_value = sp.simplify(expected.subs(X, value))
        submitted_value = sp.simplify(submitted.subs(X, value))
        if not _is_zero(expected_value - submitted_value):
            return VerificationResult(
                status=VerificationStatus.INVALID,
                rule="differentiate-polynomial",
                summary="This derivative does not match the original function.",
                evidence=DerivativeEvidence(
                    kind="derivative-check",
                    inputLatex=f"x = {value}",
                    expectedLatex=_latex(expected),
                    submittedLatex=_latex(submitted),
                    expectedValue=_display_number(expected_value),
                    submittedValue=_display_number(submitted_value),
                ),
                verifiedRepairLatex=expected_latex,
            )
    return _inconclusive("The derivative differed symbolically but no safe check value was available.")


def verify_complex_simplification(previous_step: ProofStep, next_step: ProofStep) -> VerificationResult:
    if previous_step.kind != ClaimKind.EXPRESSION or next_step.kind != ClaimKind.EXPRESSION:
        return _unsupported(MathSyntaxError("Complex simplification steps must both be expressions."))
    previous = parse_expression(previous_step.latex, allow_x=False, allow_i=True)
    submitted = parse_expression(next_step.latex, allow_x=False, allow_i=True)
    expected = sp.simplify(previous)
    difference = sp.simplify(expected - submitted)
    expected_latex = _latex(expected)
    if _is_zero(difference):
        return VerificationResult(
            status=VerificationStatus.VALID,
            rule="complex-simplification",
            summary="Nice—this complex expression is simplified correctly.",
            verifiedRepairLatex=expected_latex,
        )
    return VerificationResult(
        status=VerificationStatus.INVALID,
        rule="complex-simplification",
        summary="This complex expression has a different real or imaginary part.",
        evidence=ComplexComparisonEvidence(
            kind="complex-comparison",
            expectedLatex=expected_latex,
            submittedLatex=_latex(submitted),
            differenceLatex=_latex(difference),
        ),
        verifiedRepairLatex=expected_latex,
    )


def _contains_equivalent(values: Iterable[sp.Expr], candidate: sp.Expr) -> bool:
    return any(_is_zero(value - candidate) for value in values)


def _simple_imaginary_roots(equation: tuple[sp.Expr, sp.Expr]) -> list[sp.Expr]:
    residual = sp.Poly(sp.expand(equation[0] - equation[1]), X)
    if residual.degree() != 2 or residual.coeff_monomial(X**2) != 1 or residual.coeff_monomial(X) != 0:
        raise MathSyntaxError("Complex solving currently supports equations in the form x^2 + c = 0.")
    constant = residual.coeff_monomial(1)
    if not constant.is_Rational or constant <= 0:
        raise MathSyntaxError("Complex solving currently needs x^2 + c = 0 with positive rational c.")
    magnitude = sp.sqrt(constant)
    if not magnitude.is_Rational:
        raise MathSyntaxError("This first complex solver supports rational imaginary roots only.")
    return [sp.I * magnitude, -sp.I * magnitude]


def _solution_latex(solutions: list[sp.Expr]) -> str:
    return "\\{" + ", ".join(_latex(solution) for solution in solutions) + "\\}"


def verify_complex_solution(previous_step: ProofStep, next_step: ProofStep) -> VerificationResult:
    if previous_step.kind == ClaimKind.EQUATION and next_step.kind == ClaimKind.EQUATION:
        return verify_algebra(previous_step, next_step)
    if previous_step.kind != ClaimKind.EQUATION or next_step.kind != ClaimKind.SOLUTION_SET:
        return _unsupported(MathSyntaxError("Submit a solution set after an equation, for example {2i,-2i}."))
    equation = parse_equation(previous_step.latex)
    expected = _simple_imaginary_roots(equation)
    submitted = parse_solution_set(next_step.latex)
    missing = [solution for solution in expected if not _contains_equivalent(submitted, solution)]
    unexpected = [solution for solution in submitted if not _contains_equivalent(expected, solution)]
    repair = _solution_latex(expected)
    if not missing and not unexpected:
        return VerificationResult(
            status=VerificationStatus.VALID,
            rule="complex-solution-set",
            summary="Nice—your solution set contains both complex roots.",
            verifiedRepairLatex=repair,
        )
    return VerificationResult(
        status=VerificationStatus.INVALID,
        rule="complex-solution-set",
        summary="This solution set is incomplete or contains an unsupported root.",
        evidence=SolutionSetEvidence(
            kind="solution-set",
            expectedSolutionsLatex=[_latex(solution) for solution in expected],
            submittedSolutionsLatex=[_latex(solution) for solution in submitted],
            missingSolutionsLatex=[_latex(solution) for solution in missing],
            unexpectedSolutionsLatex=[_latex(solution) for solution in unexpected],
        ),
        verifiedRepairLatex=repair,
    )


def verify_transition(mode: ProblemMode, previous_step: ProofStep, next_step: ProofStep) -> VerificationResult:
    try:
        if mode == ProblemMode.ALGEBRA:
            return verify_algebra(previous_step, next_step)
        if mode == ProblemMode.DERIVATIVE:
            return verify_derivative(previous_step, next_step)
        if mode == ProblemMode.COMPLEX_SIMPLIFY:
            return verify_complex_simplification(previous_step, next_step)
        if mode == ProblemMode.COMPLEX_SOLVE:
            return verify_complex_solution(previous_step, next_step)
        return _unsupported(MathSyntaxError("This learning mode is not configured."))
    except MathSyntaxError as error:
        return _unsupported(error)
    except Exception:
        return _inconclusive("The symbolic verifier could not safely finish this check.")
