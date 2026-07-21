'use client';

/**
 * Replacement landing page for a Sites copy of ProofLab.
 *
 * Sites owns the sign-in and sign-out flow. This deliberately removes the
 * local email/password form, so password hashes never enter D1.
 */
export default function SitesAuthLanding() {
  return (
    <main className="auth-landing">
      <section className="auth-intro">
        <span className="auth-kicker">PROOFLAB · PRIVATE LEARNING SPACE</span>
        <h1>Build proof skills with a workspace that is yours.</h1>
        <p>Sign in to save practice instances, LeetMath submissions, mastery, and optional XP.</p>
        <p className="privacy-notice">ProofLab stores your account email and learning progress. It does not store a password.</p>
      </section>
      <section className="auth-card" aria-label="Sign in to ProofLab">
        <h2>Continue learning</h2>
        <p>Use your ChatGPT account to start or reopen your private learning space.</p>
        <a className="btn-primary" href="/signin-with-chatgpt">Sign in with ChatGPT</a>
      </section>
    </main>
  );
}
