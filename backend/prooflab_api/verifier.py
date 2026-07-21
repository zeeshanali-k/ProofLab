from __future__ import annotations

from collections.abc import Iterable
from dataclasses import dataclass

import sympy as sp

from .contracts import (
    CanonicalGoal,
    CanonicalGoalKind,
    ClaimKind,
    CompletionResult,
    CompletionStatus,
    ComplexComparisonEvidence,
    DerivativeEvidence,
    EquationEvaluation,
    InequalityNumberLine,
    InequalityRegion,
    InequalityRegionEvidence,
    EvaluationEvidence,
    ProblemMode,
    ProofStep,
    SolutionSetEvidence,
    VerificationResult,
    VerificationStatus,
)
from .parser import (
    MathSyntaxError,
    X,
    parse_antiderivative,
    parse_derivative,
    parse_equation,
    parse_expression,
    parse_function,
    parse_integral,
    parse_inequality,
    parse_solution_set,
)


SAMPLE_VALUES = (3, -7, -3, -2, -1, 0, 1, 2, 7)


@dataclass(frozen=True)
class SolutionRegion:
    boundary: sp.Rational
    direction: str
    inclusive: bool


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
                summary=f"$x = {_latex(proposed)}$ satisfies the previous equation.",
            )
        return VerificationResult(
            status=VerificationStatus.INVALID,
            rule="solution-substitution",
            summary=f"$x = {_latex(proposed)}$ does not satisfy the previous equation.",
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


def _inequality_region(left: sp.Expr, right: sp.Expr, operator: str) -> SolutionRegion:
    residual = sp.Poly(sp.expand(left - right), X)
    coefficient = sp.simplify(residual.coeff_monomial(X))
    constant = sp.simplify(residual.coeff_monomial(1))
    boundary = sp.simplify(-constant / coefficient)
    if not boundary.is_Rational:
        raise MathSyntaxError("The inequality boundary must be a rational number for the number line.")
    positive_coefficient = bool(coefficient > 0)
    if operator in {"<", "<="}:
        direction = "left" if positive_coefficient else "right"
    else:
        direction = "right" if positive_coefficient else "left"
    return SolutionRegion(boundary=boundary, direction=direction, inclusive=operator in {"<=", ">="})


def _region_latex(region: SolutionRegion) -> str:
    operator = "\\le" if region.inclusive and region.direction == "left" else "\\ge" if region.inclusive else "<" if region.direction == "left" else ">"
    return f"x {operator} {_latex(region.boundary)}"


def _regions_match(first: SolutionRegion, second: SolutionRegion) -> bool:
    return (
        _is_zero(first.boundary - second.boundary)
        and first.direction == second.direction
        and first.inclusive == second.inclusive
    )


def _region_contains(region: SolutionRegion, value: sp.Rational) -> bool:
    if region.direction == "left":
        return bool(value <= region.boundary) if region.inclusive else bool(value < region.boundary)
    return bool(value >= region.boundary) if region.inclusive else bool(value > region.boundary)


def _region_test_value(previous: SolutionRegion, submitted: SolutionRegion) -> sp.Rational:
    candidates = [
        sp.Integer(0),
        previous.boundary,
        submitted.boundary,
        previous.boundary - 1,
        previous.boundary + 1,
        submitted.boundary - 1,
        submitted.boundary + 1,
        sp.simplify((previous.boundary + submitted.boundary) / 2),
    ]
    for value in candidates:
        if _region_contains(previous, value) != _region_contains(submitted, value):
            return value
    return sp.Integer(0)


def _number_line_positions(previous: SolutionRegion, submitted: SolutionRegion, test_value: sp.Rational) -> InequalityNumberLine:
    values = (previous.boundary, submitted.boundary, test_value)
    minimum, maximum = min(values), max(values)
    if minimum == maximum:
        minimum -= 1
        maximum += 1
    else:
        padding = max(sp.Integer(1), sp.simplify((maximum - minimum) / 2))
        minimum -= padding
        maximum += padding

    def position(value: sp.Rational) -> float:
        return float(10 + 80 * sp.simplify((value - minimum) / (maximum - minimum)))

    return InequalityNumberLine(
        previousBoundaryPosition=position(previous.boundary),
        submittedBoundaryPosition=position(submitted.boundary),
        testValuePosition=position(test_value),
    )


def _inequality_evidence(previous: SolutionRegion, submitted: SolutionRegion) -> InequalityRegionEvidence:
    test_value = _region_test_value(previous, submitted)
    return InequalityRegionEvidence(
        kind="inequality-region",
        previousRegion=InequalityRegion(
            boundaryLatex=_latex(previous.boundary),
            direction=previous.direction,
            inclusive=previous.inclusive,
        ),
        submittedRegion=InequalityRegion(
            boundaryLatex=_latex(submitted.boundary),
            direction=submitted.direction,
            inclusive=submitted.inclusive,
        ),
        testValueLatex=_latex(test_value),
        previousIncludesTest=_region_contains(previous, test_value),
        submittedIncludesTest=_region_contains(submitted, test_value),
        numberLine=_number_line_positions(previous, submitted, test_value),
    )


def verify_inequality(previous_step: ProofStep, next_step: ProofStep) -> VerificationResult:
    if previous_step.kind != ClaimKind.INEQUALITY or next_step.kind != ClaimKind.INEQUALITY:
        return _unsupported(MathSyntaxError("Inequality steps must both use <, ≤, >, or ≥."))
    previous = _inequality_region(*parse_inequality(previous_step.latex))
    submitted = _inequality_region(*parse_inequality(next_step.latex))
    evidence = _inequality_evidence(previous, submitted)
    if _regions_match(previous, submitted):
        return VerificationResult(
            status=VerificationStatus.VALID,
            rule="inequality-region-preserved",
            summary=f"Both inequalities describe ${_region_latex(previous)}$.",
            evidence=evidence,
        )
    sign_flip = (
        _is_zero(previous.boundary - submitted.boundary)
        and previous.direction != submitted.direction
        and previous.inclusive == submitted.inclusive
    )
    return VerificationResult(
        status=VerificationStatus.INVALID,
        rule="inequality-sign-flip" if sign_flip else "inequality-region-mismatch",
        summary=(
            "Dividing by a negative reverses the inequality sign."
            if sign_flip
            else "These inequalities describe different solution regions."
        ),
        evidence=evidence,
        verifiedRepairLatex=_region_latex(previous),
    )


def _derivative_latex(order: int, expression: sp.Expr) -> str:
    primes = "'" * order
    return f"f{primes}(x) = {_latex(expression)}"


def _derivative_notation(order: int) -> str:
    primes = "'" * order
    return f"f{primes}(x)"


def _has_trigonometry(expression: sp.Expr) -> bool:
    return bool(expression.atoms(sp.sin, sp.cos, sp.tan))


def _derivative_evidence(expected: sp.Expr, submitted: sp.Expr) -> DerivativeEvidence | None:
    for value in SAMPLE_VALUES:
        expected_value = sp.simplify(expected.subs(X, value))
        submitted_value = sp.simplify(submitted.subs(X, value))
        if not _is_zero(expected_value - submitted_value):
            return DerivativeEvidence(
                kind="derivative-check",
                inputLatex=f"x = {value}",
                expectedLatex=_latex(expected),
                submittedLatex=_latex(submitted),
                expectedValue=_display_number(expected_value),
                submittedValue=_display_number(submitted_value),
            )
    return None


def _derivative_order_guidance(previous_order: int, next_order: int, expression: sp.Expr) -> str:
    expected_notation = _derivative_notation(previous_order + 1)
    submitted_notation = _derivative_notation(next_order)
    guidance = [
        f"After ${_derivative_notation(previous_order)}$, the next derivative must be ${expected_notation}$, not ${submitted_notation}$.",
    ]
    if expression.is_Mul:
        guidance.append("Use the product rule: differentiate the factors separately, then combine the resulting terms.")
    if _has_trigonometry(expression):
        guidance.append("Use the chain rule for the polynomial inside the trigonometric function.")
    return "\n\n".join(guidance)


def verify_derivative(previous_step: ProofStep, next_step: ProofStep) -> VerificationResult:
    if previous_step.kind == ClaimKind.FUNCTION:
        previous_order = 0
        function = parse_function(previous_step.latex)
    elif previous_step.kind == ClaimKind.DERIVATIVE:
        previous_order, function = parse_derivative(previous_step.latex)
    else:
        return _unsupported(MathSyntaxError("A derivative transition must start with f(x) or an earlier derivative."))
    if next_step.kind != ClaimKind.DERIVATIVE:
        return _unsupported(MathSyntaxError("The next calculus step must use derivative notation."))
    next_order, submitted = parse_derivative(next_step.latex)
    if next_order != previous_order + 1:
        return VerificationResult(
            status=VerificationStatus.INVALID,
            rule="derivative-order",
            summary=_derivative_order_guidance(previous_order, next_order, function),
        )
    expected = sp.expand(sp.diff(function, X))
    expected_latex = _derivative_latex(next_order, expected)
    rule = "differentiate-trigonometric" if _has_trigonometry(function) else "differentiate-polynomial"
    if _is_zero(expected - submitted):
        return VerificationResult(
            status=VerificationStatus.VALID,
            rule=rule,
            summary="Nice—this is the correct derivative.",
            verifiedRepairLatex=expected_latex,
        )
    if evidence := _derivative_evidence(expected, submitted):
        return VerificationResult(
            status=VerificationStatus.INVALID,
            rule=rule,
            summary="This derivative does not match the previous function.",
            evidence=evidence,
            verifiedRepairLatex=expected_latex,
        )
    return _inconclusive("The derivative differed symbolically but no safe check value was available.")


def verify_integral(previous_step: ProofStep, next_step: ProofStep) -> VerificationResult:
    if previous_step.kind != ClaimKind.EXPRESSION or next_step.kind != ClaimKind.ANTIDERIVATIVE:
        return _unsupported(MathSyntaxError("An integral transition goes from ∫ … dx to F(x) = … + C."))
    integrand = parse_integral(previous_step.latex)
    submitted, has_constant = parse_antiderivative(next_step.latex)
    submitted_derivative = sp.expand(sp.diff(submitted, X))
    if _is_zero(integrand - submitted_derivative):
        if has_constant:
            return VerificationResult(
                status=VerificationStatus.VALID,
                rule="indefinite-integral",
                summary="Nice—differentiating your antiderivative returns the integrand.",
            )
        return VerificationResult(
            status=VerificationStatus.INVALID,
            rule="indefinite-integral",
            summary="An indefinite integral needs the constant of integration, $+ C$.",
            evidence=_derivative_evidence(integrand, submitted_derivative),
        )
    return VerificationResult(
        status=VerificationStatus.INVALID,
        rule="indefinite-integral",
        summary="Differentiating this antiderivative does not return the integrand.",
        evidence=_derivative_evidence(integrand, submitted_derivative),
    )


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
        if mode == ProblemMode.INEQUALITY:
            return verify_inequality(previous_step, next_step)
        if mode == ProblemMode.DERIVATIVE:
            return verify_derivative(previous_step, next_step)
        if mode == ProblemMode.INTEGRAL:
            return verify_integral(previous_step, next_step)
        if mode == ProblemMode.COMPLEX_SIMPLIFY:
            return verify_complex_simplification(previous_step, next_step)
        if mode == ProblemMode.COMPLEX_SOLVE:
            return verify_complex_solution(previous_step, next_step)
        return _unsupported(MathSyntaxError("This learning mode is not configured."))
    except MathSyntaxError as error:
        return _unsupported(error)
    except Exception:
        return _inconclusive("The symbolic verifier could not safely finish this check.")


def _goal_matches_mode(mode: ProblemMode, goal: CanonicalGoal | None) -> bool:
    if goal is None:
        return False
    return (
        (mode == ProblemMode.INEQUALITY and goal.kind == CanonicalGoalKind.INEQUALITY)
        or (mode == ProblemMode.DERIVATIVE and goal.kind == CanonicalGoalKind.DERIVATIVE)
        or (mode == ProblemMode.COMPLEX_SIMPLIFY and goal.kind == CanonicalGoalKind.COMPLEX_SIMPLIFY)
        or (mode == ProblemMode.COMPLEX_SOLVE and goal.kind == CanonicalGoalKind.COMPLEX_SOLVE)
    )


def canonical_final_latex(mode: ProblemMode, given_step: ProofStep, goal: CanonicalGoal | None) -> str:
    """Return only a problem-defined deterministic target for eligible modes."""
    if not _goal_matches_mode(mode, goal):
        raise MathSyntaxError("This problem does not have a canonical final form.")
    assert goal is not None
    if mode == ProblemMode.INEQUALITY:
        if given_step.kind != ClaimKind.INEQUALITY:
            raise MathSyntaxError("Inequality problems must start with an inequality.")
        return _region_latex(_inequality_region(*parse_inequality(given_step.latex)))
    if mode == ProblemMode.DERIVATIVE:
        if given_step.kind != ClaimKind.FUNCTION:
            raise MathSyntaxError("Derivative problems must start with f(x) = ….")
        expression = parse_function(given_step.latex)
        for _ in range(goal.terminal_derivative_order or 0):
            expression = sp.expand(sp.diff(expression, X))
        return _derivative_latex(goal.terminal_derivative_order or 1, expression)
    if mode == ProblemMode.COMPLEX_SIMPLIFY:
        if given_step.kind != ClaimKind.EXPRESSION:
            raise MathSyntaxError("Complex simplification problems must start with an expression.")
        return _latex(sp.simplify(parse_expression(given_step.latex, allow_x=False, allow_i=True)))
    if mode == ProblemMode.COMPLEX_SOLVE:
        if given_step.kind != ClaimKind.EQUATION:
            raise MathSyntaxError("Complex solution problems must start with an equation.")
        return _solution_latex(_simple_imaginary_roots(parse_equation(given_step.latex)))
    raise MathSyntaxError("This problem does not have a canonical final form.")


def _same_step(first: ProofStep, second: ProofStep) -> bool:
    return first.id == second.id and first.latex == second.latex and first.kind == second.kind


def assess_completion(
    mode: ProblemMode,
    given_step: ProofStep,
    terminal_learner_step: ProofStep,
    learner_steps: list[ProofStep],
    goal: CanonicalGoal | None,
) -> CompletionResult:
    """Assess a complete submitted chain without putting a target in the response."""
    if mode in {ProblemMode.ALGEBRA, ProblemMode.INTEGRAL} or not _goal_matches_mode(mode, goal):
        return CompletionResult(status=CompletionStatus.NOT_APPLICABLE)
    if not learner_steps or not _same_step(learner_steps[-1], terminal_learner_step):
        return CompletionResult(status=CompletionStatus.NEEDS_CORRECTION)
    chain = [given_step, *learner_steps]
    for previous_step, next_step in zip(chain, chain[1:]):
        if verify_transition(mode, previous_step, next_step).status != VerificationStatus.VALID:
            return CompletionResult(status=CompletionStatus.NEEDS_CORRECTION)
    try:
        canonical_latex = canonical_final_latex(mode, given_step, goal)
        if mode == ProblemMode.INEQUALITY:
            if terminal_learner_step.kind != ClaimKind.INEQUALITY:
                matches = False
            else:
                matches = _regions_match(
                    _inequality_region(*parse_inequality(terminal_learner_step.latex)),
                    _inequality_region(*parse_inequality(canonical_latex)),
                )
        elif mode == ProblemMode.DERIVATIVE:
            order, terminal_expression = parse_derivative(terminal_learner_step.latex)
            target_order = goal.terminal_derivative_order if goal else None
            expected_order, expected_expression = parse_derivative(canonical_latex)
            matches = order == target_order == expected_order and _is_zero(terminal_expression - expected_expression)
        elif mode == ProblemMode.COMPLEX_SIMPLIFY:
            matches = terminal_learner_step.kind == ClaimKind.EXPRESSION and _is_zero(
                parse_expression(terminal_learner_step.latex, allow_x=False, allow_i=True)
                - parse_expression(canonical_latex, allow_x=False, allow_i=True)
            )
        else:
            submitted_solutions = parse_solution_set(terminal_learner_step.latex)
            expected_solutions = parse_solution_set(canonical_latex)
            matches = (
                terminal_learner_step.kind == ClaimKind.SOLUTION_SET
                and not [solution for solution in submitted_solutions if not _contains_equivalent(expected_solutions, solution)]
                and not [solution for solution in expected_solutions if not _contains_equivalent(submitted_solutions, solution)]
            )
    except MathSyntaxError:
        return CompletionResult(status=CompletionStatus.NEEDS_CORRECTION)
    return CompletionResult(status=CompletionStatus.COMPLETE if matches else CompletionStatus.IN_PROGRESS)
