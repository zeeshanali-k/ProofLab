# Sites deployment checklist

## Before asking Sites to deploy

- Copy—not move—the root Next frontend into a deployable Sites project after
  Sites confirms compatibility with its current runtime.
- Bind D1 as `DB` using `.openai/hosting.json`, then review and apply
  `d1/0001_prooflab.sql`.
- Use `/signin-with-chatgpt` and `/signout-with-chatgpt`; read the authenticated
  identity only from server-side request headers.
- Make all browser requests same-origin (`/api/...`). Remove the FastAPI URL
  fallback and the separate-backend CORS configuration from the copied project.
- Port the deterministic SymPy-based verification suite before publishing the
  math experience. The science visualizers are largely client-side, but the
  protected Math flows are not safely functional without this work.
- If optional AI teaching is enabled, add its credential only in Sites settings
  and make the call from server code. Never place a secret in a frontend build
  variable or this repository.

## Before publishing a version

- Test a signed-out visitor: public content works as intended and saved-work
  routes return `401`.
- Test a signed-in visitor: a user row and default profile are created once,
  profile updates change only that user, and sign-out prevents protected API
  access.
- Test D1 writes for challenge submissions, XP idempotency, practice instances,
  and foreign-key cascades.
- Test each migrated verifier fixture against the current FastAPI/SymPy result.
- Review source changes and the SQL migration in Codex's review pane. Save a
  version before deploying it because every Sites deployment URL is production.

## Data migration policy

The local SQLite database is a development/demo store. A production cutover
should import only the application data that is necessary and lawful to retain,
matched to the authenticated email. Exclude `password_hash`, `token_digest`,
expired sessions, and legacy anonymous session identifiers. Start with a fresh
D1 database if there is no approved user-data migration plan.
