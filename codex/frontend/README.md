# Frontend overlay

These files are reference replacements for a **copy** of the Next frontend
that is prepared for Sites. They are not imported anywhere in the current
application.

When Sites confirms the copied project is compatible:

1. Copy the existing `app/`, `src/`, `lib/`, and `public/` files into the Sites
   project rather than moving the originals.
2. Replace the password form with `AuthLanding.sites.jsx` and make the auth
   provider call `SitesAuthService` from `sites-api.js`.
3. Change the four existing API clients to use a single same-origin `/api`
   request helper. Remove `NEXT_PUBLIC_PROOFLAB_API_URL`, `FRONTEND_ORIGIN`,
   and browser-side CORS assumptions.
4. Preserve the existing response shapes where possible: the client already
   expects camel-cased `CurrentUserPayload`, profile, dashboard, practice, and
   LeetMath responses.

The Sites replacement changes the identity experience only. It does **not**
port the Python/SymPy verifier; see `../docs/api-migration-matrix.md` before
publishing a functional math experience.
