from __future__ import annotations

import os
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


def database_path() -> Path:
    configured = os.getenv("PROOFLAB_DATABASE_PATH")
    if configured:
        return Path(configured).expanduser().resolve()
    return Path(__file__).resolve().parents[1] / "data" / "prooflab.db"


@dataclass(frozen=True)
class StoredSubmission:
    id: int
    challenge_id: str
    submitted_latex: str
    status: str
    created_at: datetime


class SubmissionRepository:
    """SQLite persistence for challenge attempts.

    Anonymous browser sessions own attempts until authentication is added. Future
    auth middleware can populate ``request.state.authenticated_user_id``; records
    already retain both the anonymous and authenticated ownership columns.
    """

    def __init__(self, path: Path | None = None) -> None:
        self.path = path or database_path()

    def initialize(self) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS challenge_submissions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    anonymous_session_id TEXT NOT NULL,
                    authenticated_user_id TEXT,
                    challenge_id TEXT NOT NULL,
                    submitted_latex TEXT NOT NULL,
                    status TEXT NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS challenge_submissions_anonymous_lookup
                ON challenge_submissions (anonymous_session_id, challenge_id, created_at DESC)
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS challenge_submissions_authenticated_lookup
                ON challenge_submissions (authenticated_user_id, challenge_id, created_at DESC)
                """
            )

    def record(
        self,
        *,
        anonymous_session_id: str,
        authenticated_user_id: str | None,
        challenge_id: str,
        submitted_latex: str,
        status: str,
    ) -> StoredSubmission:
        self.initialize()
        created_at = datetime.now(timezone.utc)
        with self._connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO challenge_submissions (
                    anonymous_session_id, authenticated_user_id, challenge_id,
                    submitted_latex, status, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (anonymous_session_id, authenticated_user_id, challenge_id, submitted_latex, status, created_at.isoformat()),
            )
        return StoredSubmission(
            id=int(cursor.lastrowid),
            challenge_id=challenge_id,
            submitted_latex=submitted_latex,
            status=status,
            created_at=created_at,
        )

    def list_for_challenge(
        self,
        *,
        anonymous_session_id: str,
        authenticated_user_id: str | None,
        challenge_id: str,
        limit: int = 20,
    ) -> list[StoredSubmission]:
        self.initialize()
        query = (
            """
            SELECT id, challenge_id, submitted_latex, status, created_at
            FROM challenge_submissions
            WHERE authenticated_user_id = ? AND challenge_id = ?
            ORDER BY id DESC LIMIT ?
            """
            if authenticated_user_id
            else """
            SELECT id, challenge_id, submitted_latex, status, created_at
            FROM challenge_submissions
            WHERE anonymous_session_id = ? AND challenge_id = ?
            ORDER BY id DESC LIMIT ?
            """
        )
        owner = authenticated_user_id or anonymous_session_id
        with self._connect() as connection:
            rows = connection.execute(query, (owner, challenge_id, limit)).fetchall()
        return [
            StoredSubmission(
                id=int(row["id"]),
                challenge_id=str(row["challenge_id"]),
                submitted_latex=str(row["submitted_latex"]),
                status=str(row["status"]),
                created_at=datetime.fromisoformat(str(row["created_at"])),
            )
            for row in rows
        ]

    def count_for_challenge(
        self,
        *,
        anonymous_session_id: str,
        authenticated_user_id: str | None,
        challenge_id: str,
    ) -> int:
        self.initialize()
        query = (
            "SELECT COUNT(*) AS count FROM challenge_submissions WHERE authenticated_user_id = ? AND challenge_id = ?"
            if authenticated_user_id
            else "SELECT COUNT(*) AS count FROM challenge_submissions WHERE anonymous_session_id = ? AND challenge_id = ?"
        )
        owner = authenticated_user_id or anonymous_session_id
        with self._connect() as connection:
            row = connection.execute(query, (owner, challenge_id)).fetchone()
        return int(row["count"])

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.path)
        connection.row_factory = sqlite3.Row
        return connection
