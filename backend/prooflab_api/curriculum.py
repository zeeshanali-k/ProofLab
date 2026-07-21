"""Versioned, typed curriculum content for the math expansion.

The registry is intentionally authored Python data.  It contains public
curriculum metadata and migration data for current activities, but never the
private comparators or canonical answers used by challenge verification.
"""

from __future__ import annotations

from dataclasses import dataclass

from .contracts import (
    CanonicalGoal,
    CanonicalGoalKind,
    ClaimKind,
    CurriculumExperience,
    LearnerTrack,
    ProblemMode,
    VisualizerType,
)


@dataclass(frozen=True)
class GuidedMissionDefinition:
    id: str
    title: str
    category: str
    mode: ProblemMode
    root_kind: ClaimKind
    prompt: str
    goal: str
    seed_steps: tuple[tuple[str, ClaimKind], ...]
    canonical_goal: CanonicalGoal | None
    curriculum_node_id: str


@dataclass(frozen=True)
class CurriculumNodeDefinition:
    id: str
    parent_id: str | None
    strand: str
    title: str
    summary: str
    prerequisites: tuple[str, ...]
    recommended_tracks: tuple[LearnerTrack, ...]
    objectives: tuple[str, ...]
    interaction_kinds: tuple[CurriculumExperience, ...]
    visualizer_type: VisualizerType
    concept_ids: tuple[str, ...]
    mission_ids: tuple[str, ...]
    template_ids: tuple[str, ...]
    leet_math_challenge_ids: tuple[str, ...]
    mastery_threshold: int = 3


ALL_TRACKS = (LearnerTrack.EXPLORER, LearnerTrack.LEARNER, LearnerTrack.PROFESSIONAL)
GUIDED_AND_LEETMATH = (CurriculumExperience.GUIDED_PROOFLAB, CurriculumExperience.LEETMATH)


GUIDED_MISSIONS: tuple[GuidedMissionDefinition, ...] = (
    GuidedMissionDefinition("missing-middle-term", "The missing middle term", "Quadratics", ProblemMode.ALGEBRA, ClaimKind.EQUATION, "(x + 2)^2 = 25", "Expand the square without losing a term.", (("x^2 + 4 = 25", ClaimKind.EQUATION),), None, "algebra.symbolic-reasoning"),
    GuidedMissionDefinition("linear-balance", "Keep both sides balanced", "Linear equations", ProblemMode.ALGEBRA, ClaimKind.EQUATION, "3x + 5 = 20", "Isolate x using the same operation on both sides.", (("3x = 15", ClaimKind.EQUATION), ("x = 5", ClaimKind.EQUATION)), None, "algebra.symbolic-reasoning"),
    GuidedMissionDefinition("inequality-sign-flip", "Flip the inequality sign", "Inequalities", ProblemMode.INEQUALITY, ClaimKind.INEQUALITY, "-2x + 3 > 7", "Keep the solution region when you divide by a negative.", (("-2x > 4", ClaimKind.INEQUALITY), ("x > -2", ClaimKind.INEQUALITY)), CanonicalGoal(kind=CanonicalGoalKind.INEQUALITY), "algebra.inequalities"),
    GuidedMissionDefinition("negative-square", "A negative cross term", "Quadratics", ProblemMode.ALGEBRA, ClaimKind.EQUATION, "(x - 3)^2 = 16", "Notice what changes when a binomial is squared.", (("x^2 + 9 = 16", ClaimKind.EQUATION),), None, "algebra.symbolic-reasoning"),
    GuidedMissionDefinition("quadratic-solution-check", "Test a proposed solution", "Quadratics", ProblemMode.ALGEBRA, ClaimKind.EQUATION, "x^2 - 5x + 6 = 0", "Rearrange, then test a value by substitution.", (("x^2 - 5x = -6", ClaimKind.EQUATION), ("x = 2", ClaimKind.EQUATION)), None, "algebra.symbolic-reasoning"),
    GuidedMissionDefinition("factor-then-solve", "Factor, then test a root", "Quadratics", ProblemMode.ALGEBRA, ClaimKind.EQUATION, "x^2 - 5x + 6 = 0", "Factor the quadratic, then test a root from the factors.", (("(x - 2)(x - 3) = 0", ClaimKind.EQUATION), ("x = 2", ClaimKind.EQUATION)), None, "algebra.symbolic-reasoning"),
    GuidedMissionDefinition("polynomial-derivative", "Differentiate a polynomial", "Calculus", ProblemMode.DERIVATIVE, ClaimKind.FUNCTION, "f(x) = x^3 + 2x", "Use the power rule to find the derivative.", (("f'(x) = 3x^2 + 2", ClaimKind.DERIVATIVE),), CanonicalGoal(kind=CanonicalGoalKind.DERIVATIVE, terminalDerivativeOrder=1), "calculus.derivatives"),
    GuidedMissionDefinition("trig-chain-derivative", "Differentiate a trig chain", "Calculus", ProblemMode.DERIVATIVE, ClaimKind.FUNCTION, "f(x) = \\sin(3x^2 + 1)", "Apply the chain rule to the polynomial inside sine.", (("f'(x) = 6x\\cos(3x^2 + 1)", ClaimKind.DERIVATIVE),), CanonicalGoal(kind=CanonicalGoalKind.DERIVATIVE, terminalDerivativeOrder=1), "calculus.derivatives"),
    GuidedMissionDefinition("product-rule-derivative", "Differentiate a product", "Calculus", ProblemMode.DERIVATIVE, ClaimKind.FUNCTION, "f(x) = x^2\\sin(x)", "Use the product rule to differentiate both factors.", (("f'(x) = 2x\\sin(x) + x^2\\cos(x)", ClaimKind.DERIVATIVE),), CanonicalGoal(kind=CanonicalGoalKind.DERIVATIVE, terminalDerivativeOrder=1), "calculus.derivatives"),
    GuidedMissionDefinition("repeated-derivative", "Differentiate twice", "Calculus", ProblemMode.DERIVATIVE, ClaimKind.FUNCTION, "f(x) = x^3 + \\sin(x)", "Find the second derivative, one derivative at a time.", (("f'(x) = 3x^2 + \\cos(x)", ClaimKind.DERIVATIVE),), CanonicalGoal(kind=CanonicalGoalKind.DERIVATIVE, terminalDerivativeOrder=2), "calculus.derivatives"),
    GuidedMissionDefinition("indefinite-integral", "Integrate polynomial and cosine", "Calculus", ProblemMode.INTEGRAL, ClaimKind.EXPRESSION, "\\int 3x^2 + \\cos(2x + 1)\\, dx", "Find any valid antiderivative and include + C.", (), None, "calculus.integrals"),
    GuidedMissionDefinition("missing-integration-constant", "Do not lose + C", "Calculus", ProblemMode.INTEGRAL, ClaimKind.EXPRESSION, "\\int x^2\\, dx", "Check whether an indefinite integral includes the constant of integration.", (("F(x) = \\frac{1}{3}x^3", ClaimKind.ANTIDERIVATIVE),), None, "calculus.integrals"),
    GuidedMissionDefinition("complex-product", "Multiply complex numbers", "Complex numbers", ProblemMode.COMPLEX_SIMPLIFY, ClaimKind.EXPRESSION, "(2 + 3i)(1 - 2i)", "Simplify into a + bi form.", (("8 + i", ClaimKind.EXPRESSION),), CanonicalGoal(kind=CanonicalGoalKind.COMPLEX_SIMPLIFY), "complex-numbers.simplification"),
    GuidedMissionDefinition("complex-roots", "Find both imaginary roots", "Complex equations", ProblemMode.COMPLEX_SOLVE, ClaimKind.EQUATION, "x^2 + 4 = 0", "Enter every solution in the complex solution set.", (("\\{2i\\}", ClaimKind.SOLUTION_SET),), CanonicalGoal(kind=CanonicalGoalKind.COMPLEX_SOLVE), "complex-numbers.solutions"),
    GuidedMissionDefinition("complex-complete-roots", "Complete a complex solution set", "Complex equations", ProblemMode.COMPLEX_SOLVE, ClaimKind.EQUATION, "x^2 + 9 = 0", "Include both imaginary roots in the solution set.", (("\\{3i, -3i\\}", ClaimKind.SOLUTION_SET),), CanonicalGoal(kind=CanonicalGoalKind.COMPLEX_SOLVE), "complex-numbers.solutions"),
)


_MISSION_IDS_BY_NODE: dict[str, tuple[str, ...]] = {
    node_id: tuple(mission.id for mission in GUIDED_MISSIONS if mission.curriculum_node_id == node_id)
    for node_id in {mission.curriculum_node_id for mission in GUIDED_MISSIONS}
}

_CHALLENGE_IDS_BY_NODE: dict[str, tuple[str, ...]] = {
    "algebra.symbolic-reasoning": ("001", "002", "006", "007", "008", "009", "010", "011"),
    "algebra.inequalities": ("003", "012", "013", "014", "015", "016"),
    "calculus.derivatives": ("004", "017", "018", "019", "020", "021"),
    "calculus.integrals": ("022", "023", "024"),
    "complex-numbers.simplification": ("025", "026", "027", "028", "029"),
    "complex-numbers.solutions": ("005", "030"),
}


def _node(
    node_id: str,
    strand: str,
    title: str,
    summary: str,
    *,
    prerequisites: tuple[str, ...] = (),
    objectives: tuple[str, ...],
    experiences: tuple[CurriculumExperience, ...],
    visualizer: VisualizerType = VisualizerType.NONE,
    concepts: tuple[str, ...] = (),
    parent_id: str | None = None,
    templates: tuple[str, ...] = (),
    mastery_threshold: int = 3,
) -> CurriculumNodeDefinition:
    return CurriculumNodeDefinition(
        id=node_id,
        parent_id=parent_id,
        strand=strand,
        title=title,
        summary=summary,
        prerequisites=prerequisites,
        recommended_tracks=ALL_TRACKS,
        objectives=objectives,
        interaction_kinds=experiences,
        visualizer_type=visualizer,
        concept_ids=concepts,
        mission_ids=_MISSION_IDS_BY_NODE.get(node_id, ()),
        template_ids=templates,
        leet_math_challenge_ids=_CHALLENGE_IDS_BY_NODE.get(node_id, ()),
        mastery_threshold=mastery_threshold,
    )


CURRICULUM_NODES: tuple[CurriculumNodeDefinition, ...] = (
    _node("foundations.quantitative-reasoning", "Number & quantitative foundations", "Math foundations", "Build reliable number, ratio, percentage, unit, estimation, and everyday-money habits.", objectives=("Build number sense", "Reason with quantities", "Apply math in everyday contexts"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.NUMBER_LINE, concepts=("foundations.quantitative-reasoning",)),
    _node("foundations.counting-place-value", "Number & quantitative foundations", "Counting and place value", "Read, compose, compare, and round whole numbers using place-value structure.", prerequisites=("foundations.quantitative-reasoning",), objectives=("Compose a number", "Read place values"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.PLACE_VALUE_BLOCKS, concepts=("foundations.counting-place-value",), parent_id="foundations.quantitative-reasoning", templates=("foundation-count-place-visual", "foundation-count-place-practice"), mastery_threshold=2),
    _node("foundations.integers-operations", "Number & quantitative foundations", "Integers and operations", "Use addition and subtraction on a number line, including negative values.", prerequisites=("foundations.counting-place-value",), objectives=("Locate integers", "Add and subtract signed numbers"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.NUMBER_LINE, concepts=("foundations.integers-operations",), parent_id="foundations.quantitative-reasoning", templates=("foundation-integers-visual", "foundation-integers-practice"), mastery_threshold=2),
    _node("foundations.order-factors-multiples", "Number & quantitative foundations", "Order, factors, and multiples", "Evaluate structured arithmetic and reason about common factors and multiples.", prerequisites=("foundations.integers-operations",), objectives=("Use operation order", "Identify common multiples"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.NUMBER_LINE, concepts=("foundations.order-factors-multiples",), parent_id="foundations.quantitative-reasoning", templates=("foundation-order-factors-visual", "foundation-order-factors-practice"), mastery_threshold=2),
    _node("foundations.fractions", "Number & quantitative foundations", "Fractions", "See fractions as equal parts and combine compatible quantities.", prerequisites=("foundations.counting-place-value",), objectives=("Compare fractions", "Add fractions"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.FRACTION_BARS, concepts=("foundations.fractions",), parent_id="foundations.quantitative-reasoning", templates=("foundation-fractions-visual", "foundation-fractions-practice"), mastery_threshold=2),
    _node("foundations.decimals", "Number & quantitative foundations", "Decimals", "Connect decimal values to tenths, hundredths, and fractional quantities.", prerequisites=("foundations.fractions",), objectives=("Compare decimals", "Subtract decimals"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.FRACTION_BARS, concepts=("foundations.decimals",), parent_id="foundations.quantitative-reasoning", templates=("foundation-decimals-visual", "foundation-decimals-practice"), mastery_threshold=2),
    _node("foundations.percentages", "Number & quantitative foundations", "Percentages", "Interpret percent as a part of 100 and calculate everyday portions.", prerequisites=("foundations.decimals",), objectives=("Convert percent", "Find a percent of a quantity"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.RATIO_TABLE, concepts=("foundations.percentages",), parent_id="foundations.quantitative-reasoning", templates=("foundation-percentages-visual", "foundation-percentages-practice"), mastery_threshold=2),
    _node("foundations.ratios-rates-proportions", "Number & quantitative foundations", "Ratios, rates, and proportions", "Compare related quantities and scale them proportionally.", prerequisites=("foundations.percentages",), objectives=("Build a ratio table", "Find a unit rate"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.RATIO_TABLE, concepts=("foundations.ratios-rates-proportions",), parent_id="foundations.quantitative-reasoning", templates=("foundation-ratios-visual", "foundation-ratios-practice"), mastery_threshold=2),
    _node("foundations.units-measurement", "Number & quantitative foundations", "Units and measurement", "Convert compatible units and make measurements meaningful.", prerequisites=("foundations.ratios-rates-proportions",), objectives=("Convert units", "Choose useful units"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.RATIO_TABLE, concepts=("foundations.units-measurement",), parent_id="foundations.quantitative-reasoning", templates=("foundation-units-visual", "foundation-units-practice"), mastery_threshold=2),
    _node("foundations.estimation", "Number & quantitative foundations", "Estimation", "Use sensible rounding to make quick, defensible quantity estimates.", prerequisites=("foundations.decimals",), objectives=("Round intentionally", "Estimate a result"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.PLACE_VALUE_BLOCKS, concepts=("foundations.estimation",), parent_id="foundations.quantitative-reasoning", templates=("foundation-estimation-visual", "foundation-estimation-practice"), mastery_threshold=2),
    _node("foundations.financial-arithmetic", "Number & quantitative foundations", "Everyday money math", "Use USD discounts, tax, tips, unit prices, budgets, and simple interest with cents rounding.", prerequisites=("foundations.percentages", "foundations.ratios-rates-proportions"), objectives=("Calculate a total", "Compare money choices"), experiences=(CurriculumExperience.VISUAL_MATH_LAB,), visualizer=VisualizerType.RATIO_TABLE, concepts=("foundations.financial-arithmetic",), parent_id="foundations.quantitative-reasoning", templates=("foundation-finance-visual", "foundation-finance-practice"), mastery_threshold=2),
    _node("functions.representations", "Pre-algebra & functions", "Functions and representations", "Read tables, coordinate planes, patterns, and function transformations.", prerequisites=("foundations.quantitative-reasoning",), objectives=("Interpret a function", "Connect tables, rules, and graphs"), experiences=(CurriculumExperience.VISUAL_MATH_LAB, CurriculumExperience.GUIDED_PROOFLAB), concepts=("functions.representations",)),
    _node("algebra.symbolic-reasoning", "Algebra", "Symbolic equations and quadratics", "Transform expressions and solve bounded linear and quadratic equations.", prerequisites=("foundations.quantitative-reasoning",), objectives=("Preserve equality", "Expand and factor polynomials", "Check solutions"), experiences=GUIDED_AND_LEETMATH, concepts=("algebra.linear-equations",)),
    _node("algebra.inequalities", "Algebra", "Inequalities and solution regions", "Represent a one-variable solution region and preserve it through transformations.", prerequisites=("algebra.symbolic-reasoning",), objectives=("Solve inequalities", "Recognize sign reversals"), experiences=(CurriculumExperience.GUIDED_PROOFLAB, CurriculumExperience.VISUAL_MATH_LAB, CurriculumExperience.LEETMATH), visualizer=VisualizerType.NUMBER_LINE, concepts=("algebra.inequalities",)),
    _node("geometry.trigonometry", "Geometry & trigonometry", "Geometry, vectors, and trigonometry", "Use coordinate, triangle, circle, vector, and unit-circle relationships.", prerequisites=("functions.representations",), objectives=("Reason with shape and scale", "Use trigonometric functions"), experiences=(CurriculumExperience.VISUAL_MATH_LAB, CurriculumExperience.GUIDED_PROOFLAB, CurriculumExperience.LEETMATH), concepts=("geometry.trigonometry",)),
    _node("calculus.derivatives", "Calculus", "Rates of change and derivatives", "Differentiate bounded polynomial and trigonometric functions and interpret local change.", prerequisites=("functions.representations", "algebra.symbolic-reasoning"), objectives=("Apply derivative rules", "Model instantaneous rate of change"), experiences=GUIDED_AND_LEETMATH, concepts=("calculus.derivatives",)),
    _node("calculus.integrals", "Calculus", "Accumulation and integrals", "Find bounded antiderivatives and connect accumulation to area.", prerequisites=("calculus.derivatives",), objectives=("Find an antiderivative", "Include the integration constant"), experiences=(CurriculumExperience.GUIDED_PROOFLAB, CurriculumExperience.VISUAL_MATH_LAB, CurriculumExperience.LEETMATH), concepts=("calculus.integrals",)),
    _node("complex-numbers.simplification", "Algebra", "Complex-number arithmetic", "Use rectangular complex arithmetic with deterministic symbolic checks.", prerequisites=("algebra.symbolic-reasoning",), objectives=("Combine real and imaginary parts", "Multiply complex expressions"), experiences=GUIDED_AND_LEETMATH, concepts=("complex-numbers.simplification",)),
    _node("complex-numbers.solutions", "Algebra", "Complex solution sets", "State complete bounded imaginary root sets.", prerequisites=("complex-numbers.simplification",), objectives=("Solve simple complex equations", "List each distinct root"), experiences=(CurriculumExperience.GUIDED_PROOFLAB, CurriculumExperience.VISUAL_MATH_LAB, CurriculumExperience.LEETMATH), visualizer=VisualizerType.COMPLEX_PLANE, concepts=("complex-numbers.solutions",)),
    _node("discrete.probability", "Discrete math & probability", "Logic, counting, and probability", "Develop exact reasoning with sets, cases, probability, and distributions.", prerequisites=("foundations.quantitative-reasoning",), objectives=("Count systematically", "Interpret conditional probability"), experiences=(CurriculumExperience.VISUAL_MATH_LAB, CurriculumExperience.LEETMATH), concepts=("discrete.probability",)),
    _node("statistics.data", "Statistics & data", "Statistics and uncertainty", "Read variation, sampling, regression, and uncertainty without false precision.", prerequisites=("foundations.quantitative-reasoning",), objectives=("Describe data", "Interpret uncertainty"), experiences=(CurriculumExperience.VISUAL_MATH_LAB, CurriculumExperience.LEETMATH), concepts=("statistics.data",)),
    _node("linear-algebra.numerical-methods", "Linear algebra & numerical methods", "Linear systems and numerical methods", "Work with matrices, transformations, iterative approximation, and tolerances.", prerequisites=("algebra.symbolic-reasoning",), objectives=("Represent a linear system", "Reason about approximation"), experiences=(CurriculumExperience.VISUAL_MATH_LAB, CurriculumExperience.LEETMATH), concepts=("linear-algebra.numerical-methods",)),
    _node("applied.modeling-optimization", "Applied modeling & optimization", "Applied models and decisions", "Model changing quantities, constraints, uncertainty, and trade-offs.", prerequisites=("functions.representations", "algebra.symbolic-reasoning"), objectives=("State assumptions", "Compare constrained options"), experiences=(CurriculumExperience.VISUAL_MATH_LAB, CurriculumExperience.LEETMATH), concepts=("applied.modeling-optimization",)),
)

_NODES_BY_ID = {node.id: node for node in CURRICULUM_NODES}
_MISSIONS_BY_ID = {mission.id: mission for mission in GUIDED_MISSIONS}
_NODE_ID_BY_CHALLENGE_ID = {
    challenge_id: node_id
    for node_id, challenge_ids in _CHALLENGE_IDS_BY_NODE.items()
    for challenge_id in challenge_ids
}


def get_curriculum_node(node_id: str) -> CurriculumNodeDefinition | None:
    return _NODES_BY_ID.get(node_id)


def get_guided_mission(mission_id: str) -> GuidedMissionDefinition | None:
    return _MISSIONS_BY_ID.get(mission_id)


def curriculum_node_for_challenge(challenge_id: str) -> CurriculumNodeDefinition | None:
    node_id = _NODE_ID_BY_CHALLENGE_ID.get(challenge_id)
    return _NODES_BY_ID.get(node_id) if node_id else None


def curriculum_node_for_mission(mission_id: str) -> CurriculumNodeDefinition | None:
    mission = get_guided_mission(mission_id)
    return _NODES_BY_ID.get(mission.curriculum_node_id) if mission else None


def concept_for_guided_mission(mission_id: str) -> str | None:
    node = curriculum_node_for_mission(mission_id)
    return node.concept_ids[0] if node and node.concept_ids else None


def concept_for_challenge(challenge_id: str) -> str | None:
    node = curriculum_node_for_challenge(challenge_id)
    return node.concept_ids[0] if node and node.concept_ids else None


def mastery_threshold_for_concept(concept_id: str) -> int:
    """Return authored mastery requirements without changing legacy concepts."""
    return next(
        (node.mastery_threshold for node in CURRICULUM_NODES if concept_id in node.concept_ids),
        3,
    )


def requires_first_try_for_concept(concept_id: str) -> bool:
    node = next((item for item in CURRICULUM_NODES if concept_id in item.concept_ids), None)
    return node is None or node.parent_id != "foundations.quantitative-reasoning"


def missions_for_node(node_id: str) -> tuple[GuidedMissionDefinition, ...]:
    return tuple(mission for mission in GUIDED_MISSIONS if mission.curriculum_node_id == node_id)
