'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { LeetMathService } from '../api/LeetMathService';
import EquationField from './EquationField';
import MathDisplay from './MathDisplay';
import MathSimulationPanel from './MathSimulationPanel';
import RoughWorkBoardModal from './RoughWorkBoardModal';
import TeachingContent from './TeachingContent';
import { WorkspaceTabs } from './WorkspaceNavigation';
import { leetMathBoardKey } from '../lib/roughWorkStorage';
import { useAuth } from '../auth/AuthProvider';

const storageKey = (userId, challengeId) => `prooflab:leetmath:v2:${userId}:${challengeId}`;

function readDraft(userId, challengeId) {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey(userId, challengeId)) || '{}');
  } catch {
    return {};
  }
}

function saveDraft(userId, challengeId, state) {
  window.localStorage.setItem(storageKey(userId, challengeId), JSON.stringify(state));
}

function ArenaHeader({ challenge }) {
  return (
    <header className="arena-header">
      <Link href="/dashboard" className="wordmark" aria-label="Return to ProofLab dashboard"><span aria-hidden="true">∞</span>ProofLab</Link>
      <WorkspaceTabs current="leetmath" />
      <div className="arena-header-actions"><span className="arena-status">#{String(challenge.number).padStart(3, '0')} · {challenge.difficulty}</span></div>
    </header>
  );
}

export default function ChallengeArena({ challengeId }) {
  const { user } = useAuth();
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [scratch, setScratch] = useState([]);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRoughWorkOpen, setIsRoughWorkOpen] = useState(false);
  const roughWorkButtonRef = useRef(null);

  useEffect(() => {
    let active = true;
    LeetMathService.fetchChallenge(challengeId).then((detail) => {
      if (!active) return;
      const saved = readDraft(user.id, challengeId);
      setChallenge(detail);
      setAnswer(saved.answer ?? detail.starterDraft);
      setScratch(Array.isArray(saved.scratch) ? saved.scratch : []);
      setResult(saved.result ?? null);
      setPreview(null);
    }).catch((reason) => active && setError(reason instanceof Error ? reason.message : 'This challenge could not load.'));
    return () => { active = false; };
  }, [challengeId, user.id]);

  useEffect(() => {
    let active = true;
    if (!challenge) return () => { active = false; };
    LeetMathService.fetchSubmissions(challenge.id)
      .then((records) => active && setSubmissions(records))
      .catch(() => active && setSubmissions([]));
    return () => { active = false; };
  }, [challenge]);

  useEffect(() => {
    if (!challenge) return;
    saveDraft(user.id, challengeId, { answer, scratch, result });
  }, [answer, challenge, challengeId, result, scratch, user.id]);

  useEffect(() => {
    if (!challenge || challenge.visualizerType === 'none' || !answer.trim()) return undefined;
    const timer = window.setTimeout(async () => {
      try {
        const nextPreview = await LeetMathService.preview(challenge.id, answer);
        setPreview(nextPreview);
      } catch {
        setPreview(null);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [answer, challenge]);

  const visualization = useMemo(() => result?.visualization ?? preview?.visualization ?? { type: challenge?.visualizerType ?? 'none', phase: 'draft', learnerData: {} }, [challenge, preview, result]);

  const updateAnswer = (nextAnswer) => {
    setAnswer(nextAnswer);
    setResult(null);
    setPreview(null);
    setError('');
  };

  const updateScratch = (index, value) => setScratch((items) => items.map((item, itemIndex) => itemIndex === index ? value : item));
  const removeScratch = (index) => setScratch((items) => items.filter((_, itemIndex) => itemIndex !== index));

  const reset = () => {
    if (!challenge) return;
    window.localStorage.removeItem(storageKey(user.id, challengeId));
    setAnswer(challenge.starterDraft);
    setScratch([]);
    setPreview(null);
    setResult(null);
    setError('');
  };

  const closeRoughWork = () => {
    const close = () => setIsRoughWorkOpen(false);
    if (typeof document.startViewTransition === 'function') document.startViewTransition(() => flushSync(close));
    else close();
    window.requestAnimationFrame(() => roughWorkButtonRef.current?.focus());
  };

  const openRoughWork = () => {
    const open = () => setIsRoughWorkOpen(true);
    if (typeof document.startViewTransition === 'function') document.startViewTransition(() => flushSync(open));
    else open();
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!answer.trim() || !challenge) return;
    setIsSubmitting(true);
    setError('');
    try {
      const nextResult = await LeetMathService.submit(challenge.id, answer);
      setResult(nextResult);
      setSubmissions(await LeetMathService.fetchSubmissions(challenge.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'LeetMath could not submit this answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !challenge) return <div className="loading-lab">{error}</div>;
  if (!challenge) return <div className="loading-lab">Opening LeetMath challenge…</div>;

  return (
    <div className="arena-page">
      <ArenaHeader challenge={challenge} />
      <main className="challenge-arena-layout">
        <aside className="challenge-brief">
          <div className="challenge-navigation">
            <Link href="/leetmath" className="back-to-catalog">← All challenges</Link>
            <span className="challenge-number-card" aria-label={`Active challenge ${String(challenge.number).padStart(3, '0')}`}><small>ACTIVE</small><strong>#{String(challenge.number).padStart(3, '0')}</strong></span>
          </div>
          <h1>{challenge.title}</h1>
          <p>{challenge.statementText}</p>
          <MathDisplay math={challenge.statementLatex} className="challenge-statement-math" />
          <section><h2>Constraints</h2><ul>{challenge.constraints.map((constraint) => <li key={constraint}><TeachingContent content={constraint} inline /></li>)}</ul></section>
          <section><h2>Answer shape</h2><p>{challenge.answerKind.replaceAll('-', ' ')}</p></section>
          <section><h2>Format example</h2><MathDisplay math={challenge.publicExampleLatex} className="example-math" /><p><TeachingContent content={challenge.publicExampleText} inline /></p></section>
          <section className="submission-history"><h2>Submission history</h2>{submissions.length === 0 ? <p>No submissions in this account yet.</p> : <ol>{submissions.map((submission) => <li key={submission.id}><MathDisplay math={submission.submittedLatex} className="history-answer" /><span className={`history-status ${submission.status}`}>{submission.status.replaceAll('-', ' ')}</span></li>)}</ol>}</section>
          <p className="contract-note">Your answer is checked symbolically, not against memorized text.</p>
        </aside>
        <form className="challenge-workspace" onSubmit={submit}>
          <div className="workspace-heading"><span className="panel-eyebrow">FINAL SUBMISSION</span><span>{challenge.topic} · {challenge.difficulty}</span></div>
          <button type="button" className="rough-work-launcher rough-work-answer-launcher" onClick={openRoughWork} ref={roughWorkButtonRef} aria-label="Open rough work board" title="Open rough work board" style={{ viewTransitionName: isRoughWorkOpen ? 'none' : 'rough-work-launcher' }}>
            <span className="rough-work-launcher-copy"><span className="panel-eyebrow">ROUGH WORK</span><strong>Open drawing board</strong></span>
            <span className="rough-work-launcher-glyph" aria-hidden="true">✎</span>
          </button>
          <label className="challenge-answer-label">Your answer<EquationField value={answer} onChange={updateAnswer} ariaLabel="LeetMath answer" /></label>
          <section className="scratch-section">
            <div><span className="panel-eyebrow">OPTIONAL SCRATCH WORK</span><button type="button" className="btn-text" onClick={() => setScratch((items) => [...items, ''])}>Add scratch step</button></div>
            {scratch.map((value, index) => <div className="scratch-row" key={index}><EquationField value={value} onChange={(nextValue) => updateScratch(index, nextValue)} ariaLabel={`Scratch step ${index + 1}`} /><button type="button" className="icon-btn" onClick={() => removeScratch(index)} aria-label={`Remove scratch step ${index + 1}`}>×</button></div>)}
          </section>
          {error && <p className="arena-error">{error}</p>}
          {result && <section className={`submission-result ${result.status}`} aria-live="polite"><strong>{result.status === 'accepted' ? 'Mathematical contract satisfied' : result.status === 'incorrect' ? 'Not accepted yet' : result.status === 'format-error' ? 'Format error' : 'Unsupported'}</strong><p><TeachingContent content={result.summary} inline /></p>{result.attemptCount > 0 && <small>Attempt {result.attemptCount} recorded in your account.</small>}{result.status === 'accepted' && result.earnedXp > 0 && <small>+{result.earnedXp} XP earned</small>}{result.status === 'accepted' && result.rule && <small>{result.rule}</small>}</section>}
          <div className="challenge-actions"><button type="button" className="btn-secondary" onClick={reset} disabled={isSubmitting}>Reset</button><button className="btn-primary" disabled={isSubmitting || !answer.trim()}>{isSubmitting ? 'Submitting…' : 'Submit answer'}</button></div>
        </form>
        <aside className="challenge-simulator"><MathSimulationPanel visualization={visualization} /></aside>
      </main>
      <RoughWorkBoardModal open={isRoughWorkOpen} boardKey={leetMathBoardKey(user.id, challenge.id)} title={challenge.title} onClose={closeRoughWork} sharedTransitionName="rough-work-launcher" />
    </div>
  );
}
