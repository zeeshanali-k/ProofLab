# ProofLab: Authentication, XP, and Mastery Foundation

> Implement this plan before the broader Math expansion. It establishes authenticated ownership, adaptive learner profiles, and reusable progress mechanics for every current and future lab. It does not add new Math domains, verifier modes, or curriculum content.

## 1. Product decisions

- ProofLab is account-first. The root route (`/`) is the login/create-account landing page; an authenticated visitor at `/` is redirected to `/dashboard`.
- Every learning surface is protected: Math, LeetMath, Chemistry, Physics, Biology, and Guide. The health endpoint stays public.
- Use lightweight local authentication only: email/password, SQLite, FastAPI, and SQLAlchemy 2. No OAuth, email verification, password recovery, roles, external identity provider, cloud deployment, or leaderboard.
- All ages may create an account. Do not collect birth date, real name, address, school, or AI-chat transcripts. Show a concise local-demo privacy notice; this is not a public-launch compliance solution.
- On first registration, ask for a learning goal and confidence level. Recommend one of `explorer`, `learner`, or `professional`; store it as the active track, allow switching at any time, and never erase progress on a switch.
- XP is optional presentation, not a competitive ranking. It is shown by default to Explorer and Learner users; Professional users start with it hidden but still accrue it. Mastery remains visible to everyone.

## 2. Identity and persistence

### Database and migration approach

Add `SQLAlchemy>=2` and `argon2-cffi` to the FastAPI project. Keep the existing `PROOFLAB_DATABASE_PATH` SQLite configuration and replace the hand-written submission repository with SQLAlchemy repositories.

Use a small ordered SQLite migration runner with a `schema_migrations` table; do not introduce Alembic for this local/demo application. It must create new databases and non-destructively upgrade the existing submission database.

Create these tables:

| Table | Required fields | Rules |
| --- | --- | --- |
| `users` | UUID `id`, normalized unique `email`, `password_hash`, timestamps | Email is lower-cased and trimmed; password hashes are Argon2 only. |
| `auth_sessions` | UUID `id`, `user_id`, `token_digest`, `expires_at`, timestamps | Store only SHA-256 token digests; session tokens never enter the database or JSON response. |
| `learner_profiles` | `user_id`, `goal`, `confidence`, `active_track`, `gamification_enabled`, `onboarding_completed` | No age field. Default gamification is off only for Professional. |
| `activity_attempts` | UUID `id`, `user_id`, `activity_kind`, `activity_id`, `concept_id` nullable, outcome, attempt ordinal, timestamps | Records final submissions and completed verified activities without exposing private answers. |
| `concept_mastery` | `user_id`, `concept_id`, status, distinct successes, first-try successes, timestamps | One row per user/concept; `concept_id` is a stable string so future curriculum nodes can use it. |
| `xp_ledger` | UUID `id`, `user_id`, `amount`, reason, source kind/id, timestamps | Unique `(user_id, source_kind, source_id, reason)` makes every award idempotent. |
| `earned_achievements` | `user_id`, achievement code, `earned_at` | Unique `(user_id, achievement_code)`; no social or leaderboard columns. |

Migrate `challenge_submissions` to a nullable `user_id` foreign key while preserving existing anonymous rows as legacy data. All new challenge submissions require `user_id`; anonymous session headers and browser-generated submission IDs are removed. Legacy attempts are not attached to a newly created account.

### Sessions and passwords

- Registration accepts a valid email plus a 10–128 character password. Login always returns the same invalid-credential message for unknown email and wrong password.
- On successful registration or login, create a random 32-byte opaque token, persist only its SHA-256 digest, and set it as a `prooflab_session` cookie for 14 days.
- Cookie settings: `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` only when a production HTTPS flag is enabled. Local URLs must consistently use `localhost`, not a mix of `localhost` and `127.0.0.1`.
- Logout deletes the database session and clears the cookie. Expired or missing sessions behave as signed out.
- Add an in-process limit of five failed login attempts per IP/email pair in 15 minutes. It is intentionally local-demo protection, not distributed rate limiting.

## 3. API and frontend contract

### FastAPI endpoints

Add these public auth endpoints:

| Endpoint | Behavior |
| --- | --- |
| `POST /auth/register` | Validates credentials and onboarding choices, creates user/profile/session, sets the cookie, returns a safe user/profile payload. |
| `POST /auth/login` | Validates credentials, creates a session, sets the cookie, returns the same safe payload. |
| `POST /auth/logout` | Requires the current session, revokes it, and clears the cookie. |
| `GET /auth/me` | Returns the safe current user/profile payload or `401`. |
| `PATCH /me/profile` | Updates goal, confidence, active track, and gamification preference after strict enum validation. |
| `GET /me/dashboard` | Returns mastery summaries, recent activities, streak, total XP, visible achievements, and current recommendation. |

Use a single `require_current_user` FastAPI dependency for all stateful learning endpoints. `POST /verify`, completion/reveal/explain calls, LeetMath detail/preview/submit/history, and future saved lab work receive account identity from this dependency, never from a client-supplied user ID.

Frontend API clients use `credentials: 'include'`. FastAPI CORS allows only configured frontend origins and sets `allow_credentials=True`; it must never use a wildcard origin with credentialed requests.

### Routes and navigation

- Move the current Math workspace from `/` to `/math`; keep `/leetmath` and lab routes under an authenticated application shell.
- Add `/dashboard` as the first authenticated screen. It links to Math, LeetMath, Chemistry, Physics, Biology, and Guide, and displays the profile menu, active track, XP toggle, and sign out.
- Add a client auth provider plus protected route layout. While `GET /auth/me` is loading, show a neutral loading state; unauthenticated access redirects to `/` with a safe `returnTo` path limited to same-origin app routes.
- Update every current `href="/"` and “Back to ProofLab” link so it returns to `/dashboard` or `/math` intentionally.
- Scope browser persistence by account: rough work becomes `prooflab:rough-work:v2:<userId>:<workspace>:<itemId>`; LeetMath drafts become `prooflab:leetmath:v2:<userId>:<challengeId>`. On the first signed-in session only, offer a one-time local migration of existing anonymous rough work into that account namespace.

## 4. Progress, XP, and mastery

### Event rules

The backend, not React, awards progress only after a deterministic accepted result. A client cannot submit XP, mastery, streak, or achievement values.

| Event | XP | Limitation |
| --- | ---: | --- |
| First verified guided transition in a distinct activity | 5 | Maximum 20 XP per activity. |
| First completed guided problem | 30 | Once per activity ID. |
| Accepted standard practice/activity | 20 | Once per generated instance. |
| Accepted LeetMath Foundation / Trap / Chain challenge | 25 / 40 / 60 | Once per user/challenge; later accepted retries earn no XP. |
| First-attempt accepted final answer | +10 | Added once to the relevant activity. |

Use UTC calendar days. A streak increments when an account has at least one accepted or completed activity on a new day; repeated activity on the same day does not change it. A missed day ends the current streak but never removes XP or mastery.

### Mastery rules

Each activity references a stable `concept_id`. Until the full curriculum exists, map the current verified problems and 30 LeetMath challenges to concepts such as `algebra.linear-equations`, `algebra.inequalities`, `calculus.derivatives`, `calculus.integrals`, and `complex-numbers`.

| Status | Deterministic condition |
| --- | --- |
| `new` | No recorded activity for the concept. |
| `introduced` | User opens its guided activity or mission. |
| `practicing` | User has one accepted final answer or one completed guided problem for the concept. |
| `mastered` | User has three accepted distinct activities, from at least two template/problem IDs, with at least one first-attempt success. |

Attempts that are incorrect, malformed, unsupported, or abandoned are retained for a private dashboard summary but never reduce XP or mastery. Future Math templates must provide stable concept and template IDs so this rule remains valid without changes.

Award these non-competitive achievements once: `first-verified-step`, `first-completed-problem`, `first-leetmath-accept`, `concept-mastered`, `seven-day-streak`, and `math-strand-complete`. The dashboard shows only earned achievements; no global counts, rankings, or other users’ data exist.

## 5. Implementation sequence

1. Add SQLAlchemy models, schema migration runner, Argon2 password service, session service, auth dependency, credentialed CORS, and API tests.
2. Add root auth landing, registration/login forms, auth provider, protected application shell, dashboard, profile menu, logout, and intentional route/link migration.
3. Convert LeetMath submissions from anonymous-session ownership to authenticated `user_id`; scope drafts and rough boards by user, including one-time local migration.
4. Add activity/progress repositories and the idempotent XP ledger. Wire them into the current guided verification/completion and LeetMath accepted-submission paths without changing verifier decisions.
5. Add dashboard mastery, recent work, streak, achievements, active-track controls, and optional XP presentation. Keep Chemistry, Physics, and Biology protected and reachable, but do not manufacture progress events for them in this phase.

## 6. Acceptance tests

- Register, duplicate-email rejection, invalid password rejection, login failure parity, login success, session restoration, logout, expiry, and protected-endpoint `401` behavior.
- A signed-out user cannot enter any lab route or access personal attempts; two signed-in users cannot read each other’s submissions, drafts, rough work, XP, or mastery.
- Existing anonymous challenge data remains readable only through legacy storage and is not incorrectly assigned to a new user.
- Each accepted activity creates at most one matching XP-ledger record; refreshes, retries, and duplicate requests cannot inflate XP.
- Mastery transitions only at the stated distinct-activity thresholds and never regresses after incorrect attempts or track changes.
- LeetMath no longer sends `X-ProofLab-Session`; current submission history is owned by the authenticated account.
- End-to-end: register → complete onboarding → reach dashboard → solve guided work → earn XP/mastery → submit LeetMath → sign out → sign back in → see the same private progress and scoped rough work.
- Run frontend lint/unit tests, FastAPI tests, production build, and Playwright account/progress flows before starting the separate Math expansion plan.

## Assumptions

- This is a local/demo deployment using SQLite; production authentication, child-data compliance, email delivery, account recovery, and cloud persistence are intentionally out of scope.
- The existing FastAPI + SymPy verifier remains the single source of mathematical truth. This foundation only records outcomes it already verifies.
- The later Math expansion will add the curriculum registry, templates, and new `concept_id` values; this plan provides the persistent contract they need.
