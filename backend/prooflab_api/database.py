"""SQLite persistence and ordered, local-first schema migrations."""

from __future__ import annotations

import os
from collections.abc import Generator
from datetime import datetime, timezone
from pathlib import Path
from threading import Lock

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, create_engine, event
from sqlalchemy.engine import Connection, Engine
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, sessionmaker


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def database_path() -> Path:
    configured = os.getenv("PROOFLAB_DATABASE_PATH")
    if configured:
        return Path(configured).expanduser().resolve()
    return Path(__file__).resolve().parents[1] / "data" / "prooflab.db"


def _database_url() -> str:
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    return f"sqlite:///{path}"


_engine: Engine | None = None
_session_factory: sessionmaker[Session] | None = None
_migration_lock = Lock()


@event.listens_for(Engine, "connect")
def _enable_sqlite_foreign_keys(dbapi_connection, _connection_record) -> None:
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def get_engine() -> Engine:
    global _engine
    if _engine is None:
        _engine = create_engine(_database_url(), connect_args={"check_same_thread": False})
    return _engine


def get_session_factory() -> sessionmaker[Session]:
    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(bind=get_engine(), autoflush=False, expire_on_commit=False)
    return _session_factory


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_digest: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class LearnerProfile(Base):
    __tablename__ = "learner_profiles"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    goal: Mapped[str] = mapped_column(String(32), nullable=False)
    confidence: Mapped[str] = mapped_column(String(32), nullable=False)
    active_track: Mapped[str] = mapped_column(String(32), nullable=False)
    gamification_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False)
    onboarding_completed: Mapped[bool] = mapped_column(Boolean, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ChallengeSubmission(Base):
    __tablename__ = "challenge_submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    challenge_id: Mapped[str] = mapped_column(String(64), nullable=False)
    submitted_latex: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    legacy_anonymous_session_id: Mapped[str | None] = mapped_column(String(64), nullable=True)


class ActivityAttempt(Base):
    __tablename__ = "activity_attempts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    activity_kind: Mapped[str] = mapped_column(String(64), nullable=False)
    activity_id: Mapped[str] = mapped_column(String(128), nullable=False)
    concept_id: Mapped[str | None] = mapped_column(String(128), nullable=True)
    outcome: Mapped[str] = mapped_column(String(32), nullable=False)
    attempt_ordinal: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class ConceptMastery(Base):
    __tablename__ = "concept_mastery"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    concept_id: Mapped[str] = mapped_column(String(128), primary_key=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    distinct_successes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    first_try_successes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class XpLedger(Base):
    __tablename__ = "xp_ledger"
    __table_args__ = (UniqueConstraint("user_id", "source_kind", "source_id", "reason", name="uq_xp_ledger_source"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    reason: Mapped[str] = mapped_column(String(64), nullable=False)
    source_kind: Mapped[str] = mapped_column(String(64), nullable=False)
    source_id: Mapped[str] = mapped_column(String(192), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class EarnedAchievement(Base):
    __tablename__ = "earned_achievements"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    achievement_code: Mapped[str] = mapped_column(String(64), primary_key=True)
    earned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


class PracticeInstance(Base):
    __tablename__ = "practice_instances"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    template_id: Mapped[str] = mapped_column(String(128), nullable=False)
    template_version: Mapped[int] = mapped_column(Integer, nullable=False)
    node_id: Mapped[str] = mapped_column(String(128), nullable=False)
    concept_id: Mapped[str] = mapped_column(String(128), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    seed: Mapped[int] = mapped_column(Integer, nullable=False)
    public_payload: Mapped[str] = mapped_column(Text, nullable=False)
    private_payload: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class PracticeSubmission(Base):
    __tablename__ = "practice_submissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    instance_id: Mapped[str] = mapped_column(ForeignKey("practice_instances.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    response: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)


def _table_exists(connection: Connection, table: str) -> bool:
    return connection.exec_driver_sql(
        "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?", (table,)
    ).first() is not None


def _columns(connection: Connection, table: str) -> set[str]:
    return {str(row[1]) for row in connection.exec_driver_sql(f"PRAGMA table_info({table})")}


def _migration_1_identity(connection: Connection) -> None:
    connection.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    connection.exec_driver_sql("CREATE INDEX IF NOT EXISTS users_email_lookup ON users (email)")
    connection.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS auth_sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            token_digest TEXT NOT NULL UNIQUE,
            expires_at TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    connection.exec_driver_sql("CREATE INDEX IF NOT EXISTS auth_sessions_token_lookup ON auth_sessions (token_digest)")
    connection.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS learner_profiles (
            user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            goal TEXT NOT NULL,
            confidence TEXT NOT NULL,
            active_track TEXT NOT NULL,
            gamification_enabled INTEGER NOT NULL,
            onboarding_completed INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )


def _create_current_challenge_submissions(connection: Connection) -> None:
    connection.exec_driver_sql(
        """
        CREATE TABLE challenge_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
            challenge_id TEXT NOT NULL,
            submitted_latex TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL,
            legacy_anonymous_session_id TEXT
        )
        """
    )


def _migration_2_challenge_ownership(connection: Connection) -> None:
    if not _table_exists(connection, "challenge_submissions"):
        _create_current_challenge_submissions(connection)
    else:
        existing_columns = _columns(connection, "challenge_submissions")
        if "user_id" not in existing_columns or "legacy_anonymous_session_id" not in existing_columns:
            connection.exec_driver_sql("ALTER TABLE challenge_submissions RENAME TO challenge_submissions_legacy_migration")
            _create_current_challenge_submissions(connection)
            legacy_columns = _columns(connection, "challenge_submissions_legacy_migration")
            anonymous_column = "anonymous_session_id" if "anonymous_session_id" in legacy_columns else "NULL"
            connection.exec_driver_sql(
                f"""
                INSERT INTO challenge_submissions (id, challenge_id, submitted_latex, status, created_at, legacy_anonymous_session_id)
                SELECT id, challenge_id, submitted_latex, status, created_at, {anonymous_column}
                FROM challenge_submissions_legacy_migration
                """
            )
            connection.exec_driver_sql("DROP TABLE challenge_submissions_legacy_migration")
    connection.exec_driver_sql(
        "CREATE INDEX IF NOT EXISTS challenge_submissions_user_lookup ON challenge_submissions (user_id, challenge_id, created_at DESC)"
    )


def _migration_3_progress(connection: Connection) -> None:
    connection.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS activity_attempts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            activity_kind TEXT NOT NULL,
            activity_id TEXT NOT NULL,
            concept_id TEXT,
            outcome TEXT NOT NULL,
            attempt_ordinal INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    connection.exec_driver_sql(
        "CREATE INDEX IF NOT EXISTS activity_attempts_user_activity_lookup ON activity_attempts (user_id, activity_kind, activity_id, created_at)"
    )
    connection.exec_driver_sql(
        "CREATE INDEX IF NOT EXISTS activity_attempts_user_concept_lookup ON activity_attempts (user_id, concept_id, outcome)"
    )
    connection.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS concept_mastery (
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            concept_id TEXT NOT NULL,
            status TEXT NOT NULL,
            distinct_successes INTEGER NOT NULL,
            first_try_successes INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (user_id, concept_id)
        )
        """
    )
    connection.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS xp_ledger (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            amount INTEGER NOT NULL,
            reason TEXT NOT NULL,
            source_kind TEXT NOT NULL,
            source_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            UNIQUE (user_id, source_kind, source_id, reason)
        )
        """
    )
    connection.exec_driver_sql("CREATE INDEX IF NOT EXISTS xp_ledger_user_lookup ON xp_ledger (user_id, created_at DESC)")
    connection.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS earned_achievements (
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            achievement_code TEXT NOT NULL,
            earned_at TEXT NOT NULL,
            PRIMARY KEY (user_id, achievement_code)
        )
        """
    )


def _migration_4_practice_instances(connection: Connection) -> None:
    connection.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS practice_instances (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            template_id TEXT NOT NULL,
            template_version INTEGER NOT NULL,
            node_id TEXT NOT NULL,
            concept_id TEXT NOT NULL,
            status TEXT NOT NULL,
            seed INTEGER NOT NULL,
            public_payload TEXT NOT NULL,
            private_payload TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            completed_at TEXT
        )
        """
    )
    connection.exec_driver_sql(
        "CREATE INDEX IF NOT EXISTS practice_instances_active_lookup ON practice_instances (user_id, template_id, status, updated_at DESC)"
    )
    connection.exec_driver_sql(
        """
        CREATE TABLE IF NOT EXISTS practice_submissions (
            id TEXT PRIMARY KEY,
            instance_id TEXT NOT NULL REFERENCES practice_instances(id) ON DELETE CASCADE,
            user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            response TEXT NOT NULL,
            status TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )
    connection.exec_driver_sql(
        "CREATE INDEX IF NOT EXISTS practice_submissions_instance_lookup ON practice_submissions (instance_id, created_at DESC)"
    )


MIGRATIONS = ((1, _migration_1_identity), (2, _migration_2_challenge_ownership), (3, _migration_3_progress), (4, _migration_4_practice_instances))


def run_migrations() -> None:
    """Apply each migration once; safe to call from request dependencies."""
    with _migration_lock:
        with get_engine().begin() as connection:
            connection.exec_driver_sql(
                """
                CREATE TABLE IF NOT EXISTS schema_migrations (
                    version INTEGER PRIMARY KEY,
                    applied_at TEXT NOT NULL
                )
                """
            )
            applied = {int(row[0]) for row in connection.exec_driver_sql("SELECT version FROM schema_migrations")}
            for version, migration in MIGRATIONS:
                if version in applied:
                    continue
                migration(connection)
                connection.exec_driver_sql(
                    "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)",
                    (version, utc_now().isoformat()),
                )


def get_db() -> Generator[Session, None, None]:
    run_migrations()
    session = get_session_factory()()
    try:
        yield session
    finally:
        session.close()
