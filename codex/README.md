# ProofLab ChatGPT Sites migration kit

This directory is isolated on the `codex/sites-migration` branch. It does not
change the root Next frontend or the FastAPI/SQLite service.

## What is prepared

- `.openai/hosting.json` requests a D1 binding named `DB` and no object store.
- `d1/0001_prooflab.sql` maps the durable user, profile, XP, mastery,
  achievement, challenge, and practice data into D1.
- `runtime/` contains framework-neutral, server-only helpers for Sites identity
  and account/profile persistence. A final route adapter must inject the `DB`
  binding after Sites validates the target framework.
- `frontend/` contains the same-origin API and ChatGPT sign-in overlay for a
  copied frontend. The original email/password UI remains untouched.
- `docs/` contains the complete endpoint migration map and release gates.

## Intentionally not claimed as complete

The existing backend depends on FastAPI, SQLAlchemy, Python, and SymPy. Sites
documents a supported Sites runtime, but does not state that this stack—or the
current Next version—is deployable without adaptation. The Python symbolic
verifier is core product logic, so this kit does not silently replace it with a
less reliable browser evaluator.

## Recommended next request to Sites

After opening this branch in ChatGPT Sites, use a prompt along these lines:

> Check whether the copied ProofLab Next frontend is compatible with Sites. Use
> the D1 binding declared in `codex/.openai/hosting.json`; keep `/api` same
> origin; use Sign in with ChatGPT; and save a version for review without
> deploying. Do not enable the Math verifier or public access until the SymPy
> parity routes and tests are ported.

Sites supports durable D1 data, optional Sign in with ChatGPT, hosted secrets,
and reviewable saved versions. It also warns that some frameworks, databases,
private networks, background services, and hosting patterns are unsupported.
Use the current [Sites documentation](https://learn.chatgpt.com/docs/sites)
when the compatibility check is performed.
