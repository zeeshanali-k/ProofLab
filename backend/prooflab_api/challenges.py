from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
import re

import sympy as sp

from .contracts import (
    ChallengeAnswerKind,
    ChallengeCatalogItem,
    ChallengeDetail,
    ChallengePreviewResponse,
    ChallengeSubmissionResponse,
    ChallengeSubmissionStatus,
    ChallengeVisualization,
    ClaimKind,
    ProblemMode,
    ProofStep,
    VisualizationPhase,
    VisualizerType,
)
from .curriculum import curriculum_node_for_challenge
from .parser import MathSyntaxError, X, normalize_latex, parse_equation, parse_inequality, parse_solution_set
from .verifier import verify_transition


class ValidatorKey(str, Enum):
    LINEAR_SOLUTION = "linear-solution"
    EXPANDED_EQUATION = "expanded-equation"
    INEQUALITY = "inequality"
    DERIVATIVE = "derivative"
    ANTIDERIVATIVE = "antiderivative"
    COMPLEX_EXPRESSION = "complex-expression"
    ROOT_SET = "root-set"
    IMAGINARY_ROOT_SET = "imaginary-root-set"


@dataclass(frozen=True)
class ChallengeDefinition:
    id: str
    number: int
    slug: str
    title: str
    topic: str
    difficulty: str
    statement_latex: str
    statement_text: str
    constraints: tuple[str, ...]
    answer_kind: ChallengeAnswerKind
    visualizer_type: VisualizerType
    starter_draft: str
    public_example_latex: str
    public_example_text: str
    mode: ProblemMode
    source_kind: ClaimKind
    answer_kind_claim: ClaimKind
    validator_key: ValidatorKey
    canonical_target: str
    accepted_answer: str
    rejected_answer: str


def _challenge(
    number: int,
    slug: str,
    title: str,
    topic: str,
    difficulty: str,
    statement_latex: str,
    statement_text: str,
    constraints: tuple[str, ...],
    answer_kind: ChallengeAnswerKind,
    visualizer_type: VisualizerType,
    starter_draft: str,
    public_example_latex: str,
    public_example_text: str,
    mode: ProblemMode,
    source_kind: ClaimKind,
    answer_kind_claim: ClaimKind,
    validator_key: ValidatorKey,
    canonical_target: str,
    accepted_answer: str,
    rejected_answer: str,
) -> ChallengeDefinition:
    return ChallengeDefinition(
        id=f"{number:03d}",
        number=number,
        slug=slug,
        title=title,
        topic=topic,
        difficulty=difficulty,
        statement_latex=statement_latex,
        statement_text=statement_text,
        constraints=constraints,
        answer_kind=answer_kind,
        visualizer_type=visualizer_type,
        starter_draft=starter_draft,
        public_example_latex=public_example_latex,
        public_example_text=public_example_text,
        mode=mode,
        source_kind=source_kind,
        answer_kind_claim=answer_kind_claim,
        validator_key=validator_key,
        canonical_target=canonical_target,
        accepted_answer=accepted_answer,
        rejected_answer=rejected_answer,
    )


EQUATION_CONSTRAINTS = ("Use exactly one equals sign.", "Submit an equation in $x$.")
ROOT_SET_CONSTRAINTS = ("Submit every distinct root inside braces.", "Separate roots with commas, for example $\\{2, -2\\}$.")
INEQUALITY_CONSTRAINTS = ("Use one of $<, \\le, >, \\ge$.", "Submit the final solution region in $x$.")
DERIVATIVE_CONSTRAINTS = ("Use first-derivative notation: $f'(x) = \\dots$.", "Use the supported polynomial and trig notation.")
ANTIDERIVATIVE_CONSTRAINTS = ("Use $F(x) = \\dots + C$.", "The constant of integration is required.")
COMPLEX_CONSTRAINTS = ("Use rectangular $a + bi$ notation.", "Use $i$ for the imaginary unit.")


CHALLENGES: tuple[ChallengeDefinition, ...] = (
    _challenge(1, "keep-it-balanced", "Keep It Balanced", "Algebra", "Foundation", "3x + 5 = 20", "Solve the linear equation and isolate x.", EQUATION_CONSTRAINTS, ChallengeAnswerKind.EQUATION, VisualizerType.NONE, "x = ", "x = 7", "For a solution of seven, enter $x = 7$.", ProblemMode.ALGEBRA, ClaimKind.EQUATION, ClaimKind.EQUATION, ValidatorKey.LINEAR_SOLUTION, "x = 5", "x = 5", "x = 4"),
    _challenge(2, "the-missing-middle", "The Missing Middle", "Algebra", "Trap", "(x + 2)^2 = 25", "Expand the square without losing its middle term.", (*EQUATION_CONSTRAINTS, "Expand the squared expression; an unchanged prompt is not accepted."), ChallengeAnswerKind.EQUATION, VisualizerType.NONE, "", "x^2 - 2x + 1 = 9", "An expanded square keeps all three terms.", ProblemMode.ALGEBRA, ClaimKind.EQUATION, ClaimKind.EQUATION, ValidatorKey.EXPANDED_EQUATION, "x^2 + 4x + 4 = 25", "x^2 + 4x + 4 = 25", "x^2 + 4 = 25"),
    _challenge(3, "sign-switch", "Sign Switch", "Inequalities", "Trap", "-2x + 3 > 7", "Solve the inequality while preserving its solution region.", INEQUALITY_CONSTRAINTS, ChallengeAnswerKind.INEQUALITY, VisualizerType.NUMBER_LINE, "x < ", "x \\leq 3", "A boundary may be open or closed depending on the symbol.", ProblemMode.INEQUALITY, ClaimKind.INEQUALITY, ClaimKind.INEQUALITY, ValidatorKey.INEQUALITY, "x < -2", "x < -2", "x > -2"),
    _challenge(4, "differentiate-the-chain", "Differentiate the Chain", "Calculus", "Chain", "f(x) = \\sin(3x^2 + 1)", "Find the first derivative of the composed function.", DERIVATIVE_CONSTRAINTS, ChallengeAnswerKind.DERIVATIVE, VisualizerType.NONE, "f'(x) = ", "f'(x) = 2x", "Include $f'(x)$ before the derivative expression.", ProblemMode.DERIVATIVE, ClaimKind.FUNCTION, ClaimKind.DERIVATIVE, ValidatorKey.DERIVATIVE, "f'(x) = 6x\\cos(3x^2 + 1)", "f'(x) = 6x\\cos(3x^2 + 1)", "f'(x) = 6x\\sin(3x^2 + 1)"),
    _challenge(5, "both-roots-matter", "Both Roots Matter", "Complex", "Trap", "x^2 + 4 = 0", "Find every imaginary solution of the equation.", ROOT_SET_CONSTRAINTS, ChallengeAnswerKind.SOLUTION_SET, VisualizerType.COMPLEX_PLANE, "\\{ \\}", "\\{i, -i\\}", "Use braces and include each solution once.", ProblemMode.COMPLEX_SOLVE, ClaimKind.EQUATION, ClaimKind.SOLUTION_SET, ValidatorKey.IMAGINARY_ROOT_SET, "\\{2i, -2i\\}", "\\{2i, -2i\\}", "\\{2i\\}"),
    _challenge(6, "move-the-constant", "Move the Constant", "Algebra", "Foundation", "7x - 9 = 26", "Solve the linear equation and isolate x.", EQUATION_CONSTRAINTS, ChallengeAnswerKind.EQUATION, VisualizerType.NONE, "x = ", "x = -3", "Enter the isolated value of x.", ProblemMode.ALGEBRA, ClaimKind.EQUATION, ClaimKind.EQUATION, ValidatorKey.LINEAR_SOLUTION, "x = 5", "x = 5", "x = 6"),
    _challenge(7, "terms-on-both-sides", "Terms on Both Sides", "Algebra", "Trap", "5x - 7 = 2x + 8", "Collect variable terms before isolating x.", EQUATION_CONSTRAINTS, ChallengeAnswerKind.EQUATION, VisualizerType.NONE, "x = ", "x = 4", "Your final answer must isolate x.", ProblemMode.ALGEBRA, ClaimKind.EQUATION, ClaimKind.EQUATION, ValidatorKey.LINEAR_SOLUTION, "x = 5", "x = 5", "x = 4"),
    _challenge(8, "thirds-and-whole", "Thirds and Whole", "Algebra", "Foundation", "\\frac{x}{3} + 2 = 5", "Solve the fractional linear equation.", EQUATION_CONSTRAINTS, ChallengeAnswerKind.EQUATION, VisualizerType.NONE, "x = ", "x = 12", "Fractions are supported with $\\frac{a}{b}$.", ProblemMode.ALGEBRA, ClaimKind.EQUATION, ClaimKind.EQUATION, ValidatorKey.LINEAR_SOLUTION, "x = 9", "x = 9", "x = 8"),
    _challenge(9, "negative-cross-term", "Negative Cross Term", "Algebra", "Trap", "(x - 4)^2 = 36", "Expand the square while preserving the negative cross term.", (*EQUATION_CONSTRAINTS, "Expand the squared expression; an unchanged prompt is not accepted."), ChallengeAnswerKind.EQUATION, VisualizerType.NONE, "", "x^2 + 6x + 9 = 16", "The sign of the middle term follows the binomial.", ProblemMode.ALGEBRA, ClaimKind.EQUATION, ClaimKind.EQUATION, ValidatorKey.EXPANDED_EQUATION, "x^2 - 8x + 16 = 36", "x^2 - 8x + 16 = 36", "x^2 + 16 = 36"),
    _challenge(10, "factor-to-both-roots", "Factor to Both Roots", "Algebra", "Chain", "x^2 - 5x + 6 = 0", "Submit the complete real solution set.", ROOT_SET_CONSTRAINTS, ChallengeAnswerKind.SOLUTION_SET, VisualizerType.NONE, "\\{ \\}", "\\{1, -1\\}", "A quadratic can have more than one root.", ProblemMode.ALGEBRA, ClaimKind.EQUATION, ClaimKind.SOLUTION_SET, ValidatorKey.ROOT_SET, "\\{2, 3\\}", "\\{2, 3\\}", "\\{2\\}"),
    _challenge(11, "difference-makes-roots", "Difference Makes Roots", "Algebra", "Foundation", "x^2 - 16 = 0", "Submit the complete real solution set.", ROOT_SET_CONSTRAINTS, ChallengeAnswerKind.SOLUTION_SET, VisualizerType.NONE, "\\{ \\}", "\\{3, -3\\}", "Use braces even when the roots are opposites.", ProblemMode.ALGEBRA, ClaimKind.EQUATION, ClaimKind.SOLUTION_SET, ValidatorKey.ROOT_SET, "\\{4, -4\\}", "\\{4, -4\\}", "\\{4\\}"),
    _challenge(12, "closed-boundary", "Closed Boundary", "Inequalities", "Foundation", "3x - 5 \\leq 7", "Solve the inequality and preserve its closed boundary.", INEQUALITY_CONSTRAINTS, ChallengeAnswerKind.INEQUALITY, VisualizerType.NUMBER_LINE, "x \\leq ", "x \\geq 2", "Use $\\le$ or $\\ge$ when the boundary is included.", ProblemMode.INEQUALITY, ClaimKind.INEQUALITY, ClaimKind.INEQUALITY, ValidatorKey.INEQUALITY, "x \\leq 4", "x \\leq 4", "x < 4"),
    _challenge(13, "reverse-direction", "Reverse Direction", "Inequalities", "Trap", "-3x \\geq 9", "Solve the inequality after dividing by a negative value.", INEQUALITY_CONSTRAINTS, ChallengeAnswerKind.INEQUALITY, VisualizerType.NUMBER_LINE, "x \\leq ", "x \\leq -1", "Dividing by a negative changes the direction.", ProblemMode.INEQUALITY, ClaimKind.INEQUALITY, ClaimKind.INEQUALITY, ValidatorKey.INEQUALITY, "x \\leq -3", "x \\leq -3", "x \\geq -3"),
    _challenge(14, "variables-on-both-sides", "Variables on Both Sides", "Inequalities", "Chain", "2x + 1 < 5x - 8", "Collect variable terms and solve the resulting region.", INEQUALITY_CONSTRAINTS, ChallengeAnswerKind.INEQUALITY, VisualizerType.NUMBER_LINE, "x > ", "x > 2", "The final inequality must describe the solution region.", ProblemMode.INEQUALITY, ClaimKind.INEQUALITY, ClaimKind.INEQUALITY, ValidatorKey.INEQUALITY, "x > 3", "x > 3", "x < 3"),
    _challenge(15, "inclusive-check", "Inclusive Check", "Inequalities", "Trap", "5 - 2x \\leq 11", "Solve the inequality and preserve the inclusive endpoint.", INEQUALITY_CONSTRAINTS, ChallengeAnswerKind.INEQUALITY, VisualizerType.NUMBER_LINE, "x \\geq ", "x \\geq 1", "Keep the endpoint closed when equality is allowed.", ProblemMode.INEQUALITY, ClaimKind.INEQUALITY, ClaimKind.INEQUALITY, ValidatorKey.INEQUALITY, "x \\geq -3", "x \\geq -3", "x \\leq -3"),
    _challenge(16, "another-sign-switch", "Another Sign Switch", "Inequalities", "Trap", "-4x + 1 < 13", "Solve the inequality while reversing the sign at the right moment.", INEQUALITY_CONSTRAINTS, ChallengeAnswerKind.INEQUALITY, VisualizerType.NUMBER_LINE, "x > ", "x > 4", "The final inequality must use x and one inequality symbol.", ProblemMode.INEQUALITY, ClaimKind.INEQUALITY, ClaimKind.INEQUALITY, ValidatorKey.INEQUALITY, "x > -3", "x > -3", "x < -3"),
    _challenge(17, "power-rule-stack", "Power Rule Stack", "Calculus", "Foundation", "f(x) = x^4 - 3x^2 + 7", "Find the first derivative of the polynomial.", DERIVATIVE_CONSTRAINTS, ChallengeAnswerKind.DERIVATIVE, VisualizerType.NONE, "f'(x) = ", "f'(x) = 3x^2", "Keep the function and derivative notation distinct.", ProblemMode.DERIVATIVE, ClaimKind.FUNCTION, ClaimKind.DERIVATIVE, ValidatorKey.DERIVATIVE, "f'(x) = 4x^3 - 6x", "f'(x) = 4x^3 - 6x", "f'(x) = 4x^3 - 3x"),
    _challenge(18, "linear-term-survives", "Linear Term Survives", "Calculus", "Foundation", "f(x) = 5x^3 - 2x + 9", "Find the first derivative of the polynomial.", DERIVATIVE_CONSTRAINTS, ChallengeAnswerKind.DERIVATIVE, VisualizerType.NONE, "f'(x) = ", "f'(x) = 6x - 2", "Differentiate each term separately.", ProblemMode.DERIVATIVE, ClaimKind.FUNCTION, ClaimKind.DERIVATIVE, ValidatorKey.DERIVATIVE, "f'(x) = 15x^2 - 2", "f'(x) = 15x^2 - 2", "f'(x) = 15x^2 + 2"),
    _challenge(19, "product-in-motion", "Product in Motion", "Calculus", "Chain", "f(x) = x^2\\sin(x)", "Use the product rule to find the first derivative.", DERIVATIVE_CONSTRAINTS, ChallengeAnswerKind.DERIVATIVE, VisualizerType.NONE, "f'(x) = ", "f'(x) = 2x\\sin(x)", "Keep both product-rule terms in the result.", ProblemMode.DERIVATIVE, ClaimKind.FUNCTION, ClaimKind.DERIVATIVE, ValidatorKey.DERIVATIVE, "f'(x) = 2x\\sin(x) + x^2\\cos(x)", "f'(x) = 2x\\sin(x) + x^2\\cos(x)", "f'(x) = 2x\\sin(x)"),
    _challenge(20, "cosine-product", "Cosine Product", "Calculus", "Chain", "f(x) = (x + 1)\\cos(x)", "Use the product rule to find the first derivative.", DERIVATIVE_CONSTRAINTS, ChallengeAnswerKind.DERIVATIVE, VisualizerType.NONE, "f'(x) = ", "f'(x) = \\cos(x) - x\\sin(x)", "Keep both product-rule terms in the result.", ProblemMode.DERIVATIVE, ClaimKind.FUNCTION, ClaimKind.DERIVATIVE, ValidatorKey.DERIVATIVE, "f'(x) = \\cos(x) - (x + 1)\\sin(x)", "f'(x) = \\cos(x) - (x + 1)\\sin(x)", "f'(x) = -(x + 1)\\sin(x)"),
    _challenge(21, "inner-slope", "Inner Slope", "Calculus", "Trap", "f(x) = \\sin(5x - 2)", "Find the first derivative of the composed sine function.", DERIVATIVE_CONSTRAINTS, ChallengeAnswerKind.DERIVATIVE, VisualizerType.NONE, "f'(x) = ", "f'(x) = 4\\cos(4x)", "Include the derivative of the inner expression.", ProblemMode.DERIVATIVE, ClaimKind.FUNCTION, ClaimKind.DERIVATIVE, ValidatorKey.DERIVATIVE, "f'(x) = 5\\cos(5x - 2)", "f'(x) = 5\\cos(5x - 2)", "f'(x) = \\cos(5x - 2)"),
    _challenge(22, "polynomial-antiderivative", "Polynomial Antiderivative", "Calculus", "Foundation", "\\int 6x^2 - 4x + 3\\, dx", "Find an antiderivative and include the constant of integration.", ANTIDERIVATIVE_CONSTRAINTS, ChallengeAnswerKind.ANTIDERIVATIVE, VisualizerType.NONE, "F(x) =  + C", "F(x) = x^2 + C", "Every indefinite integral includes $+ C$.", ProblemMode.INTEGRAL, ClaimKind.EXPRESSION, ClaimKind.ANTIDERIVATIVE, ValidatorKey.ANTIDERIVATIVE, "F(x) = 2x^3 - 2x^2 + 3x + C", "F(x) = 2x^3 - 2x^2 + 3x + C", "F(x) = 2x^3 - 2x^2 + 3x"),
    _challenge(23, "cosine-needs-division", "Cosine Needs Division", "Calculus", "Trap", "\\int \\cos(3x + 1)\\, dx", "Find an antiderivative and account for the inner coefficient.", ANTIDERIVATIVE_CONSTRAINTS, ChallengeAnswerKind.ANTIDERIVATIVE, VisualizerType.NONE, "F(x) =  + C", "F(x) = \\sin(x) + C", "Include $+ C$ after the antiderivative.", ProblemMode.INTEGRAL, ClaimKind.EXPRESSION, ClaimKind.ANTIDERIVATIVE, ValidatorKey.ANTIDERIVATIVE, "F(x) = \\frac{1}{3}\\sin(3x + 1) + C", "F(x) = \\frac{1}{3}\\sin(3x + 1) + C", "F(x) = \\frac{1}{3}\\sin(3x + 1)"),
    _challenge(24, "mixed-antiderivative", "Mixed Antiderivative", "Calculus", "Chain", "\\int 4x^3 + \\sin(2x)\\, dx", "Find an antiderivative for both terms and include + C.", ANTIDERIVATIVE_CONSTRAINTS, ChallengeAnswerKind.ANTIDERIVATIVE, VisualizerType.NONE, "F(x) =  + C", "F(x) = x^2 + C", "Include the antiderivative of every term and $+ C$.", ProblemMode.INTEGRAL, ClaimKind.EXPRESSION, ClaimKind.ANTIDERIVATIVE, ValidatorKey.ANTIDERIVATIVE, "F(x) = x^4 - \\frac{1}{2}\\cos(2x) + C", "F(x) = x^4 - \\frac{1}{2}\\cos(2x) + C", "F(x) = x^4 + \\frac{1}{2}\\cos(2x) + C"),
    _challenge(25, "complex-product", "Complex Product", "Complex", "Chain", "(2 + 3i)(1 - 2i)", "Simplify the product into rectangular form.", COMPLEX_CONSTRAINTS, ChallengeAnswerKind.EXPRESSION, VisualizerType.NONE, "", "3 - 2i", "Use $i$ for the imaginary part.", ProblemMode.COMPLEX_SIMPLIFY, ClaimKind.EXPRESSION, ClaimKind.EXPRESSION, ValidatorKey.COMPLEX_EXPRESSION, "8 - i", "8 - i", "8 + i"),
    _challenge(26, "real-and-imaginary-parts", "Real and Imaginary Parts", "Complex", "Foundation", "(3 + 4i) + (5 - 2i)", "Combine the real and imaginary components.", COMPLEX_CONSTRAINTS, ChallengeAnswerKind.EXPRESSION, VisualizerType.NONE, "", "7 + 3i", "Combine matching components only.", ProblemMode.COMPLEX_SIMPLIFY, ClaimKind.EXPRESSION, ClaimKind.EXPRESSION, ValidatorKey.COMPLEX_EXPRESSION, "8 + 2i", "8 + 2i", "8 + 3i"),
    _challenge(27, "subtract-every-part", "Subtract Every Part", "Complex", "Trap", "(7 - 5i) - (2 + 3i)", "Subtract both real and imaginary components.", COMPLEX_CONSTRAINTS, ChallengeAnswerKind.EXPRESSION, VisualizerType.NONE, "", "4 - i", "Distribute the subtraction through the second parentheses.", ProblemMode.COMPLEX_SIMPLIFY, ClaimKind.EXPRESSION, ClaimKind.EXPRESSION, ValidatorKey.COMPLEX_EXPRESSION, "5 - 8i", "5 - 8i", "5 - 7i"),
    _challenge(28, "multiply-by-i", "Multiply by i", "Complex", "Chain", "(1 + i)(3 - 2i)", "Simplify the product into rectangular form.", COMPLEX_CONSTRAINTS, ChallengeAnswerKind.EXPRESSION, VisualizerType.NONE, "", "2 + i", "Remember that $i^2 = -1$.", ProblemMode.COMPLEX_SIMPLIFY, ClaimKind.EXPRESSION, ClaimKind.EXPRESSION, ValidatorKey.COMPLEX_EXPRESSION, "5 + i", "5 + i", "5 - i"),
    _challenge(29, "double-distribution", "Double Distribution", "Complex", "Chain", "(4 - 3i)(2 + i)", "Simplify the product into rectangular form.", COMPLEX_CONSTRAINTS, ChallengeAnswerKind.EXPRESSION, VisualizerType.NONE, "", "1 - 4i", "Distribute every term before combining components.", ProblemMode.COMPLEX_SIMPLIFY, ClaimKind.EXPRESSION, ClaimKind.EXPRESSION, ValidatorKey.COMPLEX_EXPRESSION, "11 - 2i", "11 - 2i", "11 + 2i"),
    _challenge(30, "imaginary-pair", "Imaginary Pair", "Complex", "Trap", "x^2 + 9 = 0", "Find every imaginary solution of the equation.", ROOT_SET_CONSTRAINTS, ChallengeAnswerKind.SOLUTION_SET, VisualizerType.COMPLEX_PLANE, "\\{ \\}", "\\{i, -i\\}", "Use braces and include each solution once.", ProblemMode.COMPLEX_SOLVE, ClaimKind.EQUATION, ClaimKind.SOLUTION_SET, ValidatorKey.IMAGINARY_ROOT_SET, "\\{3i, -3i\\}", "\\{3i, -3i\\}", "\\{3i\\}"),
)

_BY_ID = {challenge.id: challenge for challenge in CHALLENGES}


def get_challenge(challenge_id: str) -> ChallengeDefinition | None:
    return _BY_ID.get(challenge_id)


def catalog_item(challenge: ChallengeDefinition) -> ChallengeCatalogItem:
    curriculum_node = curriculum_node_for_challenge(challenge.id)
    return ChallengeCatalogItem(
        id=challenge.id,
        number=challenge.number,
        slug=challenge.slug,
        title=challenge.title,
        topic=challenge.topic,
        difficulty=challenge.difficulty,
        answerKind=challenge.answer_kind,
        visualizerType=challenge.visualizer_type,
        simulationPreview=("Number line" if challenge.visualizer_type == VisualizerType.NUMBER_LINE else "Complex plane" if challenge.visualizer_type == VisualizerType.COMPLEX_PLANE else "Neutral workspace"),
        curriculumNodeId=curriculum_node.id if curriculum_node else None,
        strand=curriculum_node.strand if curriculum_node else None,
    )


def challenge_detail(challenge: ChallengeDefinition) -> ChallengeDetail:
    return ChallengeDetail(
        **catalog_item(challenge).model_dump(by_alias=True),
        statementLatex=challenge.statement_latex,
        statementText=challenge.statement_text,
        constraints=list(challenge.constraints),
        starterDraft=challenge.starter_draft,
        publicExampleLatex=challenge.public_example_latex,
        publicExampleText=challenge.public_example_text,
    )


def _is_zero(value: sp.Expr) -> bool:
    return sp.simplify(value) == 0


def _same_expression(first: sp.Expr, second: sp.Expr) -> bool:
    return _is_zero(first - second)


def _same_solution_set(first: list[sp.Expr], second: list[sp.Expr]) -> bool:
    return len(first) == len(second) and all(any(_same_expression(value, candidate) for candidate in second) for value in first)


def _parse_region(latex: str) -> dict[str, object]:
    left, right, operator = parse_inequality(latex)
    residual = sp.Poly(sp.expand(left - right), X)
    coefficient = sp.simplify(residual.coeff_monomial(X))
    constant = sp.simplify(residual.coeff_monomial(1))
    boundary = sp.simplify(-constant / coefficient)
    if not boundary.is_Rational:
        raise MathSyntaxError("The inequality boundary must be rational.")
    positive_coefficient = bool(coefficient > 0)
    direction = "left" if (operator in {"<", "<="} and positive_coefficient) or (operator in {">", ">="} and not positive_coefficient) else "right"
    return {
        "boundaryLatex": sp.latex(boundary),
        "direction": direction,
        "inclusive": operator in {"<=", ">="},
    }


def _same_region(first: dict[str, object], second: dict[str, object]) -> bool:
    return first == second


def _complex_points(latex: str) -> list[dict[str, float | str]]:
    points: list[dict[str, float | str]] = []
    for value in parse_solution_set(latex):
        real, imaginary = sp.re(value), sp.im(value)
        if not (real.is_Rational and imaginary.is_Rational):
            raise MathSyntaxError("Complex points must use rational real and imaginary parts.")
        points.append({"real": float(real), "imaginary": float(imaginary), "label": sp.latex(value)})
    return points


def _visualization(challenge: ChallengeDefinition, latex: str, phase: VisualizationPhase) -> ChallengeVisualization:
    if challenge.visualizer_type == VisualizerType.NUMBER_LINE:
        return ChallengeVisualization(type=VisualizerType.NUMBER_LINE, phase=phase, learnerData={"region": _parse_region(latex)})
    if challenge.visualizer_type == VisualizerType.COMPLEX_PLANE:
        return ChallengeVisualization(type=VisualizerType.COMPLEX_PLANE, phase=phase, learnerData={"points": _complex_points(latex)})
    return ChallengeVisualization(type=VisualizerType.NONE, phase=phase, learnerData={})


def preview_challenge(challenge: ChallengeDefinition, latex: str) -> ChallengePreviewResponse:
    return ChallengePreviewResponse(visualization=_visualization(challenge, latex, VisualizationPhase.DRAFT))


def _step(challenge: ChallengeDefinition, latex: str) -> ProofStep:
    return ProofStep(id=f"challenge-{challenge.id}-answer", latex=latex, kind=challenge.answer_kind_claim)


def _source_step(challenge: ChallengeDefinition) -> ProofStep:
    return ProofStep(id=f"challenge-{challenge.id}-source", latex=challenge.statement_latex, kind=challenge.source_kind)


def _verify_transition(challenge: ChallengeDefinition, latex: str) -> bool:
    result = verify_transition(challenge.mode, _source_step(challenge), _step(challenge, latex))
    if result.status.value == "unsupported":
        detail = result.limitations[0] if result.limitations else "Use the supported challenge notation."
        raise MathSyntaxError(detail)
    return result.status.value == "valid"


def _expanded_equation_matches(challenge: ChallengeDefinition, latex: str) -> bool:
    normalized = normalize_latex(latex)
    if re.search(r"\([^()]+\)\s*\^\s*2", normalized):
        return False
    submitted_left, submitted_right = parse_equation(latex)
    expected_left, expected_right = parse_equation(challenge.canonical_target)
    return _same_expression(sp.expand(submitted_left), sp.expand(expected_left)) and _same_expression(submitted_right, expected_right)


def _root_set_matches(challenge: ChallengeDefinition, latex: str) -> bool:
    source_left, source_right = parse_equation(challenge.statement_latex)
    roots = sp.solve(sp.expand(source_left - source_right), X)
    if not roots or any(not root.is_Rational for root in roots):
        raise MathSyntaxError("This challenge only supports distinct rational real roots.")
    return _same_solution_set(parse_solution_set(latex), list(roots))


def _validate(challenge: ChallengeDefinition, latex: str) -> bool:
    if challenge.validator_key == ValidatorKey.EXPANDED_EQUATION:
        return _expanded_equation_matches(challenge, latex)
    if challenge.validator_key == ValidatorKey.ROOT_SET:
        return _root_set_matches(challenge, latex)
    if challenge.validator_key == ValidatorKey.INEQUALITY:
        return _same_region(_parse_region(latex), _parse_region(challenge.canonical_target))
    if challenge.validator_key == ValidatorKey.ANTIDERIVATIVE:
        if not latex.replace(" ", "").endswith("+C"):
            raise MathSyntaxError("Use antiderivative notation like $F(x) = \\dots + C$.")
    return _verify_transition(challenge, latex)


def submit_challenge(challenge: ChallengeDefinition, latex: str) -> ChallengeSubmissionResponse:
    try:
        accepted = _validate(challenge, latex)
        phase = VisualizationPhase.ACCEPTED if accepted else VisualizationPhase.INCORRECT
        return ChallengeSubmissionResponse(
            status=ChallengeSubmissionStatus.ACCEPTED if accepted else ChallengeSubmissionStatus.INCORRECT,
            summary="Mathematical contract satisfied." if accepted else "Not accepted yet.",
            rule=("Submitted answer satisfies the challenge contract." if accepted else None),
            visualization=_visualization(challenge, latex, phase),
        )
    except MathSyntaxError as error:
        return ChallengeSubmissionResponse(
            status=ChallengeSubmissionStatus.FORMAT_ERROR,
            summary=str(error),
            visualization=ChallengeVisualization(type=challenge.visualizer_type, phase=VisualizationPhase.INCORRECT, learnerData={}),
        )
    except Exception:
        return ChallengeSubmissionResponse(
            status=ChallengeSubmissionStatus.UNSUPPORTED,
            summary="This challenge uses a form that is not available yet.",
            visualization=ChallengeVisualization(type=challenge.visualizer_type, phase=VisualizationPhase.INCORRECT, learnerData={}),
        )
