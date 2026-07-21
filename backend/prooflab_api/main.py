from __future__ import annotations

import os
import sys
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

if __package__ in {None, ""}:
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from prooflab_api.auth import (
        INVALID_CREDENTIALS_MESSAGE,
        SESSION_COOKIE_NAME,
        CurrentUser,
        DuplicateEmailError,
        clear_login_failures,
        create_session,
        create_user,
        login_is_limited,
        normalize_email,
        record_login_failure,
        require_current_user,
        revoke_session,
        secure_cookie_enabled,
        verify_password,
    )
    from prooflab_api.challenges import CHALLENGES, catalog_item, challenge_detail, get_challenge, preview_challenge, submit_challenge
    from prooflab_api.contracts import (
        ActivityIntroductionRequest,
        AchievementPayload,
        AssessCompletionRequest,
        ChallengeCatalogItem,
        ChallengeCatalogProgress,
        ChallengeDetail,
        ChallengePreviewRequest,
        ChallengePreviewResponse,
        ChallengeSubmissionRecord,
        ChallengeSubmissionResponse,
        ChallengeSubmitRequest,
        CompletionResult,
        CurrentUserPayload,
        DashboardResponse,
        ErrorResponse,
        ExplanationRequest,
        ExplanationResult,
        LearnerTrack,
        LoginRequest,
        MasteryPayload,
        ProfilePayload,
        ProfileUpdateRequest,
        RegisterRequest,
        RevealFinalFormRequest,
        RevealFinalFormResult,
        SafeUserPayload,
        VerificationResult,
        VerifyRequest,
    )
    from prooflab_api.database import LearnerProfile, User, get_db, run_migrations, utc_now
    from prooflab_api.parser import MathSyntaxError
    from prooflab_api.progress import GUIDED_CONCEPTS, ProgressRepository, concept_for_challenge
    from prooflab_api.repositories import ChallengeSubmissionRepository, StoredSubmission
    from prooflab_api.teaching import TeachingProviderError, get_teaching_provider
    from prooflab_api.verifier import assess_completion, canonical_final_latex, verify_transition
else:
    from .auth import (
        INVALID_CREDENTIALS_MESSAGE,
        SESSION_COOKIE_NAME,
        CurrentUser,
        DuplicateEmailError,
        clear_login_failures,
        create_session,
        create_user,
        login_is_limited,
        normalize_email,
        record_login_failure,
        require_current_user,
        revoke_session,
        secure_cookie_enabled,
        verify_password,
    )
    from .challenges import CHALLENGES, catalog_item, challenge_detail, get_challenge, preview_challenge, submit_challenge
    from .contracts import (
        ActivityIntroductionRequest,
        AchievementPayload,
        AssessCompletionRequest,
        ChallengeCatalogItem,
        ChallengeCatalogProgress,
        ChallengeDetail,
        ChallengePreviewRequest,
        ChallengePreviewResponse,
        ChallengeSubmissionRecord,
        ChallengeSubmissionResponse,
        ChallengeSubmitRequest,
        CompletionResult,
        CurrentUserPayload,
        DashboardResponse,
        ErrorResponse,
        ExplanationRequest,
        ExplanationResult,
        LearnerTrack,
        LoginRequest,
        MasteryPayload,
        ProfilePayload,
        ProfileUpdateRequest,
        RegisterRequest,
        RevealFinalFormRequest,
        RevealFinalFormResult,
        SafeUserPayload,
        VerificationResult,
        VerifyRequest,
    )
    from .database import LearnerProfile, User, get_db, run_migrations, utc_now
    from .parser import MathSyntaxError
    from .progress import GUIDED_CONCEPTS, ProgressRepository, concept_for_challenge
    from .repositories import ChallengeSubmissionRepository, StoredSubmission
    from .teaching import TeachingProviderError, get_teaching_provider
    from .verifier import assess_completion, canonical_final_latex, verify_transition


def _allowed_origins() -> list[str]:
    configured = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    origins = [origin.strip() for origin in configured.split(",") if origin.strip()]
    if "*" in origins:
        raise RuntimeError("FRONTEND_ORIGIN must name explicit origins when credentialed cookies are enabled.")
    return origins


app = FastAPI(title="ProofLab API", version="1.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["content-type"],
)


@app.on_event("startup")
def initialize_database() -> None:
    run_migrations()


def _challenge_or_404(challenge_id: str):
    challenge = get_challenge(challenge_id)
    if challenge is None:
        raise HTTPException(status_code=404, detail="Challenge not found.")
    return challenge


def _recommend_track(goal: str, confidence: str) -> LearnerTrack:
    if goal == "prepare-for-work" or confidence == "confident":
        return LearnerTrack.PROFESSIONAL
    if confidence == "new":
        return LearnerTrack.EXPLORER
    return LearnerTrack.LEARNER


def _profile_payload(profile: LearnerProfile) -> ProfilePayload:
    return ProfilePayload(
        goal=profile.goal,
        confidence=profile.confidence,
        activeTrack=profile.active_track,
        gamificationEnabled=profile.gamification_enabled,
        onboardingCompleted=profile.onboarding_completed,
    )


def _current_user_payload(current_user: CurrentUser) -> CurrentUserPayload:
    return CurrentUserPayload(
        user=SafeUserPayload(id=current_user.user.id, email=current_user.user.email, createdAt=current_user.user.created_at),
        profile=_profile_payload(current_user.profile),
    )


def _set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=14 * 24 * 60 * 60,
        httponly=True,
        samesite="lax",
        secure=secure_cookie_enabled(),
        path="/",
    )


def _submission_record(record: StoredSubmission) -> ChallengeSubmissionRecord:
    return ChallengeSubmissionRecord(
        id=record.id,
        challengeId=record.challenge_id,
        submittedLatex=record.submitted_latex,
        status=record.status,
        createdAt=record.created_at,
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/register", response_model=CurrentUserPayload, status_code=201)
async def register(request: RegisterRequest, response: Response, db: Session = Depends(get_db)) -> CurrentUserPayload:
    track = request.active_track or _recommend_track(request.goal.value, request.confidence.value)
    try:
        current_user = create_user(
            db,
            email=request.email,
            password=request.password,
            goal=request.goal.value,
            confidence=request.confidence.value,
            active_track=track.value,
        )
        token, _ = create_session(db, current_user.id)
        db.commit()
    except (DuplicateEmailError, IntegrityError) as error:
        db.rollback()
        if isinstance(error, DuplicateEmailError):
            raise HTTPException(status_code=409, detail="An account already uses this email address.") from error
        raise HTTPException(status_code=409, detail="An account already uses this email address.") from error
    _set_session_cookie(response, token)
    return _current_user_payload(current_user)


@app.post("/auth/login", response_model=CurrentUserPayload)
async def login(request: LoginRequest, response: Response, http_request: Request, db: Session = Depends(get_db)) -> CurrentUserPayload:
    normalized_email = normalize_email(request.email)
    if login_is_limited(http_request, normalized_email):
        raise HTTPException(status_code=429, detail="Too many sign-in attempts. Try again in a few minutes.")
    user = db.scalar(select(User).where(User.email == normalized_email))
    if user is None or not verify_password(user.password_hash, request.password):
        record_login_failure(http_request, normalized_email)
        raise HTTPException(status_code=401, detail=INVALID_CREDENTIALS_MESSAGE)
    profile = db.get(LearnerProfile, user.id)
    if profile is None:
        record_login_failure(http_request, normalized_email)
        raise HTTPException(status_code=401, detail=INVALID_CREDENTIALS_MESSAGE)
    clear_login_failures(http_request, normalized_email)
    current_user = CurrentUser(user=user, profile=profile)
    token, _ = create_session(db, user.id)
    db.commit()
    _set_session_cookie(response, token)
    return _current_user_payload(current_user)


@app.post("/auth/logout", status_code=204)
async def logout(http_request: Request, _: CurrentUser = Depends(require_current_user), db: Session = Depends(get_db)) -> Response:
    revoke_session(db, http_request.cookies.get(SESSION_COOKIE_NAME))
    response = Response(status_code=204)
    response.delete_cookie(key=SESSION_COOKIE_NAME, path="/", httponly=True, samesite="lax", secure=secure_cookie_enabled())
    return response


@app.get("/auth/me", response_model=CurrentUserPayload)
async def me(current_user: CurrentUser = Depends(require_current_user)) -> CurrentUserPayload:
    return _current_user_payload(current_user)


@app.patch("/me/profile", response_model=CurrentUserPayload)
async def update_profile(
    request: ProfileUpdateRequest,
    current_user: CurrentUser = Depends(require_current_user),
    db: Session = Depends(get_db),
) -> CurrentUserPayload:
    profile = current_user.profile
    if request.goal is not None:
        profile.goal = request.goal.value
    if request.confidence is not None:
        profile.confidence = request.confidence.value
    if request.active_track is not None:
        profile.active_track = request.active_track.value
    if request.gamification_enabled is not None:
        profile.gamification_enabled = request.gamification_enabled
    profile.updated_at = utc_now()
    db.commit()
    return _current_user_payload(current_user)


@app.get("/me/dashboard", response_model=DashboardResponse)
async def dashboard(current_user: CurrentUser = Depends(require_current_user), db: Session = Depends(get_db)) -> DashboardResponse:
    values = ProgressRepository().dashboard(db, user_id=current_user.id)
    return DashboardResponse(
        totalXp=values["total_xp"],
        streak=values["streak"],
        mastery=[
            MasteryPayload(
                conceptId=item.concept_id,
                status=item.status,
                distinctSuccesses=item.distinct_successes,
                firstTrySuccesses=item.first_try_successes,
            )
            for item in values["mastery"]
        ],
        recentActivities=[
            {
                "id": item.id,
                "activityKind": item.activity_kind,
                "activityId": item.activity_id,
                "conceptId": item.concept_id,
                "outcome": item.outcome,
                "attemptOrdinal": item.attempt_ordinal,
                "createdAt": item.created_at,
            }
            for item in values["recent_activities"]
        ],
        achievements=[AchievementPayload(code=item.achievement_code, earnedAt=item.earned_at) for item in values["achievements"]],
        recommendation=_recommend_track(current_user.profile.goal, current_user.profile.confidence),
    )


@app.post("/activities/introduce", status_code=204)
async def introduce_activity(
    request: ActivityIntroductionRequest,
    current_user: CurrentUser = Depends(require_current_user),
    db: Session = Depends(get_db),
) -> Response:
    if request.activity_kind == "guided":
        concept_id = GUIDED_CONCEPTS.get(request.activity_id)
    else:
        _challenge_or_404(request.activity_id)
        concept_id = concept_for_challenge(request.activity_id)
    ProgressRepository().introduce(db, user_id=current_user.id, concept_id=concept_id)
    db.commit()
    return Response(status_code=204)


@app.get("/challenges", response_model=list[ChallengeCatalogItem])
async def challenges(_: CurrentUser = Depends(require_current_user)) -> list[ChallengeCatalogItem]:
    return [catalog_item(challenge) for challenge in CHALLENGES]


@app.get("/challenges/progress", response_model=list[ChallengeCatalogProgress])
async def challenge_progress(
    current_user: CurrentUser = Depends(require_current_user),
    db: Session = Depends(get_db),
) -> list[ChallengeCatalogProgress]:
    return [
        ChallengeCatalogProgress(
            challengeId=item.challenge_id,
            status=item.status,
            attemptCount=item.attempt_count,
        )
        for item in ChallengeSubmissionRepository().progress_for_catalog(db, user_id=current_user.id)
    ]


@app.get("/challenges/{challenge_id}", response_model=ChallengeDetail)
async def challenge(
    challenge_id: str,
    current_user: CurrentUser = Depends(require_current_user),
    db: Session = Depends(get_db),
) -> ChallengeDetail:
    definition = _challenge_or_404(challenge_id)
    ProgressRepository().introduce(db, user_id=current_user.id, concept_id=concept_for_challenge(challenge_id))
    db.commit()
    return challenge_detail(definition)


@app.post("/challenges/{challenge_id}/preview", response_model=ChallengePreviewResponse, responses={422: {"model": ErrorResponse}})
async def preview(challenge_id: str, request: ChallengePreviewRequest, _: CurrentUser = Depends(require_current_user)) -> ChallengePreviewResponse:
    try:
        return preview_challenge(_challenge_or_404(challenge_id), request.latex)
    except MathSyntaxError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error


@app.post("/challenges/{challenge_id}/submit", response_model=ChallengeSubmissionResponse)
async def submit(
    challenge_id: str,
    request: ChallengeSubmitRequest,
    current_user: CurrentUser = Depends(require_current_user),
    db: Session = Depends(get_db),
) -> ChallengeSubmissionResponse:
    definition = _challenge_or_404(challenge_id)
    result = submit_challenge(definition, request.latex)
    repository = ChallengeSubmissionRepository()
    record = repository.record(
        db,
        user_id=current_user.id,
        challenge_id=challenge_id,
        submitted_latex=request.latex,
        status=result.status.value,
    )
    progress = ProgressRepository().record_challenge_submission(
        db,
        user_id=current_user.id,
        challenge_id=challenge_id,
        difficulty=definition.difficulty,
        accepted=result.status.value == "accepted",
    )
    db.commit()
    attempt_count = repository.count_for_challenge(db, user_id=current_user.id, challenge_id=challenge_id)
    return result.model_copy(
        update={
            "submission_id": record.id,
            "attempt_count": attempt_count,
            "earned_xp": progress.earned_xp,
            "total_xp": progress.total_xp,
            "mastery_status": progress.mastery_status,
        }
    )


@app.get("/challenges/{challenge_id}/submissions", response_model=list[ChallengeSubmissionRecord])
async def submission_history(
    challenge_id: str,
    current_user: CurrentUser = Depends(require_current_user),
    db: Session = Depends(get_db),
) -> list[ChallengeSubmissionRecord]:
    _challenge_or_404(challenge_id)
    records = ChallengeSubmissionRepository().list_for_challenge(db, user_id=current_user.id, challenge_id=challenge_id)
    return [_submission_record(record) for record in records]


@app.post("/verify", response_model=VerificationResult, responses={422: {"model": ErrorResponse}})
async def verify(
    request: VerifyRequest,
    current_user: CurrentUser = Depends(require_current_user),
    db: Session = Depends(get_db),
) -> VerificationResult:
    result = verify_transition(request.mode, request.previous_step, request.next_step)
    if request.activity_id:
        ProgressRepository().record_guided_transition(
            db,
            user_id=current_user.id,
            activity_id=request.activity_id,
            transition_id=request.next_step.id,
            accepted=result.status.value == "valid",
        )
        db.commit()
    return result


@app.post("/assess-completion", response_model=CompletionResult, responses={422: {"model": ErrorResponse}})
async def assess(
    request: AssessCompletionRequest,
    current_user: CurrentUser = Depends(require_current_user),
    db: Session = Depends(get_db),
) -> CompletionResult:
    result = assess_completion(
        request.mode,
        request.given_step,
        request.terminal_learner_step,
        request.learner_steps,
        request.canonical_goal,
    )
    if request.activity_id and result.status.value in {"complete", "needs-correction"}:
        ProgressRepository().record_guided_completion(
            db,
            user_id=current_user.id,
            activity_id=request.activity_id,
            completed=result.status.value == "complete",
        )
        db.commit()
    return result


@app.post("/reveal-final-form", response_model=RevealFinalFormResult, responses={400: {"model": ErrorResponse}, 422: {"model": ErrorResponse}})
async def reveal_final_form(request: RevealFinalFormRequest, _: CurrentUser = Depends(require_current_user)) -> RevealFinalFormResult:
    try:
        return RevealFinalFormResult(canonicalLatex=canonical_final_latex(request.mode, request.given_step, request.canonical_goal))
    except MathSyntaxError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


@app.post("/explain", response_model=ExplanationResult, responses={400: {"model": ErrorResponse}, 502: {"model": ErrorResponse}, 503: {"model": ErrorResponse}})
async def explain(request: ExplanationRequest, _: CurrentUser = Depends(require_current_user)) -> ExplanationResult:
    try:
        return await get_teaching_provider().generate(request)
    except TeachingProviderError as error:
        raise HTTPException(status_code=error.status_code, detail=error.args[0]) from error


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
