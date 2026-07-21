from __future__ import annotations

import sqlite3

from prooflab_api import database


def test_migrates_legacy_anonymous_submissions_without_attaching_them_to_new_users(tmp_path, monkeypatch) -> None:
    legacy_path = tmp_path / "legacy-prooflab.db"
    with sqlite3.connect(legacy_path) as connection:
        connection.execute(
            """
            CREATE TABLE challenge_submissions (
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
            INSERT INTO challenge_submissions (anonymous_session_id, authenticated_user_id, challenge_id, submitted_latex, status, created_at)
            VALUES ('legacy-browser', 'not-a-user', '003', 'x < -2', 'accepted', '2026-01-01T00:00:00+00:00')
            """
        )

    previous_engine = database._engine
    previous_session_factory = database._session_factory
    monkeypatch.setenv("PROOFLAB_DATABASE_PATH", str(legacy_path))
    database._engine = None
    database._session_factory = None
    try:
        database.run_migrations()
        with sqlite3.connect(legacy_path) as connection:
            migrated = connection.execute(
                "SELECT user_id, legacy_anonymous_session_id, challenge_id, submitted_latex FROM challenge_submissions"
            ).fetchone()
            versions = {row[0] for row in connection.execute("SELECT version FROM schema_migrations")}
        assert migrated == (None, "legacy-browser", "003", "x < -2")
        assert versions == {1, 2, 3, 4}
        with sqlite3.connect(legacy_path) as connection:
            assert connection.execute("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'practice_instances'").fetchone()
            assert connection.execute("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'practice_submissions'").fetchone()
    finally:
        if database._engine is not None:
            database._engine.dispose()
        database._engine = previous_engine
        database._session_factory = previous_session_factory
