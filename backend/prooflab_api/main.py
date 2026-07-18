from __future__ import annotations

import os
import sys
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

if __package__ in {None, ""}:
    # `uv run main.py` executes this file outside its package. Add the backend
    # directory, then import through the package so every sibling module keeps
    # its normal relative imports.
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
    from prooflab_api.contracts import (
        AssessCompletionRequest,
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
else:
    from .contracts import (
        AssessCompletionRequest,
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


def _allowed_origins() -> list[str]:
    configured = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
    return [origin.strip() for origin in configured.split(",") if origin.strip()]


app = FastAPI(title="ProofLab API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["content-type"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


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
