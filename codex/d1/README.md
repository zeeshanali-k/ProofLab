# D1 migrations

`0001_prooflab.sql` creates a new ProofLab database for a ChatGPT Site. It is
deliberately not a dump of `backend/data/prooflab.db`:

- Sites identity replaces `users.password_hash` and the complete
  `auth_sessions` table.
- Existing users are matched by a normalized email address only after they use
  **Sign in with ChatGPT**. A one-time import must never carry password hashes
  or session tokens into D1.
- `challenge_submissions.user_id` is required because the Sites target requires
  sign-in before persisted work is accepted. The local `legacy_anonymous_session_id`
  is not carried forward.

The current Sites documentation specifies the D1 binding but not a portable
command-line migration runner. Apply each SQL file through the Sites workflow,
review the generated migration in the Codex review pane, and record the applied
filename in the deployment change log. Do not publish before the schema has
been applied to the bound `DB` database.

For a later schema change, add the next numbered SQL file; do not edit an
already-applied migration.
