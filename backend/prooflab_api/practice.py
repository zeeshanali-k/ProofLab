"""Persistence boundary for server-owned foundation practice instances."""

from __future__ import annotations

import json
import secrets
from fractions import Fraction
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import PracticeInstance, PracticeSubmission, utc_now
from .foundations import FoundationTemplate, GeneratedPractice, generate_foundation_practice, normalize_quantity


class PracticeRepository:
    def active_for_template(self, db: Session, *, user_id: str, template_id: str) -> PracticeInstance | None:
        return db.scalar(
            select(PracticeInstance)
            .where(
                PracticeInstance.user_id == user_id,
                PracticeInstance.template_id == template_id,
                PracticeInstance.status == "active",
            )
            .order_by(PracticeInstance.updated_at.desc())
        )

    def owned_instance(self, db: Session, *, user_id: str, instance_id: str) -> PracticeInstance | None:
        return db.scalar(
            select(PracticeInstance).where(PracticeInstance.id == instance_id, PracticeInstance.user_id == user_id)
        )

    def create(self, db: Session, *, user_id: str, template: FoundationTemplate) -> PracticeInstance:
        seed = secrets.randbelow(2_000_000_000)
        generated = generate_foundation_practice(template, seed)
        now = utc_now()
        instance = PracticeInstance(
            id=str(uuid4()),
            user_id=user_id,
            template_id=template.id,
            template_version=1,
            node_id=template.node_id,
            concept_id=template.concept_id,
            status="active",
            seed=seed,
            public_payload=json.dumps(_public_payload(generated), separators=(",", ":")),
            private_payload=json.dumps(_private_payload(generated), separators=(",", ":")),
            created_at=now,
            updated_at=now,
            completed_at=None,
        )
        db.add(instance)
        return instance

    def abandon(self, instance: PracticeInstance) -> None:
        instance.status = "abandoned"
        instance.updated_at = utc_now()

    def record_submission(self, db: Session, *, instance: PracticeInstance, response: str, accepted: bool) -> None:
        db.add(
            PracticeSubmission(
                id=str(uuid4()),
                instance_id=instance.id,
                user_id=instance.user_id,
                response=response,
                status="accepted" if accepted else "incorrect",
                created_at=utc_now(),
            )
        )
        instance.updated_at = utc_now()
        if accepted:
            instance.status = "completed"
            instance.completed_at = instance.updated_at


def public_payload(instance: PracticeInstance) -> dict[str, object]:
    return json.loads(instance.public_payload)


def private_payload(instance: PracticeInstance) -> dict[str, object]:
    return json.loads(instance.private_payload)


def check_stored_response(instance: PracticeInstance, response: str) -> tuple[bool, str, str | None]:
    """Validate only against the private snapshot saved with this instance."""
    values = private_payload(instance)
    try:
        normalized = normalize_quantity(response)
    except (ValueError, ZeroDivisionError):
        return False, "Enter a number, decimal, fraction, or USD amount.", None
    expected = Fraction(int(values["canonicalNumerator"]), int(values["canonicalDenominator"]))
    tolerance = Fraction(int(values["toleranceNumerator"]), int(values["toleranceDenominator"]))
    normalized_text = str(normalized.numerator) if normalized.denominator == 1 else f"{normalized.numerator}/{normalized.denominator}"
    if abs(normalized - expected) <= tolerance:
        return True, str(values["acceptedFeedback"]), normalized_text
    return False, str(values["correctionFeedback"]), normalized_text


def _public_payload(generated: GeneratedPractice) -> dict[str, object]:
    return {
        "title": generated.title,
        "prompt": generated.prompt,
        "instructions": generated.instructions,
        "visualizerType": generated.visualizer_type.value,
        "visualization": generated.visualization,
    }


def _private_payload(generated: GeneratedPractice) -> dict[str, object]:
    return {
        "canonicalNumerator": generated.canonical_answer.numerator,
        "canonicalDenominator": generated.canonical_answer.denominator,
        "toleranceNumerator": generated.tolerance.numerator,
        "toleranceDenominator": generated.tolerance.denominator,
        "acceptedFeedback": generated.accepted_feedback,
        "correctionFeedback": generated.correction_feedback,
    }
