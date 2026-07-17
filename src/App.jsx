'use client';

import { useEffect, useMemo, useState } from 'react';
import { ProofService, ENV_MODE } from './api/ProofService';
import EquationField from './components/EquationField';
import MathDisplay from './components/MathDisplay';
import { CheckIcon, BrokenIcon, PlusIcon } from './components/Icons';

const STATUS_COPY = {
  root: 'Given',
  valid: 'Checked',
  invalid: 'Needs repair',
  checking: 'Rechecking…',
  inconclusive: 'Needs rechecking',
};

function StatusPill({ status }) {
  return (
    <span className={`status-pill ${status}`}>
      {status === 'valid' && <CheckIcon />}
      {status === 'invalid' && <BrokenIcon />}
      {status === 'checking' && <span className="spinner" aria-hidden="true" />}
      {STATUS_COPY[status] ?? 'Needs rechecking'}
    </span>
  );
}

export default function App() {
  const [data, setData] = useState({ problem: null, steps: [], edges: [] });
  const [selectedEdgeId, setSelectedEdgeId] = useState('e1');
  const [composer, setComposer] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isHelping, setIsHelping] = useState(false);
  const [inspectorMode, setInspectorMode] = useState('evidence');
  const [helpContent, setHelpContent] = useState(null);
  const [isProblemOpen, setIsProblemOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    ProofService.fetchInitialState().then(setData);
  }, []);

  const selectedEdge = useMemo(
    () => data.edges.find((edge) => edge.id === selectedEdgeId),
    [data.edges, selectedEdgeId],
  );

  const chooseEdge = (id) => {
    setSelectedEdgeId(id);
    setInspectorMode('evidence');
    setHelpContent(null);
  };

  const openComposer = (mode, step = null) => {
    setComposer({ mode, stepId: step?.id, value: step?.math ?? '' });
    setInspectorMode('evidence');
  };

  const applyVerification = async ({ previous, next, stepId, edgeId, addStep }) => {
    setIsChecking(true);
    const result = await ProofService.verifyStep(previous, next);
    const edge = { ...result, id: edgeId, from: previous.id, to: next.id };

    setData((current) => ({
      ...current,
      steps: addStep
        ? [...current.steps, { ...next, status: result.status, timestamp: 'Just checked' }]
        : current.steps.map((step) => (step.id === stepId ? { ...step, status: result.status, math: next.math } : step)),
      edges: current.edges.some((candidate) => candidate.id === edgeId)
        ? current.edges.map((candidate) => (candidate.id === edgeId ? edge : candidate))
        : [...current.edges, edge],
    }));
    setSelectedEdgeId(edgeId);
    setInspectorMode('evidence');
    setHelpContent(null);
    setAnnouncement(
      result.status === 'invalid'
        ? `${next.type} is invalid. Counterexample available.`
        : result.status === 'valid'
          ? `${next.type} is checked and valid.`
          : `${next.type} needs rechecking.`,
    );
    setIsChecking(false);
    setComposer(null);
  };

  const submitComposer = async () => {
    if (!composer?.value.trim() || isChecking) return;

    if (composer.mode === 'edit') {
      const stepIndex = data.steps.findIndex((step) => step.id === composer.stepId);
      const previous = data.steps[stepIndex - 1];
      const existing = data.steps[stepIndex];
      if (!previous || !existing) return;

      const edge = data.edges.find((candidate) => candidate.to === existing.id);
      const next = { ...existing, math: composer.value, status: 'checking' };
      setData((current) => ({
        ...current,
        steps: current.steps.map((step, index) => (index >= stepIndex ? { ...step, status: 'checking' } : step)),
        edges: current.edges.map((candidate) => (candidate.from === previous.id ? { ...candidate, status: 'checking' } : candidate)),
      }));
      await applyVerification({ previous, next, stepId: existing.id, edgeId: edge?.id ?? `e${Date.now()}`, addStep: false });
      return;
    }

    const previous = data.steps.at(-1);
    if (!previous) return;
    const order = data.steps.length + 1;
    const next = { id: `s${Date.now()}`, type: `STEP ${order}`, math: composer.value, status: 'checking' };
    await applyVerification({ previous, next, stepId: next.id, edgeId: `e${Date.now()}`, addStep: true });
  };

  const applyRepair = async () => {
    if (!selectedEdge) return;
    const faultyStep = data.steps.find((step) => step.id === selectedEdge.to);
    const stepIndex = data.steps.findIndex((step) => step.id === selectedEdge.to);
    const previous = data.steps[stepIndex - 1];
    if (!faultyStep || !previous || isChecking) return;

    const math = helpContent?.repairLatex || selectedEdge.verification?.verifiedRepairLatex || 'x^2 + 4x + 4 = 25';
    const next = { ...faultyStep, math, status: 'checking' };
    setData((current) => ({
      ...current,
      steps: current.steps.map((step, index) => (index >= stepIndex ? { ...step, status: 'checking' } : step)),
      edges: current.edges.map((edge) => (edge.id === selectedEdge.id ? { ...edge, status: 'checking' } : edge)),
    }));
    await applyVerification({ previous, next, stepId: faultyStep.id, edgeId: selectedEdge.id, addStep: false });
  };

  const requestHelp = async (mode) => {
    if (!selectedEdge || isHelping) return;
    const previousStep = data.steps.find((step) => step.id === selectedEdge.from);
    const nextStep = data.steps.find((step) => step.id === selectedEdge.to);
    if (!previousStep || !nextStep || !selectedEdge.verification) return;
    setIsHelping(true);
    try {
      const content = await ProofService.explain(previousStep, nextStep, selectedEdge.verification, mode);
      setHelpContent(content);
      setInspectorMode(mode);
    } catch (error) {
      setAnnouncement(error instanceof Error ? error.message : 'Teaching help is unavailable right now.');
    } finally {
      setIsHelping(false);
    }
  };

  const deleteStep = (id) => {
    const stepIndex = data.steps.findIndex((step) => step.id === id);
    if (stepIndex <= 0) return;
    const removed = new Set(data.steps.slice(stepIndex).map((step) => step.id));
    setData((current) => ({
      ...current,
      steps: current.steps.filter((step) => !removed.has(step.id)),
      edges: current.edges.filter((edge) => !removed.has(edge.from) && !removed.has(edge.to)),
    }));
    setSelectedEdgeId(null);
    setAnnouncement('Step removed. Later steps need to be added again.');
  };

  const resetExample = async () => {
    const next = await ProofService.fetchInitialState();
    setData(next);
    setSelectedEdgeId('e1');
    setComposer(null);
    setInspectorMode('evidence');
    setHelpContent(null);
    setAnnouncement('The missing middle term example has been reset.');
  };

  if (!data.problem) return <div className="loading-lab">Opening your algebra lab…</div>;

  const isInvalid = selectedEdge?.status === 'invalid';
  const isValid = selectedEdge?.status === 'valid';

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <div className="wordmark" aria-label="ProofLab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="logo-icon" aria-hidden="true">
              <circle cx="6" cy="12" r="3" /><circle cx="18" cy="12" r="3" /><line x1="9" y1="12" x2="15" y2="12" />
            </svg>
            ProofLab
          </div>
          <span className="breadcrumb">Algebra Lab <span>/</span> Quadratics</span>
        </div>
        <div className="header-right">
          <span className="save-status"><span className="save-dot" /> Saved locally</span>
          <button className="problem-toggle" onClick={() => setIsProblemOpen((open) => !open)}>Problem</button>
          <button className="icon-btn" aria-label="Help with ProofLab" title="Evidence is shown before any coaching help.">?</button>
          <button className="icon-btn" aria-label="More options">•••</button>
        </div>
      </header>

      <main className="workspace">
        <aside className={`problem-rail ${isProblemOpen ? 'is-open' : ''}`}>
          <div className="rail-eyebrow">TODAY&apos;S PROBLEM</div>
          <div className="prompt-card">
            <div className="prompt-label">Solve</div>
            <MathDisplay math={data.problem.prompt} />
          </div>
          <div className="goal-section"><div className="goal-label">Goal</div><div className="goal-text">{data.problem.goal}</div></div>
          <div className="progress-indicator" aria-label={data.problem.progress}>
            <span className="progress-dot checked" /><span className="progress-dot error" /><span className="progress-dot" />
            <span className="progress-text">{data.problem.progress}</span>
          </div>
          <button className="reset-example" onClick={resetExample}>Reset example</button>
        </aside>

        <section className="reasoning-path" aria-label="Reasoning path">
          <div className="path-intro"><span>REASONING PATH</span><span>{ENV_MODE}</span></div>
          <div className="path-container">
            {data.steps.map((step) => {
              const edgeOut = data.edges.find((edge) => edge.from === step.id);
              return (
                <div key={step.id} className="step-flow">
                  <article className={`step-card ${step.status === 'root' ? 'root-card' : ''} ${step.status === 'invalid' ? 'invalid-card' : ''} ${step.status === 'checking' ? 'checking-card' : ''}`}>
                    <div className="card-header">
                      <span className="step-label">{step.type}</span>
                      <StatusPill status={step.status} />
                    </div>
                    <MathDisplay math={step.math} />
                    <div className="card-footer">
                      <span className="timestamp">{step.timestamp}</span>
                      {step.status !== 'root' && (
                        <span className="card-tools">
                          <button className="card-tool" onClick={() => openComposer('edit', step)} aria-label={`Edit ${step.type}`}>✎</button>
                          <button className="card-tool" onClick={() => deleteStep(step.id)} aria-label={`Delete ${step.type}`}>⌫</button>
                        </span>
                      )}
                    </div>
                  </article>
                  {edgeOut && (
                    <button
                      className={`edge-container ${selectedEdgeId === edgeOut.id ? 'selected' : ''}`}
                      onClick={() => chooseEdge(edgeOut.id)}
                      aria-label={`Transition from ${step.type} to ${data.steps.find((candidate) => candidate.id === edgeOut.to)?.type}: ${edgeOut.status}, ${edgeOut.label}`}
                    >
                      <span className={`edge-line ${edgeOut.status}`} />
                      <span className={`edge-label ${edgeOut.status}`}>{edgeOut.label}</span>
                      <span className={`edge-marker ${edgeOut.status}`}>{edgeOut.status === 'invalid' ? <BrokenIcon /> : edgeOut.status === 'checking' ? <span className="spinner" /> : <CheckIcon />}</span>
                    </button>
                  )}
                </div>
              );
            })}

            <div className="edge-container pending-edge" aria-hidden="true"><span className="edge-line pending" /></div>
            {composer ? (
              <section className="composer-card" aria-label={composer.mode === 'edit' ? 'Edit equation' : 'Add next step'}>
                <div className="composer-heading"><span>{composer.mode === 'edit' ? 'EDIT THIS STEP' : 'YOUR NEXT STEP'}</span><button className="icon-btn" onClick={() => setComposer(null)} aria-label="Close equation composer">×</button></div>
                <EquationField value={composer.value} onChange={(value) => setComposer((current) => ({ ...current, value }))} />
                <div className="math-toolbar" aria-label="Equation shortcuts">
                  <button onClick={() => setComposer((current) => ({ ...current, value: `${current.value}\\frac{ }{ }` }))}>Fraction</button>
                  <button onClick={() => setComposer((current) => ({ ...current, value: `${current.value}^{ }` }))}>Exponent</button>
                  <button onClick={() => setComposer((current) => ({ ...current, value: `${current.value}( )` }))}>Parentheses</button>
                </div>
                <div className="composer-actions"><button className="btn-text" onClick={() => setComposer(null)}>Cancel</button><button className="btn-primary" onClick={submitComposer} disabled={isChecking}>{isChecking ? <><span className="spinner" /> Checking…</> : 'Check step'}</button></div>
              </section>
            ) : (
              <button className="add-step-card" onClick={() => openComposer('add')}><PlusIcon /> Add next step</button>
            )}
          </div>
        </section>

        <aside className={`transition-inspector ${selectedEdge ? 'is-open' : ''}`} aria-label="Transition evidence">
          {selectedEdge ? (
            <>
              <div className="inspector-header">
                <span className={`inspector-icon ${selectedEdge.status}`}>{isInvalid ? <BrokenIcon /> : <CheckIcon />}</span>
                <h2>{selectedEdge.inspectorData.title}</h2>
                <button className="icon-btn close-btn" onClick={() => setSelectedEdgeId(null)} aria-label="Close evidence inspector">×</button>
              </div>
              {inspectorMode === 'evidence' && (
                <>
                  <p className="finding-text">{selectedEdge.inspectorData.finding}</p>
                  {selectedEdge.inspectorData.realityCheck && <Counterexample edge={selectedEdge} />}
                  {isInvalid && <div className="inspector-actions"><button className="btn-outline" onClick={() => requestHelp('hint')} disabled={isHelping}>Give me a hint</button><button className="btn-secondary" onClick={() => requestHelp('explain')} disabled={isHelping}>Explain why</button><button className="btn-primary" onClick={() => requestHelp('repair')} disabled={isHelping}>{isHelping ? 'Preparing…' : 'Show repair'}</button></div>}
                  {isValid && <p className="valid-note">The rule detected: <strong>{selectedEdge.label}</strong></p>}
                  {!isInvalid && !isValid && <p className="scope-note">This version checks one-variable linear and quadratic algebra.</p>}
                </>
              )}
              {inspectorMode === 'hint' && <HelpPanel kind="hint" content={helpContent} back={() => setInspectorMode('evidence')} />}
              {inspectorMode === 'explain' && <HelpPanel kind="explain" content={helpContent} back={() => setInspectorMode('evidence')} />}
              {inspectorMode === 'repair' && <RepairPanel content={helpContent} onApply={applyRepair} onKeep={() => setInspectorMode('evidence')} />}
            </>
          ) : <div className="inspector-empty"><p>Select a transition to inspect its evidence.</p></div>}
        </aside>
      </main>
      <div className="sr-only" aria-live="polite">{announcement}</div>
    </div>
  );
}

function Counterexample({ edge }) {
  const check = edge.inspectorData.realityCheck;
  return (
    <section className="counterexample-card">
      <h3>Reality check: try {check.testValue}</h3>
      <div className="calc-table">
        <div className="calc-row"><span className="calc-label">Original</span><MathDisplay math={check.originalMath} className="calc-math" /><span className="calc-result">= {check.originalResult}</span></div>
        <div className="calc-row"><span className="calc-label">Your step</span><MathDisplay math={check.stepMath} className="calc-math" /><span className="calc-result">= {check.stepResult}</span></div>
      </div>
      <p className="calc-note">Because the results differ, these expressions are not equivalent.</p>
    </section>
  );
}

function HelpPanel({ kind, content, back }) {
  const hint = kind === 'hint';
  return (
    <section className={hint ? 'hint-panel' : 'explain-panel'}>
      {hint ? <><span className="panel-eyebrow">A SMALL NUDGE</span><p>{content?.question || content?.body}</p></> : <><span className="panel-eyebrow">WHY THIS CHANGES</span><MathDisplay math={'(x + 2)^2 = (x + 2)(x + 2)'} /><MathDisplay math={'= x^2 + 2x + 2x + 4'} /><MathDisplay math={'= x^2 + 4x + 4'} /><p>{content?.body}</p></>}
      <button className="btn-primary" onClick={back}>{hint ? 'I’ll try again' : 'Back to evidence'}</button>
    </section>
  );
}

function RepairPanel({ content, onApply, onKeep }) {
  return (
    <section className="repair-panel">
      <span className="panel-eyebrow">SUGGESTED REPAIR</span>
      <div className="diff-row"><span>Your step</span><MathDisplay math={'x^2 + 4 = 25'} /></div>
      <div className="diff-row suggested"><span>Suggested</span><MathDisplay math={content?.repairLatex || 'x^2 + 4x + 4 = 25'} /><em>+4x</em></div>
      <p>{content?.body || 'This is a draft. ProofLab will check it before updating your work.'}</p>
      <div className="repair-actions"><button className="btn-secondary" onClick={onKeep}>Keep mine</button><button className="btn-primary" onClick={onApply}>Apply and check</button></div>
    </section>
  );
}
