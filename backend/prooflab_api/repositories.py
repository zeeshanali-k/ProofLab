"""SQLAlchemy repositories for account-owned challenge submissions."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from .database import ChallengeSubmission, utc_now


@dataclass(frozen=True)
class StoredSubmission:
    id: int
    challenge_id: str
    submitted_latex: str
    status: str
    created_at: datetime


@dataclass(frozen=True)
class ChallengeProgress:
    challenge_id: str
    status: str
    attempt_count: int


class ChallengeSubmissionRepository:
    def record(
        self,
        db: Session,
        *,
        user_id: str,
        challenge_id: str,
        submitted_latex: str,
        status: str,
    ) -> StoredSubmission:
        submission = ChallengeSubmission(
            user_id=user_id,
            challenge_id=challenge_id,
            submitted_latex=submitted_latex,
            status=status,
            created_at=utc_now(),
        )
        db.add(submission)
        db.flush()
        return StoredSubmission(
            id=submission.id,
            challenge_id=submission.challenge_id,
            submitted_latex=submission.submitted_latex,
            status=submission.status,
            created_at=submission.created_at,
        )

    def list_for_challenge(self, db: Session, *, user_id: str, challenge_id: str, limit: int = 20) -> list[StoredSubmission]:
        records = db.scalars(
            select(ChallengeSubmission)
            .where(ChallengeSubmission.user_id == user_id, ChallengeSubmission.challenge_id == challenge_id)
            .order_by(ChallengeSubmission.id.desc())
            .limit(limit)
        )
        return [
            StoredSubmission(
                id=record.id,
                challenge_id=record.challenge_id,
                submitted_latex=record.submitted_latex,
                status=record.status,
                created_at=record.created_at,
            )
            for record in records
        ]

    def count_for_challenge(self, db: Session, *, user_id: str, challenge_id: str) -> int:
        return int(
            db.scalar(
                select(func.count(ChallengeSubmission.id)).where(
                    ChallengeSubmission.user_id == user_id,
                    ChallengeSubmission.challenge_id == challenge_id,
                )
            )
            or 0
        )

    def progress_for_catalog(self, db: Session, *, user_id: str) -> list[ChallengeProgress]:
        records = db.execute(
            select(
                ChallengeSubmission.challenge_id,
                func.count(ChallengeSubmission.id),
                func.max(case((ChallengeSubmission.status == "accepted", 1), else_=0)),
            )
            .where(ChallengeSubmission.user_id == user_id)
            .group_by(ChallengeSubmission.challenge_id)
        )
        return [
            ChallengeProgress(
                challenge_id=str(challenge_id),
                status="solved" if accepted else "attempting",
                attempt_count=int(attempt_count),
            )
            for challenge_id, attempt_count, accepted in records
        ]
