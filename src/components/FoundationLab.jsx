'use client';

import { useEffect, useMemo, useState } from 'react';
import { FoundationService } from '../api/FoundationService';
import { WorkspaceTabs } from './WorkspaceNavigation';

const clamp = (value, minimum, maximum) => Math.min(Math.max(value, minimum), maximum);

function NumberLine({ data, answer, onAnswer }) {
  const minimum = Number(data.minimum ?? 0);
  const maximum = Number(data.maximum ?? 20);
  const numeric = Number(answer);
  const value = Number.isFinite(numeric) ? clamp(numeric, minimum, maximum) : clamp(Number(data.start ?? minimum), minimum, maximum);
  return <div className="foundation-number-line">
    <div className="foundation-line-track" aria-hidden="true"><span style={{ left: `${((value - minimum) / Math.max(maximum - minimum, 1)) * 100}%` }} /></div>
    <div className="foundation-line-labels"><span>{minimum}</span><span>{maximum}</span></div>
    <label>Move the marker
      <input type="range" min={minimum} max={maximum} value={value} onChange={(event) => onAnswer(event.target.value)} aria-label={`Number line from ${minimum} to ${maximum}`} />
    </label>
    {data.start !== null && data.start !== undefined && <p>Start: {data.start}{data.movement !== null && data.movement !== undefined ? ` · move ${data.movement > 0 ? '+' : ''}${data.movement}` : ''}</p>}
  </div>;
}

function PlaceValueBlocks({ data, answer, onAnswer }) {
  const max = Math.max(999, Number(data.values?.reduce((sum, value) => sum + Number(value), 0) ?? 0) + 150);
  const numeric = Number(answer);
  const value = Number.isFinite(numeric) ? clamp(numeric, 0, max) : 0;
  return <div className="place-value-visual">
    {['hundreds', 'tens', 'ones'].map((place) => data[place] !== undefined && <div key={place} className={`place-block ${place}`}><strong>{data[place]}</strong><span>{place}</span></div>)}
    {data.values && <div className="estimate-values">{data.values.map((value) => <strong key={value}>{value}</strong>)}<span>round to {data.roundTo}</span></div>}
    <label>Set your answer
      <input type="range" min="0" max={max} value={value} onChange={(event) => onAnswer(event.target.value)} aria-label="Place-value answer selector" />
    </label>
    <output aria-live="polite">Selected: {value}</output>
  </div>;
}

function FractionBars({ data, answer, onAnswer }) {
  const denominator = Number(data.denominator ?? 10);
  const selected = answer.includes('/') ? Number(answer.split('/')[0]) : Math.round(Number(answer || 0) * denominator);
  return <div className="fraction-visual">
    <div className="fraction-bars" aria-label="Choose a number of fractional parts">
      {Array.from({ length: denominator * 2 }, (_, index) => <button key={index} className={index < selected ? 'is-selected' : ''} onClick={() => onAnswer(`${index + 1}/${denominator}`)} aria-pressed={index < selected} aria-label={`${index + 1} of ${denominator} parts`}>{index < denominator ? index + 1 : index + 1 - denominator}</button>)}
    </div>
    <p>{data.mode === 'subtract' ? `${data.leftTenths} tenths minus ${data.rightTenths} tenths` : `${data.leftFilled}/${denominator} plus ${data.rightFilled}/${denominator}`}</p>
  </div>;
}

function RatioTable({ data }) {
  return <div className="ratio-table-wrap"><table className="foundation-ratio-table"><thead><tr>{(data.headers ?? []).map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{(data.rows ?? []).map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table>{data.currency && <span className="currency-chip">{data.currency}</span>}</div>;
}

function PracticeVisualizer({ activity, answer, onAnswer }) {
  const data = activity.visualization ?? {};
  if (activity.visualizerType === 'number-line') return <NumberLine data={data} answer={answer} onAnswer={onAnswer} />;
  if (activity.visualizerType === 'place-value-blocks') return <PlaceValueBlocks data={data} answer={answer} onAnswer={onAnswer} />;
  if (activity.visualizerType === 'fraction-bars') return <FractionBars data={data} answer={answer} onAnswer={onAnswer} />;
  return <RatioTable data={data} />;
}

export default function FoundationLab() {
  const [modules, setModules] = useState([]);
  const [selectedModuleId, setSelectedModuleId] = useState('');
  const [activity, setActivity] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    let mounted = true;
    FoundationService.catalog().then((items) => {
      if (!mounted) return;
      setModules(items);
      setSelectedModuleId(items[0]?.id ?? '');
    }).catch((reason) => mounted && setError(reason instanceof Error ? reason.message : 'Foundations could not load.')).finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const selectedModule = useMemo(() => modules.find((module) => module.id === selectedModuleId) ?? modules[0], [modules, selectedModuleId]);

  const launch = async (templateId, restart = false) => {
    setChecking(true); setError(''); setFeedback(null); setAnswer('');
    try { setActivity(await FoundationService.next(templateId, restart)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'This activity could not start.'); }
    finally { setChecking(false); }
  };

  const check = async (submit) => {
    if (!activity || !answer.trim()) { setFeedback({ status: 'invalid', feedback: 'Choose or enter an answer before checking it.' }); return; }
    setChecking(true); setError('');
    try {
      const result = submit ? await FoundationService.submit(activity.instanceId, answer) : await FoundationService.verify(activity.instanceId, answer);
      setActivity(result.instance); setFeedback(result);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Your answer could not be checked.'); }
    finally { setChecking(false); }
  };

  return <main className="foundation-page">
    <header className="foundation-header"><div><span className="panel-eyebrow">VISUAL-FIRST MATH</span><h1>Math Foundations</h1><p>Build quantitative intuition with manipulatives, then confirm each answer with a deterministic check.</p></div><WorkspaceTabs current="foundations" /></header>
    {error && <p className="auth-error" role="alert">{error}</p>}
    <div className="foundation-layout">
      <aside className="foundation-module-list" aria-label="Foundation modules"><span className="panel-eyebrow">10 MODULES · 20 ACTIVITIES</span>{loading && <p>Loading curriculum…</p>}{modules.map((module) => <button key={module.id} className={module.id === selectedModule?.id ? 'is-selected' : ''} onClick={() => { setSelectedModuleId(module.id); setActivity(null); setFeedback(null); }}><strong>{module.title}</strong><span>{module.masteryThreshold} activities to master</span></button>)}</aside>
      <section className="foundation-workspace">
        {!selectedModule ? <p>Choose a module to begin.</p> : <>
          <div className="foundation-module-heading"><div><span className="panel-eyebrow">FOUNDATION MODULE</span><h2>{selectedModule.title}</h2><p>{selectedModule.summary}</p></div><div className="foundation-objectives">{selectedModule.objectives.map((objective) => <span key={objective}>{objective}</span>)}</div></div>
          {!activity && <div className="foundation-activity-picker"><h3>Choose an activity</h3><p>Complete both activities to master this module.</p>{selectedModule.templateIds.map((templateId, index) => <button key={templateId} className="foundation-activity-card" onClick={() => launch(templateId)} disabled={checking}><span>{index === 0 ? 'GUIDED VISUAL MISSION' : 'SEEDED PRACTICE'}</span><strong>{index === 0 ? 'Manipulate the model' : 'Apply it independently'}</strong><small>{index === 0 ? 'A visual model leads the reasoning.' : 'A fresh, deterministic quantity problem.'}</small></button>)}</div>}
          {activity && <article className="foundation-activity" aria-live="polite"><div className="foundation-activity-top"><span>{activity.isGuided ? 'GUIDED VISUAL MISSION' : 'SEEDED PRACTICE'}</span><button className="btn-outline" onClick={() => launch(activity.templateId, true)} disabled={checking}>Start fresh</button></div><h3>{activity.title}</h3><p className="foundation-prompt">{activity.prompt}</p><p className="foundation-instructions">{activity.instructions}</p><PracticeVisualizer activity={activity} answer={answer} onAnswer={setAnswer} />
            <label className="foundation-answer">Your answer<input value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Enter a number, decimal, fraction, or USD amount" disabled={activity.status === 'completed'} /></label>
            <div className="foundation-actions"><button className="btn-secondary" onClick={() => check(false)} disabled={checking || activity.status === 'completed'}>{checking ? 'Checking…' : 'Check model'}</button><button className="btn-primary" onClick={() => check(true)} disabled={checking || activity.status === 'completed'}>{activity.status === 'completed' ? 'Completed' : 'Submit answer'}</button></div>
            {feedback && <div className={`foundation-feedback ${feedback.status}`} role="status"><strong>{feedback.status === 'valid' ? 'Verified' : 'Try again'}</strong><p>{feedback.feedback}</p>{feedback.status === 'valid' && feedback.earnedXp !== undefined && <span>{feedback.earnedXp ? `+${feedback.earnedXp} XP` : 'Practice recorded'}{feedback.masteryStatus ? ` · ${feedback.masteryStatus}` : ''}</span>}</div>}
          </article>}
        </>}
      </section>
    </div>
  </main>;
}
