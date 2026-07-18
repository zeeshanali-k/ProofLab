from __future__ import annotations

from enum import Enum
from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, Field


class ProblemMode(str, Enum):
    ALGEBRA = "algebra"
    DERIVATIVE = "derivative"
    COMPLEX_SIMPLIFY = "complex-simplify"
    COMPLEX_SOLVE = "complex-solve"


class ClaimKind(str, Enum):
    EQUATION = "equation"
    EXPRESSION = "expression"
    FUNCTION = "function"
    DERIVATIVE = "derivative"
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


Evidence = Annotated[
    Union[EvaluationEvidence, DerivativeEvidence, ComplexComparisonEvidence, SolutionSetEvidence],
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
