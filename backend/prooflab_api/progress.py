"""Server-owned XP, mastery, streak, and achievement calculations."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import distinct, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .curriculum import concept_for_challenge as curriculum_concept_for_challenge
from .curriculum import concept_for_guided_mission
from .curriculum import mastery_threshold_for_concept
from .curriculum import requires_first_try_for_concept
from .database import ActivityAttempt, ConceptMastery, EarnedAchievement, XpLedger, utc_now


GUIDED_CONCEPTS = {
    mission_id: concept
    for mission_id in (
        "missing-middle-term", "linear-balance", "inequality-sign-flip", "negative-square",
        "quadratic-solution-check", "factor-then-solve", "polynomial-derivative",
        "trig-chain-derivative", "product-rule-derivative", "repeated-derivative",
        "indefinite-integral", "missing-integration-constant", "complex-product",
        "complex-roots", "complex-complete-roots",
    )
    if (concept := concept_for_guided_mission(mission_id))
}

KNOWN_CONCEPTS_BY_STRAND = {
    "algebra": {"algebra.linear-equations", "algebra.inequalities"},
    "calculus": {"calculus.derivatives", "calculus.integrals"},
    "complex-numbers": {"complex-numbers.simplification", "complex-numbers.solutions"},
}

MASTERY_ACTIVITY_KINDS = ("guided-problem", "leetmath-challenge", "foundation-practice")


def concept_for_challenge(challenge_id: str) -> str:
    concept = curriculum_concept_for_challenge(challenge_id)
    if concept is None:
        raise ValueError(f"Challenge {challenge_id} is missing a curriculum concept mapping.")
    return concept


@dataclass(frozen=True)
class ProgressUpdate:
    earned_xp: int = 0
    total_xp: int = 0
    newly_earned_achievements: tuple[str, ...] = ()
    mastery_status: str | None = None


def _as_utc(value: datetime) -> datetime:
    return value if value.tzinfo else value.replace(tzinfo=timezone.utc)


class ProgressRepository:
    def introduce(self, db: Session, *, user_id: str, concept_id: str | None) -> None:
        if not concept_id:
            return
        mastery = db.get(ConceptMastery, {"user_id": user_id, "concept_id": concept_id})
        if mastery is None:
            now = utc_now()
            db.add(
                ConceptMastery(
                    user_id=user_id,
                    concept_id=concept_id,
                    status="introduced",
                    distinct_successes=0,
                    first_try_successes=0,
                    created_at=now,
                    updated_at=now,
                )
            )

    def record_attempt(
        self,
        db: Session,
        *,
        user_id: str,
        activity_kind: str,
        activity_id: str,
        concept_id: str | None,
        outcome: str,
    ) -> ActivityAttempt:
        ordinal = int(
            db.scalar(
                select(func.count(ActivityAttempt.id)).where(
                    ActivityAttempt.user_id == user_id,
                    ActivityAttempt.activity_kind == activity_kind,
                    ActivityAttempt.activity_id == activity_id,
                )
            )
            or 0
        ) + 1
        now = utc_now()
        attempt = ActivityAttempt(
            id=str(uuid4()),
            user_id=user_id,
            activity_kind=activity_kind,
            activity_id=activity_id,
            concept_id=concept_id,
            outcome=outcome,
            attempt_ordinal=ordinal,
            created_at=now,
            updated_at=now,
        )
        db.add(attempt)
        return attempt

    def _award_xp(self, db: Session, *, user_id: str, amount: int, reason: str, source_kind: str, source_id: str) -> int:
        ledger = XpLedger(
            id=str(uuid4()),
            user_id=user_id,
            amount=amount,
            reason=reason,
            source_kind=source_kind,
            source_id=source_id,
            created_at=utc_now(),
        )
        try:
            with db.begin_nested():
                db.add(ledger)
                db.flush()
            return amount
        except IntegrityError:
            return 0

    def _earn_achievement(self, db: Session, *, user_id: str, code: str) -> bool:
        achievement = EarnedAchievement(user_id=user_id, achievement_code=code, earned_at=utc_now())
        try:
            with db.begin_nested():
                db.add(achievement)
                db.flush()
            return True
        except IntegrityError:
            return False

    def _refresh_mastery(self, db: Session, *, user_id: str, concept_id: str) -> tuple[str, bool]:
        self.introduce(db, user_id=user_id, concept_id=concept_id)
        mastery = db.get(ConceptMastery, {"user_id": user_id, "concept_id": concept_id})
        assert mastery is not None
        successful = (
            ActivityAttempt.user_id == user_id,
            ActivityAttempt.concept_id == concept_id,
            ActivityAttempt.outcome == "accepted",
            ActivityAttempt.activity_kind.in_(MASTERY_ACTIVITY_KINDS),
        )
        distinct_successes = int(db.scalar(select(func.count(distinct(ActivityAttempt.activity_id))).where(*successful)) or 0)
        first_try_successes = int(
            db.scalar(
                select(func.count(distinct(ActivityAttempt.activity_id))).where(*successful, ActivityAttempt.attempt_ordinal == 1)
            )
            or 0
        )
        previous_status = mastery.status
        mastery.distinct_successes = distinct_successes
        mastery.first_try_successes = first_try_successes
        has_required_first_try = first_try_successes >= 1 or not requires_first_try_for_concept(concept_id)
        mastery.status = "mastered" if distinct_successes >= mastery_threshold_for_concept(concept_id) and has_required_first_try else "practicing"
        mastery.updated_at = utc_now()
        return mastery.status, previous_status != "mastered" and mastery.status == "mastered"

    def _streak(self, db: Session, user_id: str) -> int:
        dates = {
            _as_utc(value).date()
            for value in db.scalars(
                select(ActivityAttempt.created_at).where(
                    ActivityAttempt.user_id == user_id,
                    ActivityAttempt.outcome == "accepted",
                    ActivityAttempt.activity_kind.in_(MASTERY_ACTIVITY_KINDS),
                )
            )
        }
        current_day = utc_now().date()
        if current_day not in dates:
            current_day -= timedelta(days=1)
        if current_day not in dates:
            return 0
        streak = 0
        while current_day in dates:
            streak += 1
            current_day -= timedelta(days=1)
        return streak

    def _total_xp(self, db: Session, user_id: str) -> int:
        return int(db.scalar(select(func.coalesce(func.sum(XpLedger.amount), 0)).where(XpLedger.user_id == user_id)) or 0)

    def _strand_complete(self, db: Session, *, user_id: str, concept_id: str) -> bool:
        strand = next((name for name in KNOWN_CONCEPTS_BY_STRAND if concept_id.startswith(f"{name}.")), None)
        if strand is None:
            return False
        mastered = set(
            db.scalars(
                select(ConceptMastery.concept_id).where(
                    ConceptMastery.user_id == user_id,
                    ConceptMastery.status == "mastered",
                )
            )
        )
        return KNOWN_CONCEPTS_BY_STRAND[strand].issubset(mastered)

    def record_guided_transition(self, db: Session, *, user_id: str, activity_id: str, transition_id: str, accepted: bool) -> ProgressUpdate:
        concept_id = GUIDED_CONCEPTS.get(activity_id)
        self.introduce(db, user_id=user_id, concept_id=concept_id)
        self.record_attempt(
            db,
            user_id=user_id,
            activity_kind="guided-transition",
            activity_id=f"{activity_id}:{transition_id}",
            concept_id=concept_id,
            outcome="accepted" if accepted else "incorrect",
        )
        earned = 0
        achievements: list[str] = []
        if accepted:
            activity_awards = int(
                db.scalar(
                    select(func.count(XpLedger.id)).where(
                        XpLedger.user_id == user_id,
                        XpLedger.source_kind == "guided-transition",
                        XpLedger.source_id.like(f"{activity_id}:%"),
                        XpLedger.reason == "verified-guided-transition",
                    )
                )
                or 0
            )
            if activity_awards < 4:
                earned = self._award_xp(
                    db,
                    user_id=user_id,
                    amount=5,
                    reason="verified-guided-transition",
                    source_kind="guided-transition",
                    source_id=f"{activity_id}:{transition_id}",
                )
            if earned and self._earn_achievement(db, user_id=user_id, code="first-verified-step"):
                achievements.append("first-verified-step")
        db.flush()
        return ProgressUpdate(earned_xp=earned, total_xp=self._total_xp(db, user_id), newly_earned_achievements=tuple(achievements))

    def record_guided_completion(self, db: Session, *, user_id: str, activity_id: str, completed: bool) -> ProgressUpdate:
        concept_id = GUIDED_CONCEPTS.get(activity_id)
        self.introduce(db, user_id=user_id, concept_id=concept_id)
        attempt = self.record_attempt(
            db,
            user_id=user_id,
            activity_kind="guided-problem",
            activity_id=activity_id,
            concept_id=concept_id,
            outcome="accepted" if completed else "incorrect",
        )
        earned = 0
        achievements: list[str] = []
        status = None
        if completed:
            earned += self._award_xp(
                db,
                user_id=user_id,
                amount=30,
                reason="completed-guided-problem",
                source_kind="guided-problem",
                source_id=activity_id,
            )
            if attempt.attempt_ordinal == 1:
                earned += self._award_xp(
                    db,
                    user_id=user_id,
                    amount=10,
                    reason="first-attempt-final-answer",
                    source_kind="guided-problem",
                    source_id=activity_id,
                )
            if self._earn_achievement(db, user_id=user_id, code="first-completed-problem"):
                achievements.append("first-completed-problem")
            if concept_id:
                status, newly_mastered = self._refresh_mastery(db, user_id=user_id, concept_id=concept_id)
                if newly_mastered and self._earn_achievement(db, user_id=user_id, code="concept-mastered"):
                    achievements.append("concept-mastered")
                if newly_mastered and self._strand_complete(db, user_id=user_id, concept_id=concept_id) and self._earn_achievement(db, user_id=user_id, code="math-strand-complete"):
                    achievements.append("math-strand-complete")
            if self._streak(db, user_id) >= 7 and self._earn_achievement(db, user_id=user_id, code="seven-day-streak"):
                achievements.append("seven-day-streak")
        db.flush()
        return ProgressUpdate(earned_xp=earned, total_xp=self._total_xp(db, user_id), newly_earned_achievements=tuple(achievements), mastery_status=status)

    def record_challenge_submission(
        self,
        db: Session,
        *,
        user_id: str,
        challenge_id: str,
        difficulty: str,
        accepted: bool,
    ) -> ProgressUpdate:
        concept_id = concept_for_challenge(challenge_id)
        self.introduce(db, user_id=user_id, concept_id=concept_id)
        attempt = self.record_attempt(
            db,
            user_id=user_id,
            activity_kind="leetmath-challenge",
            activity_id=challenge_id,
            concept_id=concept_id,
            outcome="accepted" if accepted else "incorrect",
        )
        earned = 0
        achievements: list[str] = []
        status = None
        if accepted:
            base_xp = {"Foundation": 25, "Trap": 40, "Chain": 60}[difficulty]
            earned += self._award_xp(
                db,
                user_id=user_id,
                amount=base_xp,
                reason="accepted-leetmath-challenge",
                source_kind="leetmath-challenge",
                source_id=challenge_id,
            )
            if attempt.attempt_ordinal == 1:
                earned += self._award_xp(
                    db,
                    user_id=user_id,
                    amount=10,
                    reason="first-attempt-final-answer",
                    source_kind="leetmath-challenge",
                    source_id=challenge_id,
                )
            if self._earn_achievement(db, user_id=user_id, code="first-leetmath-accept"):
                achievements.append("first-leetmath-accept")
            status, newly_mastered = self._refresh_mastery(db, user_id=user_id, concept_id=concept_id)
            if newly_mastered and self._earn_achievement(db, user_id=user_id, code="concept-mastered"):
                achievements.append("concept-mastered")
            if newly_mastered and self._strand_complete(db, user_id=user_id, concept_id=concept_id) and self._earn_achievement(db, user_id=user_id, code="math-strand-complete"):
                achievements.append("math-strand-complete")
            if self._streak(db, user_id) >= 7 and self._earn_achievement(db, user_id=user_id, code="seven-day-streak"):
                achievements.append("seven-day-streak")
        db.flush()
        return ProgressUpdate(earned_xp=earned, total_xp=self._total_xp(db, user_id), newly_earned_achievements=tuple(achievements), mastery_status=status)

    def record_foundation_completion(
        self,
        db: Session,
        *,
        user_id: str,
        template_id: str,
        concept_id: str,
        completed: bool,
    ) -> ProgressUpdate:
        """Record an authored template, not a generated instance, for mastery."""
        self.introduce(db, user_id=user_id, concept_id=concept_id)
        attempt = self.record_attempt(
            db,
            user_id=user_id,
            activity_kind="foundation-practice",
            activity_id=template_id,
            concept_id=concept_id,
            outcome="accepted" if completed else "incorrect",
        )
        earned = 0
        achievements: list[str] = []
        status = None
        if completed:
            earned += self._award_xp(
                db,
                user_id=user_id,
                amount=25,
                reason="completed-foundation-practice",
                source_kind="foundation-practice",
                source_id=template_id,
            )
            if attempt.attempt_ordinal == 1:
                earned += self._award_xp(
                    db,
                    user_id=user_id,
                    amount=10,
                    reason="first-attempt-foundation-answer",
                    source_kind="foundation-practice",
                    source_id=template_id,
                )
            if self._earn_achievement(db, user_id=user_id, code="first-completed-problem"):
                achievements.append("first-completed-problem")
            status, newly_mastered = self._refresh_mastery(db, user_id=user_id, concept_id=concept_id)
            if newly_mastered and self._earn_achievement(db, user_id=user_id, code="concept-mastered"):
                achievements.append("concept-mastered")
            if self._streak(db, user_id) >= 7 and self._earn_achievement(db, user_id=user_id, code="seven-day-streak"):
                achievements.append("seven-day-streak")
        db.flush()
        return ProgressUpdate(earned_xp=earned, total_xp=self._total_xp(db, user_id), newly_earned_achievements=tuple(achievements), mastery_status=status)

    def dashboard(self, db: Session, *, user_id: str) -> dict[str, object]:
        mastery = list(
            db.scalars(
                select(ConceptMastery).where(ConceptMastery.user_id == user_id).order_by(ConceptMastery.concept_id)
            )
        )
        activities = list(
            db.scalars(
                select(ActivityAttempt)
                .where(ActivityAttempt.user_id == user_id)
                .order_by(ActivityAttempt.created_at.desc())
                .limit(12)
            )
        )
        achievements = list(
            db.scalars(
                select(EarnedAchievement)
                .where(EarnedAchievement.user_id == user_id)
                .order_by(EarnedAchievement.earned_at.desc())
            )
        )
        return {
            "total_xp": self._total_xp(db, user_id),
            "streak": self._streak(db, user_id),
            "mastery": mastery,
            "recent_activities": activities,
            "achievements": achievements,
        }
