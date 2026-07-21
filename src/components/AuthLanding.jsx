'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { safeReturnTo } from '../api/AuthService';
import { useAuth } from '../auth/AuthProvider';

const TRACK_COPY = {
  explorer: 'Explorer keeps the focus on trying ideas and building momentum.',
  learner: 'Learner balances guided practice with visible XP milestones.',
  professional: 'Professional keeps mastery front and center; XP stays private by default.',
};

function recommendedTrack(goal, confidence) {
  if (goal === 'prepare-for-work' || confidence === 'confident') return 'professional';
  if (confidence === 'new') return 'explorer';
  return 'learner';
}

export default function AuthLanding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [goal, setGoal] = useState('understand-concepts');
  const [confidence, setConfidence] = useState('new');
  const [track, setTrack] = useState('explorer');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const suggestedTrack = recommendedTrack(goal, confidence);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const changeGoal = (value) => {
    setGoal(value);
    setTrack(recommendedTrack(value, confidence));
  };

  const changeConfidence = (value) => {
    setConfidence(value);
    setTrack(recommendedTrack(goal, value));
  };

  const submit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      if (mode === 'login') await login({ email, password });
      else await register({ email, password, goal, confidence, activeTrack: track });
      router.replace(safeReturnTo(searchParams.get('returnTo')));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'ProofLab could not sign you in.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="auth-landing">
      <section className="auth-intro">
        <span className="auth-kicker">PROOFLAB · PRIVATE LEARNING SPACE</span>
        <h1>Build proof skills with a workspace that is yours.</h1>
        <p>Sign in to keep your math work, LeetMath attempts, mastery, and optional XP private to this local demo.</p>
        <p className="privacy-notice">We only store your email, password hash, learning preferences, and learning progress on this local setup. Do not use it for sensitive personal information; this is not a public-launch privacy program.</p>
      </section>
      <section className="auth-card" aria-label={mode === 'login' ? 'Sign in to ProofLab' : 'Create a ProofLab account'}>
        <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
          <button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Create account</button>
        </div>
        <h2>{mode === 'login' ? 'Welcome back' : 'Start your learning space'}</h2>
        <p>{mode === 'login' ? 'Your saved work and progress are ready when you are.' : 'Choose a starting direction. You can change it without losing progress.'}</p>
        <form onSubmit={submit} className="auth-form">
          <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={10} maxLength={128} required /></label>
          {mode === 'register' && <>
            <label>Learning goal<select value={goal} onChange={(event) => changeGoal(event.target.value)}><option value="understand-concepts">Understand concepts</option><option value="practice-problems">Practice problems</option><option value="prepare-for-work">Prepare for work</option></select></label>
            <label>Current confidence<select value={confidence} onChange={(event) => changeConfidence(event.target.value)}><option value="new">I’m new to this</option><option value="developing">I’m building confidence</option><option value="confident">I’m ready for depth</option></select></label>
            <fieldset className="track-choice"><legend>Recommended track: <strong>{suggestedTrack}</strong></legend>{Object.entries(TRACK_COPY).map(([value, copy]) => <label key={value}><input type="radio" name="track" value={value} checked={track === value} onChange={() => setTrack(value)} /><span><strong>{value}</strong>{copy}</span></label>)}</fieldset>
          </>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="btn-primary" disabled={isSubmitting}>{isSubmitting ? 'Working…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
        </form>
      </section>
    </main>
  );
}
