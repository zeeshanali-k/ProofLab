from __future__ import annotations

import os
import sys
from pathlib import Path
from uuid import UUID

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

if __package__ in {None, ""}:
    # `uv run main.py` executes this file outside its package. Add the backend
    # directory, then import through the package so every sibling module keeps
    # its normal relative imports.
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from prooflab_api.contracts import (
        AssessCompletionRequest,
        ChallengeDetail,
        ChallengePreviewRequest,
        ChallengePreviewResponse,
        ChallengeSubmissionResponse,
        ChallengeSubmissionRecord,
        ChallengeSubmitRequest,
        ChallengeCatalogItem,
        CompletionResult,
        ErrorResponse,
        ExplanationRequest,
        ExplanationResult,
        RevealFinalFormRequest,
        RevealFinalFormResult,
        VerificationResult,
        VerifyRequest,
    )
    from prooflab_api.teaching import TeachingProviderError, get_teaching_provider
    from prooflab_api.verifier import assess_completion, canonical_final_latex, verify_transition
    from prooflab_api.parser import MathSyntaxError
    from prooflab_api.challenges import CHALLENGES, catalog_item, challenge_detail, get_challenge, preview_challenge, submit_challenge
    from prooflab_api.submissions import SubmissionRepository, StoredSubmission
else:
    from .contracts import (
        AssessCompletionRequest,
        ChallengeDetail,
        ChallengePreviewRequest,
        ChallengePreviewResponse,
        ChallengeSubmissionResponse,
        ChallengeSubmissionRecord,
        ChallengeSubmitRequest,
        ChallengeCatalogItem,
        CompletionResult,
        ErrorResponse,
        ExplanationRequest,
        ExplanationResult,
        RevealFinalFormRequest,
        RevealFinalFormResult,
        VerificationResult,
        VerifyRequest,
    )
    from .teaching import TeachingProviderError, get_teaching_provider
    from .verifier import assess_completion, canonical_final_latex, verify_transition
    from .parser import MathSyntaxError
    from .challenges import CHALLENGES, catalog_item, challenge_detail, get_challenge, preview_challenge, submit_challenge
    from .submissions import SubmissionRepository, StoredSubmission


def _allowed_origins() -> list[str]:
    configured = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    return [origin.strip() for origin in configured.split(",") if origin.strip()]


app = FastAPI(title="ProofLab API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["content-type", "x-prooflab-session"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


def _challenge_or_404(challenge_id: str):
    challenge = get_challenge(challenge_id)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    return challenge


def _authenticated_user_id(request: Request) -> str | None:
    """Future auth middleware sets this value after validating credentials."""
    candidate = getattr(request.state, "authenticated_user_id", None)
    return candidate.strip() if isinstance(candidate, str) and candidate.strip() else None


def _anonymous_session_id(value: str) -> str:
    """Normalize the opaque browser session token before it becomes an owner key."""
    try:
        return str(UUID(value))
    except (TypeError, ValueError) as error:
        raise HTTPException(status_code=422, detail="X-ProofLab-Session must be a valid session identifier.") from error


def _submission_record(record: StoredSubmission) -> ChallengeSubmissionRecord:
    return ChallengeSubmissionRecord(
        id=record.id,
        challengeId=record.challenge_id,
        submittedLatex=record.submitted_latex,
        status=record.status,
        createdAt=record.created_at,
    )


@app.get("/challenges", response_model=list[ChallengeCatalogItem])
async def challenges() -> list[ChallengeCatalogItem]:
    return [catalog_item(challenge) for challenge in CHALLENGES]


@app.get("/challenges/{challenge_id}", response_model=ChallengeDetail)
async def challenge(challenge_id: str) -> ChallengeDetail:
    return challenge_detail(_challenge_or_404(challenge_id))


@app.post("/challenges/{challenge_id}/preview", response_model=ChallengePreviewResponse, responses={422: {"model": ErrorResponse}})
async def preview(challenge_id: str, request: ChallengePreviewRequest) -> ChallengePreviewResponse:
    try:
        return preview_challenge(_challenge_or_404(challenge_id), request.latex)
    except MathSyntaxError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.post("/challenges/{challenge_id}/submit", response_model=ChallengeSubmissionResponse)
async def submit(challenge_id: str, request: ChallengeSubmitRequest, http_request: Request) -> ChallengeSubmissionResponse:
    result = submit_challenge(_challenge_or_404(challenge_id), request.latex)
    repository = SubmissionRepository()
    user_id = _authenticated_user_id(http_request)
    record = repository.record(
        anonymous_session_id=str(request.anonymous_session_id),
        authenticated_user_id=user_id,
        challenge_id=challenge_id,
        submitted_latex=request.latex,
        status=result.status.value,
    )
    attempt_count = repository.count_for_challenge(
        anonymous_session_id=str(request.anonymous_session_id),
        authenticated_user_id=user_id,
        challenge_id=challenge_id,
    )
    return result.model_copy(update={"submission_id": record.id, "attempt_count": attempt_count})


@app.get("/challenges/{challenge_id}/submissions", response_model=list[ChallengeSubmissionRecord])
async def submission_history(
    challenge_id: str,
    request: Request,
    anonymous_session_id: str = Header(alias="X-ProofLab-Session"),
) -> list[ChallengeSubmissionRecord]:
    _challenge_or_404(challenge_id)
    records = SubmissionRepository().list_for_challenge(
        anonymous_session_id=_anonymous_session_id(anonymous_session_id),
        authenticated_user_id=_authenticated_user_id(request),
        challenge_id=challenge_id,
    )
    return [_submission_record(record) for record in records]


@app.post("/verify", response_model=VerificationResult, responses={422: {"model": ErrorResponse}})
async def verify(request: VerifyRequest) -> VerificationResult:
    return verify_transition(request.mode, request.previous_step, request.next_step)


@app.post("/assess-completion", response_model=CompletionResult, responses={422: {"model": ErrorResponse}})
async def assess(request: AssessCompletionRequest) -> CompletionResult:
    return assess_completion(
        request.mode,
        request.given_step,
        request.terminal_learner_step,
        request.learner_steps,
        request.canonical_goal,
    )


@app.post("/reveal-final-form", response_model=RevealFinalFormResult, responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}})
async def reveal_final_form(request: RevealFinalFormRequest) -> RevealFinalFormResult:
    try:
        return RevealFinalFormResult(canonicalLatex=canonical_final_latex(request.mode, request.given_step, request.canonical_goal))
    except MathSyntaxError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post("/explain", response_model=ExplanationResult, responses={400: {"model": ErrorResponse}, 502: {"model": ErrorResponse}, 503: {"model": ErrorResponse}})
async def explain(request: ExplanationRequest) -> ExplanationResult:
    try:
        return await get_teaching_provider().generate(request)
    except TeachingProviderError as error:
        raise HTTPException(status_code=error.status_code, detail=error.args[0]) from error


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
