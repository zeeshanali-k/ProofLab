import type { D1Database } from './d1.js';
import type { SitesIdentity } from './identity.js';

type Goal = 'understand-concepts' | 'practice-problems' | 'prepare-for-work';
type Confidence = 'new' | 'developing' | 'confident';
type Track = 'explorer' | 'learner' | 'professional';

interface UserRow {
  id: string;
  email: string;
  created_at: string;
}

interface ProfileRow {
  goal: Goal;
  confidence: Confidence;
  active_track: Track;
  gamification_enabled: number;
  onboarding_completed: number;
}

export interface AccountPayload {
  user: { id: string; email: string; createdAt: string };
  profile: {
    goal: Goal;
    confidence: Confidence;
    activeTrack: Track;
    gamificationEnabled: boolean;
    onboardingCompleted: boolean;
  };
}

export interface ProfileUpdate {
  goal?: Goal;
  confidence?: Confidence;
  activeTrack?: Track;
  gamificationEnabled?: boolean;
  onboardingCompleted?: boolean;
}

const DEFAULT_PROFILE: Required<ProfileUpdate> = {
  goal: 'understand-concepts',
  confidence: 'new',
  activeTrack: 'explorer',
  gamificationEnabled: true,
  onboardingCompleted: false,
};

const GOALS = new Set<Goal>(['understand-concepts', 'practice-problems', 'prepare-for-work']);
const CONFIDENCES = new Set<Confidence>(['new', 'developing', 'confident']);
const TRACKS = new Set<Track>(['explorer', 'learner', 'professional']);

function now(): string {
  return new Date().toISOString();
}

/** Validate untrusted PATCH JSON before it can be written to D1. */
export function validateProfileUpdate(input: unknown): ProfileUpdate {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Profile updates must be a JSON object.');
  }

  const candidate = input as Record<string, unknown>;
  const update: ProfileUpdate = {};

  if (candidate.goal !== undefined) {
    if (typeof candidate.goal !== 'string' || !GOALS.has(candidate.goal as Goal)) {
      throw new Error('The learning goal is invalid.');
    }
    update.goal = candidate.goal as Goal;
  }
  if (candidate.confidence !== undefined) {
    if (typeof candidate.confidence !== 'string' || !CONFIDENCES.has(candidate.confidence as Confidence)) {
      throw new Error('The confidence value is invalid.');
    }
    update.confidence = candidate.confidence as Confidence;
  }
  if (candidate.activeTrack !== undefined) {
    if (typeof candidate.activeTrack !== 'string' || !TRACKS.has(candidate.activeTrack as Track)) {
      throw new Error('The learning track is invalid.');
    }
    update.activeTrack = candidate.activeTrack as Track;
  }
  if (candidate.gamificationEnabled !== undefined) {
    if (typeof candidate.gamificationEnabled !== 'boolean') {
      throw new Error('gamificationEnabled must be a boolean.');
    }
    update.gamificationEnabled = candidate.gamificationEnabled;
  }
  if (candidate.onboardingCompleted !== undefined) {
    if (typeof candidate.onboardingCompleted !== 'boolean') {
      throw new Error('onboardingCompleted must be a boolean.');
    }
    update.onboardingCompleted = candidate.onboardingCompleted;
  }
  return update;
}

function accountPayload(user: UserRow, profile: ProfileRow): AccountPayload {
  return {
    user: { id: user.id, email: user.email, createdAt: user.created_at },
    profile: {
      goal: profile.goal,
      confidence: profile.confidence,
      activeTrack: profile.active_track,
      gamificationEnabled: profile.gamification_enabled === 1,
      onboardingCompleted: profile.onboarding_completed === 1,
    },
  };
}

async function selectAccount(db: D1Database, email: string): Promise<{ user: UserRow; profile: ProfileRow } | null> {
  const user = await db.prepare(
    'SELECT id, email, created_at FROM users WHERE email = ? COLLATE NOCASE',
  ).bind(email).first<UserRow>();
  if (!user) return null;

  const profile = await db.prepare(
    'SELECT goal, confidence, active_track, gamification_enabled, onboarding_completed FROM learner_profiles WHERE user_id = ?',
  ).bind(user.id).first<ProfileRow>();
  return profile ? { user, profile } : null;
}

/** Creates the Sites account lazily on the first authenticated request. */
export async function ensureAccount(db: D1Database, identity: SitesIdentity): Promise<AccountPayload> {
  const existing = await selectAccount(db, identity.email);
  if (existing) return accountPayload(existing.user, existing.profile);

  const createdAt = now();
  const userId = crypto.randomUUID();
  await db.prepare(
    'INSERT OR IGNORE INTO users (id, email, created_at, updated_at) VALUES (?, ?, ?, ?)',
  ).bind(userId, identity.email, createdAt, createdAt).run();

  const user = await db.prepare(
    'SELECT id, email, created_at FROM users WHERE email = ? COLLATE NOCASE',
  ).bind(identity.email).first<UserRow>();
  if (!user) throw new Error('Could not create the signed-in ProofLab account.');

  await db.prepare(
    `INSERT OR IGNORE INTO learner_profiles (
      user_id, goal, confidence, active_track, gamification_enabled,
      onboarding_completed, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    user.id,
    DEFAULT_PROFILE.goal,
    DEFAULT_PROFILE.confidence,
    DEFAULT_PROFILE.activeTrack,
    DEFAULT_PROFILE.gamificationEnabled ? 1 : 0,
    DEFAULT_PROFILE.onboardingCompleted ? 1 : 0,
    createdAt,
    createdAt,
  ).run();

  const account = await selectAccount(db, identity.email);
  if (!account) throw new Error('Could not load the signed-in ProofLab account.');
  return accountPayload(account.user, account.profile);
}

/**
 * Mirrors the existing PATCH /me/profile payload but only after Sites identity
 * has established which database row may change.
 */
export async function updateProfile(
  db: D1Database,
  identity: SitesIdentity,
  input: unknown,
): Promise<AccountPayload> {
  const update = validateProfileUpdate(input);
  const account = await ensureAccount(db, identity);
  const profile = { ...account.profile, ...update };
  const updatedAt = now();

  await db.prepare(
    `UPDATE learner_profiles
     SET goal = ?, confidence = ?, active_track = ?, gamification_enabled = ?,
         onboarding_completed = ?, updated_at = ?
     WHERE user_id = ?`,
  ).bind(
    profile.goal,
    profile.confidence,
    profile.activeTrack,
    profile.gamificationEnabled ? 1 : 0,
    profile.onboardingCompleted ? 1 : 0,
    updatedAt,
    account.user.id,
  ).run();

  const refreshed = await selectAccount(db, identity.email);
  if (!refreshed) throw new Error('Could not reload the updated ProofLab profile.');
  return accountPayload(refreshed.user, refreshed.profile);
}
