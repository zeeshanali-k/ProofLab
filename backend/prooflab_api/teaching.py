from __future__ import annotations

import json
import os
from typing import Protocol

import httpx

from .config import load_backend_environment
from .contracts import ExplanationRequest, ExplanationResult, ExplainMode


load_backend_environment()


class TeachingProviderError(RuntimeError):
    def __init__(self, message: str, status_code: int = 503) -> None:
        super().__init__(message)
        self.status_code = status_code


class TeachingProvider(Protocol):
    async def generate(self, request: ExplanationRequest) -> ExplanationResult: ...


def _trim_trailing_slash(value: str) -> str:
    return value.rstrip("/")


def _timeout_seconds() -> float:
    try:
        return max(1, int(os.getenv("AI_TIMEOUT_MS", "20000"))) / 1_000
    except ValueError:
        return 20


def _system_prompt() -> str:
    return " ".join(
        [
            "You are ProofLab's math coach for students aged 13–18.",
            "Correctness is already decided by supplied verification evidence. Never override or reinterpret it.",
            "Use only the submitted steps and verified evidence. Be concise, encouraging, and specific.",
            'Return exactly one JSON object: {"title":"...","body":"...","question":"... optional","repairLatex":"... optional"}.',
            "Wrap every mathematical expression in $...$ so the learner sees properly typeset notation; never leave math as plain text.",
            "Hint mode asks one guiding question and must not reveal a corrected answer or missing term.",
            "Explain mode is under 100 words. Repair mode may propose one draft repair; ProofLab will verify it.",
        ]
    )


def _user_prompt(request: ExplanationRequest) -> str:
    return json.dumps(
        {
            "task": request.mode.value,
            "previousStep": request.previous_step,
            "nextStep": request.next_step,
            "verifiedEvidence": request.verification.model_dump(by_alias=True, mode="json"),
        }
    )


def _parse_response(content: str, request: ExplanationRequest) -> ExplanationResult:
    cleaned = content.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[len("```json"):]
    elif cleaned.startswith("```"):
        cleaned = cleaned[len("```"):]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    try:
        candidate = json.loads(cleaned.strip())
    except json.JSONDecodeError as error:
        raise TeachingProviderError("The selected AI provider returned an invalid teaching response.", 502) from error
    if not isinstance(candidate, dict) or not isinstance(candidate.get("title"), str) or not isinstance(candidate.get("body"), str):
        raise TeachingProviderError("The selected AI provider omitted required teaching content.", 502)
    result = ExplanationResult(title=candidate["title"][:90], body=candidate["body"][:700])
    if request.mode == ExplainMode.HINT and isinstance(candidate.get("question"), str):
        result.question = candidate["question"][:400]
    if request.mode == ExplainMode.REPAIR:
        repair = candidate.get("repairLatex")
        if isinstance(repair, str) and repair.strip():
            result.repair_latex = repair.strip()[:400]
        elif request.verification.verified_repair_latex:
            result.repair_latex = request.verification.verified_repair_latex
    return result


class OllamaTeachingProvider:
    async def generate(self, request: ExplanationRequest) -> ExplanationResult:
        base_url = _trim_trailing_slash(os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434"))
        model = os.getenv("OLLAMA_MODEL", "llama3.2:3b")
        try:
            async with httpx.AsyncClient(timeout=_timeout_seconds()) as client:
                response = await client.post(
                    f"{base_url}/api/chat",
                    json={
                        "model": model,
                        "stream": False,
                        "format": "json",
                        "messages": [
                            {"role": "system", "content": _system_prompt()},
                            {"role": "user", "content": _user_prompt(request)},
                        ],
                    },
                )
        except httpx.TimeoutException as error:
            raise TeachingProviderError("The AI provider took too long to respond. Try again in a moment.") from error
        except httpx.HTTPError as error:
            raise TeachingProviderError("ProofLab could not reach the configured AI provider.") from error
        if not response.is_success:
            raise TeachingProviderError(f"Ollama returned {response.status_code}.", response.status_code)
        content = response.json().get("message", {}).get("content")
        if not isinstance(content, str):
            raise TeachingProviderError("Ollama returned no teaching content.", 502)
        return _parse_response(content, request)


class OpenAICompatibleTeachingProvider:
    async def generate(self, request: ExplanationRequest) -> ExplanationResult:
        base_url = os.getenv("OPENAI_COMPATIBLE_BASE_URL")
        model = os.getenv("OPENAI_COMPATIBLE_MODEL")
        if not base_url or not model:
            raise TeachingProviderError("Set OPENAI_COMPATIBLE_BASE_URL and OPENAI_COMPATIBLE_MODEL before requesting AI teaching help.")
        headers = {"content-type": "application/json"}
        if api_key := os.getenv("OPENAI_COMPATIBLE_API_KEY"):
            headers["authorization"] = f"Bearer {api_key}"
        try:
            async with httpx.AsyncClient(timeout=_timeout_seconds()) as client:
                response = await client.post(
                    f"{_trim_trailing_slash(base_url)}/chat/completions",
                    headers=headers,
                    json={
                        "model": model,
                        "temperature": 0.2,
                        "messages": [
                            {"role": "system", "content": _system_prompt()},
                            {"role": "user", "content": _user_prompt(request)},
                        ],
                    },
                )
        except httpx.TimeoutException as error:
            raise TeachingProviderError("The AI provider took too long to respond. Try again in a moment.") from error
        except httpx.HTTPError as error:
            raise TeachingProviderError("ProofLab could not reach the configured AI provider.") from error
        if not response.is_success:
            message = response.json().get("error", {}).get("message", f"The OpenAI-compatible provider returned {response.status_code}.")
            raise TeachingProviderError(str(message), response.status_code)
        choices = response.json().get("choices", [])
        content = choices[0].get("message", {}).get("content") if choices else None
        if not isinstance(content, str):
            raise TeachingProviderError("The OpenAI-compatible provider returned no teaching content.", 502)
        return _parse_response(content, request)


class LocalEvidenceTeachingProvider:
    async def generate(self, request: ExplanationRequest) -> ExplanationResult:
        verification = request.verification
        if request.mode == ExplainMode.HINT:
            return ExplanationResult(
                title="A small nudge",
                body="Start by identifying the mathematical operation this step represents.",
                question="Which rule would produce the expected form while preserving the verified evidence?",
            )
        if request.mode == ExplainMode.REPAIR:
            return ExplanationResult(
                title="Suggested repair",
                body="This is a draft. ProofLab will check it before changing your work.",
                repairLatex=verification.verified_repair_latex,
            )
        return ExplanationResult(title="Why this changes", body=verification.summary)


def get_teaching_provider() -> TeachingProvider:
    provider = os.getenv("AI_PROVIDER", "ollama")
    print(f"Using teaching provider: {provider}")
    if provider == "ollama":
        return OllamaTeachingProvider()
    if provider == "openai-compatible":
        return OpenAICompatibleTeachingProvider()
    if provider == "local":
        return LocalEvidenceTeachingProvider()
    raise TeachingProviderError("AI_PROVIDER must be ollama, openai-compatible, or local.", 500)
