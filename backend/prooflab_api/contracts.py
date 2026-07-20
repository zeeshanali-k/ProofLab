from __future__ import annotations

from enum import Enum
from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, Field, model_validator


class ProblemMode(str, Enum):
    ALGEBRA = "algebra"
    INEQUALITY = "inequality"
    DERIVATIVE = "derivative"
    INTEGRAL = "integral"
    COMPLEX_SIMPLIFY = "complex-simplify"
    COMPLEX_SOLVE = "complex-solve"


class ClaimKind(str, Enum):
    EQUATION = "equation"
    INEQUALITY = "inequality"
    EXPRESSION = "expression"
    FUNCTION = "function"
    DERIVATIVE = "derivative"
    ANTIDERIVATIVE = "antiderivative"
    SOLUTION_SET = "solution-set"


class VerificationStatus(str, Enum):
    VALID = "valid"
    INVALID = "invalid"
    UNSUPPORTED = "unsupported"
    INCONCLUSIVE = "inconclusive"


class ProofStep(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(min_length=1, max_length=128)
    latex: str = Field(min_length=1, max_length=1_500)
    kind: ClaimKind


class EquationEvaluation(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    left_latex: str = Field(alias="leftLatex")
    right_latex: str = Field(alias="rightLatex")
    left_value: str = Field(alias="leftValue")
    right_value: str = Field(alias="rightValue")


class EvaluationEvidence(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    kind: Literal["evaluation"]
    input_latex: str = Field(alias="inputLatex")
    previous: EquationEvaluation
    next: EquationEvaluation


class DerivativeEvidence(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    kind: Literal["derivative-check"]
    input_latex: str = Field(alias="inputLatex")
    expected_latex: str = Field(alias="expectedLatex")
    submitted_latex: str = Field(alias="submittedLatex")
    expected_value: str = Field(alias="expectedValue")
    submitted_value: str = Field(alias="submittedValue")


class ComplexComparisonEvidence(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    kind: Literal["complex-comparison"]
    expected_latex: str = Field(alias="expectedLatex")
    submitted_latex: str = Field(alias="submittedLatex")
    difference_latex: str = Field(alias="differenceLatex")


class SolutionSetEvidence(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    kind: Literal["solution-set"]
    expected_solutions_latex: list[str] = Field(alias="expectedSolutionsLatex")
    submitted_solutions_latex: list[str] = Field(alias="submittedSolutionsLatex")
    missing_solutions_latex: list[str] = Field(default_factory=list, alias="missingSolutionsLatex")
    unexpected_solutions_latex: list[str] = Field(default_factory=list, alias="unexpectedSolutionsLatex")


class InequalityRegion(BaseModel):
    """A server-normalized half-line; clients render it without solving math."""

    model_config = ConfigDict(populate_by_name=True)

    boundary_latex: str = Field(alias="boundaryLatex")
    direction: Literal["left", "right"]
    inclusive: bool


class InequalityNumberLine(BaseModel):
    """Relative plot positions, constrained so the browser never derives them."""

    model_config = ConfigDict(populate_by_name=True)

    previous_boundary_position: float = Field(alias="previousBoundaryPosition", ge=0, le=100)
    submitted_boundary_position: float = Field(alias="submittedBoundaryPosition", ge=0, le=100)
    test_value_position: float = Field(alias="testValuePosition", ge=0, le=100)


class InequalityRegionEvidence(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    kind: Literal["inequality-region"]
    previous_region: InequalityRegion = Field(alias="previousRegion")
    submitted_region: InequalityRegion = Field(alias="submittedRegion")
    test_value_latex: str = Field(alias="testValueLatex")
    previous_includes_test: bool = Field(alias="previousIncludesTest")
    submitted_includes_test: bool = Field(alias="submittedIncludesTest")
    number_line: InequalityNumberLine = Field(alias="numberLine")


Evidence = Annotated[
    Union[
        EvaluationEvidence,
        DerivativeEvidence,
        ComplexComparisonEvidence,
        SolutionSetEvidence,
        InequalityRegionEvidence,
    ],
    Field(discriminator="kind"),
]


class VerificationResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: VerificationStatus
    rule: str | None = None
    summary: str
    evidence: Evidence | None = None
    likely_missing_term: str | None = Field(default=None, alias="likelyMissingTerm")
    verified_repair_latex: str | None = Field(default=None, alias="verifiedRepairLatex")
    limitations: list[str] | None = None


class VerifyRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    mode: ProblemMode
    previous_step: ProofStep = Field(alias="previousStep")
    next_step: ProofStep = Field(alias="nextStep")


class CanonicalGoalKind(str, Enum):
    INEQUALITY = "inequality"
    DERIVATIVE = "derivative"
    COMPLEX_SIMPLIFY = "complex-simplify"
    COMPLEX_SOLVE = "complex-solve"


class CanonicalGoal(BaseModel):
    """The problem-defined target; it is never inferred from learner input."""

    model_config = ConfigDict(populate_by_name=True)

    kind: CanonicalGoalKind
    terminal_derivative_order: int | None = Field(default=None, alias="terminalDerivativeOrder", ge=1, le=8)

    @model_validator(mode="after")
    def derivative_targets_need_an_order(self) -> "CanonicalGoal":
        if self.kind == CanonicalGoalKind.DERIVATIVE and self.terminal_derivative_order is None:
            raise ValueError("Derivative goals need terminalDerivativeOrder.")
        if self.kind != CanonicalGoalKind.DERIVATIVE and self.terminal_derivative_order is not None:
            raise ValueError("Only derivative goals use terminalDerivativeOrder.")
        return self


class CompletionStatus(str, Enum):
    COMPLETE = "complete"
    IN_PROGRESS = "in-progress"
    NEEDS_CORRECTION = "needs-correction"
    NOT_APPLICABLE = "not-applicable"


class CompletionResult(BaseModel):
    """Deliberately contains no expression or answer disclosure."""

    status: CompletionStatus


class AssessCompletionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    mode: ProblemMode
    given_step: ProofStep = Field(alias="givenStep")
    terminal_learner_step: ProofStep = Field(alias="terminalLearnerStep")
    learner_steps: list[ProofStep] = Field(default_factory=list, alias="learnerSteps", max_length=64)
    canonical_goal: CanonicalGoal | None = Field(default=None, alias="canonicalGoal")


class RevealFinalFormRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    mode: ProblemMode
    given_step: ProofStep = Field(alias="givenStep")
    canonical_goal: CanonicalGoal | None = Field(default=None, alias="canonicalGoal")


class RevealFinalFormResult(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    canonical_latex: str = Field(alias="canonicalLatex")


class ExplainMode(str, Enum):
    HINT = "hint"
    EXPLAIN = "explain"
    REPAIR = "repair"


class ExplanationRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    mode: ExplainMode
    previous_step: str = Field(alias="previousStep", min_length=1, max_length=1_500)
    next_step: str = Field(alias="nextStep", min_length=1, max_length=1_500)
    verification: VerificationResult


class ExplanationResult(BaseModel):
    title: str = Field(min_length=1, max_length=90)
    body: str = Field(min_length=1, max_length=700)
    question: str | None = Field(default=None, max_length=400)
    repair_latex: str | None = Field(default=None, alias="repairLatex", max_length=400)


class ErrorResponse(BaseModel):
    error: str
