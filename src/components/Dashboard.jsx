'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AuthService } from '../api/AuthService';
import { useAuth } from '../auth/AuthProvider';
import { hasLegacyRoughWork, migrateLegacyRoughWork } from '../lib/roughWorkStorage';

const ACHIEVEMENT_LABELS = {
  'first-verified-step': 'First verified step',
  'first-completed-problem': 'First completed problem',
  'first-leetmath-accept': 'First LeetMath accept',
  'concept-mastered': 'Concept mastered',
  'seven-day-streak': 'Seven-day streak',
  'math-strand-complete': 'Math strand complete',
};

const LABS = [
  ['Math', '/math', 'Guided proof work'],
  ['LeetMath', '/leetmath', 'Deterministic final-answer challenges'],
  ['Chemistry', '/chemistry', 'Interactive chemistry tools'],
  ['Physics', '/physics', 'Simulations and visualizers'],
  ['Biology', '/biology', 'Anatomy, genetics, and ecology'],
  ['Guide', '/guide', 'How to get the most from each lab'],
];

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState('');
  const [legacyAvailable, setLegacyAvailable] = useState(() => hasLegacyRoughWork());

  useEffect(() => {
    AuthService.dashboard().then(setDashboard).catch((reason) => setError(reason instanceof Error ? reason.message : 'Your dashboard is unavailable right now.'));
    const timer = window.setTimeout(() => setLegacyAvailable(hasLegacyRoughWork()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const migrateRoughWork = () => {
    if (!user || !migrateLegacyRoughWork(user.id)) return;
    setLegacyAvailable(false);
  };

  return <main className="dashboard-page">
    <section className="dashboard-hero">
      <span className="panel-eyebrow">YOUR LEARNING DASHBOARD</span>
      <h1>Welcome back.</h1>
      <p>Active track: <strong>{profile?.activeTrack}</strong>. Mastery stays visible whatever track you choose.</p>
    </section>
    {legacyAvailable && <section className="legacy-migration-card"><div><strong>Bring in rough work from this browser?</strong><p>We found anonymous rough boards created before sign-in. Copy them into this account’s private workspace.</p></div><button className="btn-secondary" onClick={migrateRoughWork}>Copy rough work</button></section>}
    {error && <p className="auth-error">{error}</p>}
    <section className="dashboard-stats" aria-label="Learning progress">
      {profile?.gamificationEnabled && <article><span>Total XP</span><strong>{dashboard?.totalXp ?? '—'}</strong></article>}
      <article><span>Current streak</span><strong>{dashboard ? `${dashboard.streak} day${dashboard.streak === 1 ? '' : 's'}` : '—'}</strong></article>
      <article><span>Concepts tracked</span><strong>{dashboard?.mastery.length ?? '—'}</strong></article>
      <article><span>Recommended next</span><strong>{dashboard?.recommendation ?? '—'}</strong></article>
    </section>
    <section className="dashboard-section"><div className="dashboard-section-heading"><div><span className="panel-eyebrow">LABS</span><h2>Choose a learning surface</h2></div></div><div className="dashboard-labs">{LABS.map(([title, href, copy]) => <Link href={href} key={href}><strong>{title}</strong><span>{copy}</span></Link>)}</div></section>
    <section className="dashboard-columns">
      <div className="dashboard-section"><span className="panel-eyebrow">MASTERY</span><h2>Concept progress</h2>{!dashboard?.mastery.length ? <p className="dashboard-empty">Open a guided Math problem or LeetMath challenge to begin tracking concepts.</p> : <ul className="mastery-list">{dashboard.mastery.map((item) => <li key={item.conceptId}><div><strong>{item.conceptId.replaceAll('.', ' · ')}</strong><span>{item.distinctSuccesses} accepted activities · {item.firstTrySuccesses} first try</span></div><em>{item.status}</em></li>)}</ul>}</div>
      <div className="dashboard-section"><span className="panel-eyebrow">ACHIEVEMENTS</span><h2>Private milestones</h2>{!dashboard?.achievements.length ? <p className="dashboard-empty">Your earned milestones will appear here. There are no rankings or global counts.</p> : <ul className="achievement-list">{dashboard.achievements.map((item) => <li key={item.code}>✦ {ACHIEVEMENT_LABELS[item.code] ?? item.code}</li>)}</ul>}</div>
    </section>
  </main>;
}
