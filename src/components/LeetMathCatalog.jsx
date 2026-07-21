'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { LeetMathService } from '../api/LeetMathService';
import { WorkspaceTabs } from './WorkspaceNavigation';

const FILTERS = ['All', 'Algebra', 'Inequalities', 'Calculus', 'Complex'];

function ArenaHeader() {
  return (
    <header className="arena-header">
      <Link href="/dashboard" className="wordmark" aria-label="Return to ProofLab dashboard"><span aria-hidden="true">∞</span>ProofLab</Link>
      <WorkspaceTabs current="leetmath" />
      <div className="arena-header-actions"><span className="arena-status">30 deterministic challenges</span></div>
    </header>
  );
}

export default function LeetMathCatalog() {
  const [catalog, setCatalog] = useState([]);
  const [progressByChallenge, setProgressByChallenge] = useState({});
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    LeetMathService.fetchCatalog().then((items) => {
      if (active) setCatalog(items);
    }).catch((reason) => {
      if (active) setError(reason instanceof Error ? reason.message : 'LeetMath could not load the challenge catalog.');
    });
    LeetMathService.fetchProgress().then((items) => {
      if (active) setProgressByChallenge(Object.fromEntries(items.map((item) => [item.challengeId, item])));
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const visibleChallenges = useMemo(() => catalog.filter((challenge) => filter === 'All' || challenge.topic === filter), [catalog, filter]);
  return (
    <div className="arena-page">
      <ArenaHeader />
      <main className="catalog-main">
        <section className="catalog-intro">
          <span className="panel-eyebrow">LEETMATH · CHALLENGE ARENA</span>
          <h1>Can your answer survive the simulation?</h1>
          <p>Short math challenges. One final submission. A deterministic reality check.</p>
        </section>
        <div className="catalog-filter-bar" role="toolbar" aria-label="Challenge topic filters">
          {FILTERS.map((topic) => <button key={topic} className={filter === topic ? 'active' : ''} onClick={() => setFilter(topic)} aria-pressed={filter === topic}>{topic}</button>)}
        </div>
        {error && <p className="arena-error">{error}</p>}
        {!error && !catalog.length && <p className="catalog-loading">Loading challenges…</p>}
        <section className="challenge-catalog" aria-label="LeetMath challenges">
          {visibleChallenges.map((challenge) => {
            const progress = progressByChallenge[challenge.id];
            return <Link href={`/leetmath/${challenge.id}`} className="challenge-catalog-card" key={challenge.id}>
              <div className="challenge-card-top">
                <span>#{String(challenge.number).padStart(3, '0')}</span>
                <span className={`difficulty ${challenge.difficulty.toLowerCase()}`}>{challenge.difficulty}</span>
                {progress && <span className={`challenge-progress ${progress.status}`}>{progress.status === 'solved' ? 'Solved' : 'Attempting'}</span>}
              </div>
              <h2>{challenge.title}</h2>
              <p>{challenge.topic} · {challenge.answerKind.replaceAll('-', ' ')}</p>
              <small>{progress ? `${progress.attemptCount} ${progress.attemptCount === 1 ? 'attempt' : 'attempts'} · ${challenge.simulationPreview}` : challenge.simulationPreview}</small>
            </Link>;
          })}
        </section>
      </main>
    </div>
  );
}
