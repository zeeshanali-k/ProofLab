-- ProofLab's initial ChatGPT Sites D1 schema.
--
-- This is a fresh-site migration. It intentionally replaces local passwords
-- and sessions with the Sites-provided authenticated email header. Do not
-- import password_hash or token_digest values from the existing SQLite file.
-- All timestamps are ISO-8601 UTC strings created by server-side code.

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE learner_profiles (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    goal TEXT NOT NULL CHECK (goal IN ('understand-concepts', 'practice-problems', 'prepare-for-work')),
    confidence TEXT NOT NULL CHECK (confidence IN ('new', 'developing', 'confident')),
    active_track TEXT NOT NULL CHECK (active_track IN ('explorer', 'learner', 'professional')),
    gamification_enabled INTEGER NOT NULL CHECK (gamification_enabled IN (0, 1)),
    onboarding_completed INTEGER NOT NULL CHECK (onboarding_completed IN (0, 1)),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE challenge_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    challenge_id TEXT NOT NULL,
    submitted_latex TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL
);

CREATE INDEX challenge_submissions_user_lookup
    ON challenge_submissions (user_id, challenge_id, created_at DESC);

CREATE TABLE activity_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_kind TEXT NOT NULL,
    activity_id TEXT NOT NULL,
    concept_id TEXT,
    outcome TEXT NOT NULL,
    attempt_ordinal INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE INDEX activity_attempts_user_activity_lookup
    ON activity_attempts (user_id, activity_kind, activity_id, created_at);

CREATE INDEX activity_attempts_user_concept_lookup
    ON activity_attempts (user_id, concept_id, outcome);

CREATE TABLE concept_mastery (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    concept_id TEXT NOT NULL,
    status TEXT NOT NULL,
    distinct_successes INTEGER NOT NULL,
    first_try_successes INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (user_id, concept_id)
);

CREATE TABLE xp_ledger (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    source_kind TEXT NOT NULL,
    source_id TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE (user_id, source_kind, source_id, reason)
);

CREATE INDEX xp_ledger_user_lookup ON xp_ledger (user_id, created_at DESC);

CREATE TABLE earned_achievements (
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_code TEXT NOT NULL,
    earned_at TEXT NOT NULL,
    PRIMARY KEY (user_id, achievement_code)
);

CREATE TABLE practice_instances (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id TEXT NOT NULL,
    template_version INTEGER NOT NULL,
    node_id TEXT NOT NULL,
    concept_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'completed')),
    seed INTEGER NOT NULL,
    public_payload TEXT NOT NULL,
    private_payload TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    completed_at TEXT
);

CREATE INDEX practice_instances_active_lookup
    ON practice_instances (user_id, template_id, status, updated_at DESC);

CREATE TABLE practice_submissions (
    id TEXT PRIMARY KEY,
    instance_id TEXT NOT NULL REFERENCES practice_instances(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('accepted', 'incorrect')),
    created_at TEXT NOT NULL
);

CREATE INDEX practice_submissions_instance_lookup
    ON practice_submissions (instance_id, created_at DESC);
