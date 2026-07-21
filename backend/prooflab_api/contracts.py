from __future__ import annotations

from datetime import datetime
from enum import Enum
import re
from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class LearningGoal(str, Enum):
    UNDERSTAND_CONCEPTS = "understand-concepts"
    PRACTICE_PROBLEMS = "practice-problems"
    PREPARE_FOR_WORK = "prepare-for-work"


class ConfidenceLevel(str, Enum):
    NEW = "new"
    DEVELOPING = "developing"
    CONFIDENT = "confident"


class LearnerTrack(str, Enum):
    EXPLORER = "explorer"
    LEARNER = "learner"
    PROFESSIONAL = "professional"


class CredentialRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)
    password: str = Field(min_length=10, max_length=128)

    @field_validator("email")
    @classmethod
    def valid_email(cls, value: str) -> str:
        normalized = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", normalized):
            raise ValueError("Enter a valid email address.")
        return normalized


class RegisterRequest(CredentialRequest):
    model_config = ConfigDict(populate_by_name=True)

    goal: LearningGoal
    confidence: ConfidenceLevel
    active_track: LearnerTrack | None = Field(default=None, alias="activeTrack")


class LoginRequest(CredentialRequest):
    pass


class ProfileUpdateRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    goal: LearningGoal | None = None
    confidence: ConfidenceLevel | None = None
    active_track: LearnerTrack | None = Field(default=None, alias="activeTrack")
    gamification_enabled: bool | None = Field(default=None, alias="gamificationEnabled")

    @model_validator(mode="after")
    def has_an_update(self) -> "ProfileUpdateRequest":
        if not self.model_fields_set:
            raise ValueError("Provide at least one profile change.")
        return self


class ProfilePayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    goal: LearningGoal
    confidence: ConfidenceLevel
    active_track: LearnerTrack = Field(alias="activeTrack")
    gamification_enabled: bool = Field(alias="gamificationEnabled")
    onboarding_completed: bool = Field(alias="onboardingCompleted")


class SafeUserPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    email: str
    created_at: datetime = Field(alias="createdAt")


class CurrentUserPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user: SafeUserPayload
    profile: ProfilePayload


class ActivityAttemptPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    activity_kind: str = Field(alias="activityKind")
    activity_id: str = Field(alias="activityId")
    concept_id: str | None = Field(alias="conceptId")
    outcome: str
    attempt_ordinal: int = Field(alias="attemptOrdinal")
    created_at: datetime = Field(alias="createdAt")


class MasteryPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    concept_id: str = Field(alias="conceptId")
    status: str
    distinct_successes: int = Field(alias="distinctSuccesses")
    first_try_successes: int = Field(alias="firstTrySuccesses")


class AchievementPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    code: str
    earned_at: datetime = Field(alias="earnedAt")


class DashboardResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    total_xp: int = Field(alias="totalXp")
    streak: int
    mastery: list[MasteryPayload]
    recent_activities: list[ActivityAttemptPayload] = Field(alias="recentActivities")
    achievements: list[AchievementPayload]
    recommendation: LearnerTrack


class ActivityIntroductionRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    activity_kind: Literal["guided", "leetmath"] = Field(alias="activityKind")
    activity_id: str = Field(alias="activityId", min_length=1, max_length=128)


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


class ChallengeAnswerKind(str, Enum):
    EQUATION = "equation"
    INEQUALITY = "inequality"
    DERIVATIVE = "derivative"
    ANTIDERIVATIVE = "antiderivative"
    EXPRESSION = "expression"
    SOLUTION_SET = "solution-set"


class VisualizerType(str, Enum):
    NONE = "none"
    NUMBER_LINE = "number-line"
    COMPLEX_PLANE = "complex-plane"


class CurriculumExperience(str, Enum):
    GUIDED_PROOFLAB = "guided-prooflab"
    VISUAL_MATH_LAB = "visual-math-lab"
    LEETMATH = "leetmath"


class VisualizationPhase(str, Enum):
    DRAFT = "draft"
    ACCEPTED = "accepted"
    INCORRECT = "incorrect"


class ChallengeSubmissionStatus(str, Enum):
    ACCEPTED = "accepted"
    INCORRECT = "incorrect"
    FORMAT_ERROR = "format-error"
    UNSUPPORTED = "unsupported"


class ChallengeCatalogItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    number: int
    slug: str
    title: str
    topic: str
    difficulty: str
    answer_kind: ChallengeAnswerKind = Field(alias="answerKind")
    visualizer_type: VisualizerType = Field(alias="visualizerType")
    simulation_preview: str = Field(alias="simulationPreview")
    curriculum_node_id: str | None = Field(default=None, alias="curriculumNodeId")
    strand: str | None = None


class ChallengeDetail(ChallengeCatalogItem):
    statement_latex: str = Field(alias="statementLatex")
    statement_text: str = Field(alias="statementText")
    constraints: list[str]
    starter_draft: str = Field(alias="starterDraft")
    public_example_latex: str = Field(alias="publicExampleLatex")
    public_example_text: str = Field(alias="publicExampleText")


class ChallengePreviewRequest(BaseModel):
    latex: str = Field(min_length=1, max_length=1_500)


class ChallengeSubmitRequest(ChallengePreviewRequest):
    pass


class ChallengeVisualization(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    type: VisualizerType
    phase: VisualizationPhase
    learner_data: dict[str, object] = Field(default_factory=dict, alias="learnerData")


class ChallengePreviewResponse(BaseModel):
    visualization: ChallengeVisualization


class ChallengeSubmissionResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: ChallengeSubmissionStatus
    summary: str
    rule: str | None = None
    visualization: ChallengeVisualization
    submission_id: int | None = Field(default=None, alias="submissionId")
    attempt_count: int = Field(default=0, alias="attemptCount")
    earned_xp: int = Field(default=0, alias="earnedXp")
    total_xp: int = Field(default=0, alias="totalXp")
    mastery_status: str | None = Field(default=None, alias="masteryStatus")


class ChallengeSubmissionRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: int
    challenge_id: str = Field(alias="challengeId")
    submitted_latex: str = Field(alias="submittedLatex")
    status: ChallengeSubmissionStatus
    created_at: datetime = Field(alias="createdAt")


class ChallengeCatalogProgress(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    challenge_id: str = Field(alias="challengeId")
    status: Literal["solved", "attempting"]
    attempt_count: int = Field(alias="attemptCount")


class CurriculumNodePayload(BaseModel):
    """Learner-safe authored curriculum metadata.

    This is deliberately content metadata only: no template seed, comparator,
    canonical answer, or private solution path is exposed here.
    """

    model_config = ConfigDict(populate_by_name=True)

    id: str
    strand: str
    title: str
    summary: str
    prerequisites: list[str]
    recommended_tracks: list[LearnerTrack] = Field(alias="recommendedTracks")
    objectives: list[str]
    interaction_kinds: list[CurriculumExperience] = Field(alias="interactionKinds")
    visualizer_type: VisualizerType = Field(alias="visualizerType")
    concept_ids: list[str] = Field(alias="conceptIds")
    mission_ids: list[str] = Field(alias="missionIds")
    template_ids: list[str] = Field(alias="templateIds")
    leet_math_challenge_ids: list[str] = Field(alias="leetMathChallengeIds")
    mastery_threshold: int = Field(alias="masteryThreshold", ge=1)


class GuidedMissionSeedStep(BaseModel):
    math: str
    kind: ClaimKind


class GuidedMissionPayload(BaseModel):
    """Public migration shape used by the existing Guided ProofLab client."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    title: str
    category: str
    mode: ProblemMode
    root_kind: ClaimKind = Field(alias="rootKind")
    prompt: str
    goal: str
    seed_steps: list[GuidedMissionSeedStep] = Field(alias="seedSteps")
    canonical_goal: CanonicalGoal | None = Field(default=None, alias="canonicalGoal")
    curriculum_node_id: str = Field(alias="curriculumNodeId")
    allowed_experiences: list[CurriculumExperience] = Field(alias="allowedExperiences")


class CurriculumRecommendationPayload(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    node_id: str = Field(alias="nodeId")
    reason: str
    catch_up_node_id: str | None = Field(default=None, alias="catchUpNodeId")


class CurriculumProgressSummary(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    introduced_concept_ids: list[str] = Field(alias="introducedConceptIds")
    mastered_concept_ids: list[str] = Field(alias="masteredConceptIds")
    recommended_track: LearnerTrack = Field(alias="recommendedTrack")


class CurriculumCatalogResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    nodes: list[CurriculumNodePayload]
    recommendations: list[CurriculumRecommendationPayload]
    progress_summary: CurriculumProgressSummary = Field(alias="progressSummary")


class CurriculumNodeDetailResponse(CurriculumNodePayload):
    missions: list[GuidedMissionPayload]
    allowed_experiences: list[CurriculumExperience] = Field(alias="allowedExperiences")


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
    activity_id: str | None = Field(default=None, alias="activityId", min_length=1, max_length=128)


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
    activity_id: str | None = Field(default=None, alias="activityId", min_length=1, max_length=128)


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
