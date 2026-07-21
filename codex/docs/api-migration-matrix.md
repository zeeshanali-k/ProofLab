# FastAPI to Sites migration matrix

This matrix is derived from `backend/prooflab_api/main.py`. The current API has
24 routes. Keeping the public response contracts avoids a wholesale frontend
rewrite, but the server implementation must be rebuilt for the Sites runtime.

| Current routes | Sites target | Status | Notes |
| --- | --- | --- | --- |
| `POST /auth/register`, `POST /auth/login`, `POST /auth/logout` | `/signin-with-chatgpt`, `/signout-with-chatgpt` | Replace | Sites owns the redirect flow. Delete local passwords and sessions. |
| `GET /auth/me`, `PATCH /me/profile` | `GET /api/auth/me`, `PATCH /api/me/profile` | Scaffolded | Use `runtime/src/identity.ts` and `accounts.ts`; authorization stays server-side. |
| `GET /me/dashboard`, `POST /activities/introduce` | Same path under `/api` | D1 port required | Translate `progress.py` queries and XP side effects to parameterized D1 statements. |
| `GET /curriculum`, `GET /curriculum/:nodeId` | Same path under `/api` | Content port required | Port the static Python curriculum registry into server-safe TypeScript or static JSON. |
| `POST /practice/next`, `GET /practice/:id`, `POST /practice/:id/verify`, `POST /practice/:id/submit` | Same path under `/api` | D1 + TypeScript port required | Port deterministic generators and fraction parsing from `foundations.py`/`practice.py`; never send private answer payloads to the browser. |
| `GET /challenges`, `GET /challenges/progress`, `GET /challenges/:id`, `POST /challenges/:id/preview`, `POST /challenges/:id/submit`, `GET /challenges/:id/submissions` | Same path under `/api` | D1 + verifier port required | Challenge catalog can be static; checking and progress need a compatible symbolic strategy. |
| `POST /verify`, `/assess-completion`, `/reveal-final-form` | Same path under `/api` | Blocking parity work | Current behavior uses SymPy plus a restricted parser. Do not replace it with an unverified client-only evaluator. |
| `POST /explain` | `/api/explain` | Optional server route | Ollama on a private/local network is not a Sites deployment target. Use a supported remote provider with a Sites secret, or retain the deterministic local-evidence response. |
| `GET /health` | Optional `/api/health` | Simple | Return a dependency-free liveness response; do not expose secrets or D1 data. |

## Delivery gates

1. Ask Sites to validate the copied Next project before adapting framework code.
2. Implement and test the deterministic verifier parity suite before enabling
   Math or LeetMath writes in production.
3. Apply `d1/0001_prooflab.sql`, then test authorization with a signed-out and
   signed-in browser session.
4. Add `/api` route handlers only after the Sites runtime adapter can inject the
   `DB` binding. The shared runtime intentionally does not guess that adapter.
