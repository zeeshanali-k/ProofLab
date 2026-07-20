'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ProofService, ENV_MODE } from './api/ProofService';
import EquationField from './components/EquationField';
import CanonicalProgress from './components/CanonicalProgress';
import GuideScreen from './components/GuideScreen';
import MathDisplay from './components/MathDisplay';
import InequalityNumberLine from './components/InequalityNumberLine';
import TeachingContent from './components/TeachingContent';
import { CheckIcon, BrokenIcon, PlusIcon } from './components/Icons';

const STATUS_COPY = {
  root: 'Given',
  valid: 'Checked',
  invalid: 'Needs repair',
  checking: 'Rechecking…',
  inconclusive: 'Needs rechecking',
};

const defaultClaimKind = (problem) => {
  if (problem.mode === 'inequality') return 'inequality';
  if (problem.mode === 'derivative') return 'derivative';
  if (problem.mode === 'integral') return 'antiderivative';
  if (problem.mode === 'complex-simplify') return 'expression';
  return 'equation';
};

const initialComposerValue = (kind) => {
  if (kind === 'derivative') return "f'(x) = ";
  if (kind === 'antiderivative') return 'F(x) =  + C';
  if (kind === 'solution-set') return '\\{ \\}';
  return '';
};

const scopeCopy = (mode) => ({
  algebra: 'This problem checks one-variable linear and quadratic algebra.',
  inequality: 'This problem checks one-variable linear <, ≤, >, and ≥ inequalities.',
  derivative: 'This problem checks polynomial and sin, cos, or tan derivatives with polynomial inner functions.',
  integral: 'This problem checks restricted indefinite integrals of polynomials plus sin(ax+b) and cos(ax+b), with + C.',
  'complex-simplify': 'This problem checks rectangular complex arithmetic using i.',
  'complex-solve': 'This problem currently checks simple rational imaginary roots.',
}[mode] ?? 'This step needs rechecking.');

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
  const [helpEdgeId, setHelpEdgeId] = useState(null);
  const [isProblemOpen, setIsProblemOpen] = useState(false);
  const [isProblemPickerOpen, setIsProblemPickerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isLoadingProblem, setIsLoadingProblem] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const [revealedFinalForm, setRevealedFinalForm] = useState(null);
  const [isRevealingFinalForm, setIsRevealingFinalForm] = useState(false);
  const helpRequestId = useRef(0);
  const clientIdSequence = useRef(0);
  const helpButtonRef = useRef(null);

  useEffect(() => {
    ProofService.fetchInitialState().then(setData).catch((error) => setLoadError(error instanceof Error ? error.message : 'ProofLab could not load a problem.'));
  }, []);

  const selectedEdge = useMemo(
    () => data.edges.find((edge) => edge.id === selectedEdgeId),
    [data.edges, selectedEdgeId],
  );

  const closeGuide = () => {
    setIsGuideOpen(false);
    window.requestAnimationFrame(() => helpButtonRef.current?.focus());
  };

  const chooseEdge = (id) => {
    setSelectedEdgeId(id);
    setInspectorMode('evidence');
    clearTeachingContent();
  };

  function clearTeachingContent() {
    helpRequestId.current += 1;
    setHelpContent(null);
    setHelpEdgeId(null);
    setIsHelping(false);
  }

  function nextClientId(prefix) {
    clientIdSequence.current += 1;
    return `${prefix}-local-${clientIdSequence.current}`;
  }

  function setBoardState(next) {
    setData(next);
    const selected = next.edges.find((edge) => edge.status === 'invalid') ?? next.edges.at(-1);
    setSelectedEdgeId(selected?.id ?? null);
    setComposer(null);
    setRevealedFinalForm(null);
    setIsRevealingFinalForm(false);
    clearTeachingContent();
    setInspectorMode('evidence');
  }

  const loadProblem = async (definition, custom = false) => {
    setIsLoadingProblem(true);
    setLoadError('');
    try {
      const next = custom ? await ProofService.createCustomProblem(definition) : await ProofService.loadProblem(definition);
      setBoardState(next);
      setAnnouncement(`${next.problem.title} is ready to explore.`);
      setIsProblemPickerOpen(false);
      setIsProblemOpen(false);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'ProofLab could not load this problem.');
    } finally {
      setIsLoadingProblem(false);
    }
  };

  const openComposer = (mode, step = null, requestedKind = null) => {
    const kind = step?.kind ?? requestedKind ?? defaultClaimKind(data.problem);
    setComposer({ mode, stepId: step?.id, kind, value: step?.math ?? initialComposerValue(kind) });
    setInspectorMode('evidence');
    clearTeachingContent();
  };

  const applyVerification = async ({ previous, next, stepId, edgeId, addStep }) => {
    setIsChecking(true);
    try {
      const result = await ProofService.verifyStep(previous, next, data.problem.mode);
      const edge = { ...result, id: edgeId, from: previous.id, to: next.id };
      const nextSteps = addStep
        ? [...data.steps, { ...next, status: result.status, timestamp: 'Just checked' }]
        : data.steps.map((step) => (step.id === stepId ? { ...step, status: result.status, math: next.math } : step));
      const completionStatus = await ProofService.assessCompletion(data.problem, nextSteps);
      setData((current) => ({
        ...current,
        steps: nextSteps,
        edges: current.edges.some((candidate) => candidate.id === edgeId)
          ? current.edges.map((candidate) => (candidate.id === edgeId ? edge : candidate))
          : [...current.edges, edge],
        completionStatus,
      }));
      setSelectedEdgeId(edgeId);
      setInspectorMode('evidence');
      clearTeachingContent();
      setAnnouncement(
        result.status === 'invalid'
          ? `${next.type} is invalid. Counterexample available.`
          : result.status === 'valid'
            ? `${next.type} is checked and valid.`
            : `${next.type} needs rechecking.`,
      );
      setComposer(null);
      return true;
    } catch (error) {
      setAnnouncement(error instanceof Error ? error.message : 'ProofLab could not check this step.');
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const verifyExistingChain = async (startIndex, replacement) => {
    const before = data;
    const workingSteps = before.steps.map((step, index) => index === startIndex ? { ...replacement, status: 'checking' } : { ...step });
    const workingEdges = before.edges.map((edge) => ({ ...edge }));

    setData({
      ...before,
      steps: workingSteps.map((step, index) => index >= startIndex ? { ...step, status: 'checking', timestamp: 'Rechecking' } : step),
      edges: workingEdges.map((edge, index) => index >= startIndex - 1 ? { ...edge, status: 'checking', label: 'rechecking' } : edge),
    });
    setIsChecking(true);
    try {
      let selectedId = null;
      for (let index = startIndex; index < workingSteps.length; index += 1) {
        const previous = workingSteps[index - 1];
        const next = workingSteps[index];
        const result = await ProofService.verifyStep(previous, next, before.problem.mode);
        const edgeIndex = workingEdges.findIndex((edge) => edge.to === next.id);
        const existingEdge = workingEdges[edgeIndex];
        const checkedEdge = { ...result, id: existingEdge?.id ?? nextClientId('e'), from: previous.id, to: next.id };
        workingSteps[index] = { ...next, status: result.status, timestamp: result.status === 'valid' ? 'Checked' : 'Needs rechecking' };
        if (edgeIndex >= 0) workingEdges[edgeIndex] = checkedEdge;
        else workingEdges.push(checkedEdge);
        selectedId ??= checkedEdge.id;

        if (result.status !== 'valid') {
          for (let later = index + 1; later < workingSteps.length; later += 1) {
            workingSteps[later] = { ...workingSteps[later], status: 'checking', timestamp: 'Needs rechecking' };
            const laterEdgeIndex = workingEdges.findIndex((edge) => edge.to === workingSteps[later].id);
            if (laterEdgeIndex >= 0) workingEdges[laterEdgeIndex] = { ...workingEdges[laterEdgeIndex], status: 'checking', label: 'needs rechecking' };
          }
          break;
        }
      }
      const completionStatus = await ProofService.assessCompletion(before.problem, workingSteps);
      setData({ ...before, steps: workingSteps, edges: workingEdges, completionStatus });
      setSelectedEdgeId(selectedId);
      setInspectorMode('evidence');
      clearTeachingContent();
      setAnnouncement('ProofLab rechecked this step and every later step it could reach.');
      setComposer(null);
      return true;
    } catch (error) {
      setData(before);
      setAnnouncement(error instanceof Error ? error.message : 'ProofLab could not recheck this sequence.');
      return false;
    } finally {
      setIsChecking(false);
    }
  };

  const submitComposer = async () => {
    if (!composer?.value.trim() || isChecking) return;

    if (composer.mode === 'edit') {
      const stepIndex = data.steps.findIndex((step) => step.id === composer.stepId);
      const previous = data.steps[stepIndex - 1];
      const existing = data.steps[stepIndex];
      if (!previous || !existing) return;

      const next = { ...existing, math: composer.value, kind: composer.kind, status: 'checking' };
      await verifyExistingChain(stepIndex, next);
      return;
    }

    const previous = data.steps.at(-1);
    if (!previous) return;
    const order = data.steps.length + 1;
    const next = { id: nextClientId('s'), type: `STEP ${order}`, math: composer.value, kind: composer.kind, status: 'checking' };
    await applyVerification({ previous, next, stepId: next.id, edgeId: nextClientId('e'), addStep: true });
  };

  const applyRepair = async () => {
    if (!selectedEdge) return;
    const faultyStep = data.steps.find((step) => step.id === selectedEdge.to);
    const stepIndex = data.steps.findIndex((step) => step.id === selectedEdge.to);
    if (!faultyStep || stepIndex <= 0 || isChecking) return;

    const math = (helpEdgeId === selectedEdge.id ? helpContent?.repairLatex : undefined) || selectedEdge.verification?.verifiedRepairLatex;
    if (!math) {
      setAnnouncement('ProofLab does not have a verified repair for this step yet.');
      return;
    }
    const next = { ...faultyStep, math, status: 'checking' };
    await verifyExistingChain(stepIndex, next);
  };

  const requestHelp = async (mode) => {
    if (!selectedEdge || isHelping) return;
    const previousStep = data.steps.find((step) => step.id === selectedEdge.from);
    const nextStep = data.steps.find((step) => step.id === selectedEdge.to);
    if (!previousStep || !nextStep || !selectedEdge.verification) return;
    const requestId = helpRequestId.current + 1;
    helpRequestId.current = requestId;
    setIsHelping(true);
    try {
      const content = await ProofService.explain(previousStep, nextStep, selectedEdge.verification, mode);
      if (helpRequestId.current !== requestId) return;
      setHelpContent(content);
      setHelpEdgeId(selectedEdge.id);
      setInspectorMode(mode);
    } catch (error) {
      if (helpRequestId.current === requestId) setAnnouncement(error instanceof Error ? error.message : 'Teaching help is unavailable right now.');
    } finally {
      if (helpRequestId.current === requestId) setIsHelping(false);
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
      completionStatus: current.problem.canonicalGoal ? 'in-progress' : 'not-applicable',
    }));
    setSelectedEdgeId(null);
    setAnnouncement('Step removed. Later steps need to be added again.');
  };

  const resetExample = async () => {
    if (!data.problem) return;
    await loadProblem(data.problem);
    setAnnouncement(`${data.problem.title} has been reset.`);
  };

  const revealFinalForm = async () => {
    if (!data.problem.canonicalGoal || isRevealingFinalForm) return;
    setIsRevealingFinalForm(true);
    try {
      const result = await ProofService.revealFinalForm(data.problem, data.steps[0]);
      setRevealedFinalForm(result.canonicalLatex);
      setAnnouncement('The canonical final form is shown without changing your reasoning path.');
    } catch (error) {
      setAnnouncement(error instanceof Error ? error.message : 'ProofLab could not reveal the final form.');
    } finally {
      setIsRevealingFinalForm(false);
    }
  };

  if (!data.problem) return <div className="loading-lab">{loadError || 'Opening your algebra lab…'}</div>;

  const isInvalid = selectedEdge?.status === 'invalid';
  const isValid = selectedEdge?.status === 'valid';
  const selectedNextStep = data.steps.find((step) => step.id === selectedEdge?.to);
  const repairLatex = helpEdgeId === selectedEdge?.id ? helpContent?.repairLatex : selectedEdge?.verification?.verifiedRepairLatex;
  const checkedCount = data.steps.filter((step) => step.status !== 'root' && step.status !== 'checking').length;
  const expectedCount = Math.max(data.problem.seedSteps?.length ?? 0, checkedCount);
  const progress = expectedCount ? `${checkedCount} of ${expectedCount} steps checked` : checkedCount ? `${checkedCount} step${checkedCount === 1 ? '' : 's'} checked` : 'Add a step to begin';
  const progressDots = data.edges.length ? data.edges.slice(0, 4).map((edge) => edge.status) : ['pending'];
  return (
    <div className="app-container">
      {isGuideOpen ? <GuideScreen onClose={closeGuide} /> : <>
      <header className="app-header">
        <div className="header-left">
          <div className="wordmark" aria-label="ProofLab">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="logo-icon" aria-hidden="true">
              <circle cx="6" cy="12" r="3" /><circle cx="18" cy="12" r="3" /><line x1="9" y1="12" x2="15" y2="12" />
            </svg>
            ProofLab
          </div>
          <span className="breadcrumb">{['derivative', 'integral'].includes(data.problem.mode) ? 'Calculus Lab' : data.problem.mode === 'inequality' ? 'Inequality Lab' : data.problem.mode.startsWith('complex') ? 'Complex Lab' : 'Algebra Lab'} <span>/</span> {data.problem.category}</span>
        </div>
        <div className="header-right">
          <span className="save-status"><span className="save-dot" /> Saved locally</span>
          <button className="problem-toggle" onClick={() => setIsProblemOpen((open) => !open)}>Problem</button>
          <button className="icon-btn" ref={helpButtonRef} onClick={() => setIsGuideOpen(true)} aria-label="Open ProofLab guide" title="Open the ProofLab platform guide.">?</button>
          <button className="icon-btn" aria-label="More options">•••</button>
        </div>
      </header>

      <main className="workspace">
        <aside className={`problem-rail ${isProblemOpen ? 'is-open' : ''}`}>
          <div className="rail-eyebrow">CURRENT PROBLEM</div>
          <h1 className="problem-title">{data.problem.title}</h1>
          <div className="prompt-card">
            <div className="prompt-label">Solve</div>
            <MathDisplay math={data.problem.prompt} />
          </div>
          <div className="goal-section"><div className="goal-label">Goal</div><div className="goal-text">{data.problem.goal}</div></div>
          <div className="progress-indicator" aria-label={progress}>
            {progressDots.map((status, index) => <span key={`${status}-${index}`} className={`progress-dot ${status === 'valid' ? 'checked' : status === 'invalid' ? 'error' : status === 'unsupported' || status === 'inconclusive' ? 'warning' : ''}`} />)}
            <span className="progress-text">{progress}</span>
          </div>
          {data.problem.canonicalGoal && (
            <CanonicalProgress status={data.completionStatus} onReveal={revealFinalForm} isRevealing={isRevealingFinalForm} revealedFinalForm={revealedFinalForm} />
          )}
          <div className="problem-actions">
            <button className="choose-problem" onClick={() => setIsProblemPickerOpen(true)} disabled={isLoadingProblem}>Choose a problem</button>
            <button className="reset-example" onClick={resetExample} disabled={isLoadingProblem}>Reset {data.problem.isCustom ? 'my problem' : 'example'}</button>
          </div>
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
                <div className="composer-heading"><span>{composer.mode === 'edit' ? 'EDIT THIS STEP' : composer.kind === 'inequality' ? 'YOUR INEQUALITY' : composer.kind === 'derivative' ? 'YOUR DERIVATIVE' : composer.kind === 'antiderivative' ? 'YOUR ANTIDERIVATIVE' : composer.kind === 'solution-set' ? 'YOUR SOLUTION SET' : 'YOUR NEXT STEP'}</span><button className="icon-btn" onClick={() => setComposer(null)} aria-label="Close equation composer">×</button></div>
                <EquationField value={composer.value} onChange={(value) => setComposer((current) => ({ ...current, value }))} />
                <div className="math-toolbar" aria-label="Equation shortcuts">
                  <button onClick={() => setComposer((current) => ({ ...current, value: `${current.value}\\frac{ }{ }` }))}>Fraction</button>
                  <button onClick={() => setComposer((current) => ({ ...current, value: `${current.value}^{ }` }))}>Exponent</button>
                  <button onClick={() => setComposer((current) => ({ ...current, value: `${current.value}( )` }))}>Parentheses</button>
                  {composer.kind === 'solution-set' && <button onClick={() => setComposer((current) => ({ ...current, value: '\\{ \\}' }))}>Solution set</button>}
                </div>
                <div className="composer-actions"><button className="btn-text" onClick={() => setComposer(null)}>Cancel</button><button className="btn-primary" onClick={submitComposer} disabled={isChecking}>{isChecking ? <><span className="spinner" /> Checking…</> : composer.kind === 'solution-set' ? 'Check solutions' : 'Check step'}</button></div>
              </section>
            ) : data.problem.mode === 'complex-solve' ? (
              <div className="add-step-options">
                <button className="add-step-card" onClick={() => openComposer('add', null, 'equation')}><PlusIcon /> Add equivalent step</button>
                <button className="add-step-card solution-set-card" onClick={() => openComposer('add', null, 'solution-set')}><PlusIcon /> Submit solution set</button>
              </div>
            ) : (
              <button className="add-step-card" onClick={() => openComposer('add')}><PlusIcon /> {data.problem.mode === 'inequality' ? 'Add inequality step' : data.problem.mode === 'derivative' ? 'Add next derivative' : data.problem.mode === 'integral' ? 'Add antiderivative' : 'Add next step'}</button>
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
                  <TeachingContent className="finding-text" content={selectedEdge.inspectorData.finding} />
                  {isInvalid && selectedEdge.inspectorData.mistakePattern && <p className="mistake-pattern"><span>Mistake pattern</span>{selectedEdge.inspectorData.mistakePattern}</p>}
                  {selectedEdge.inspectorData.evidence && <EvidenceCard evidence={selectedEdge.inspectorData.evidence} rule={selectedEdge.verification?.rule} />}
                  {isInvalid && <div className="inspector-actions"><button className="btn-outline" onClick={() => requestHelp('hint')} disabled={isHelping}>Give me a hint</button><button className="btn-secondary" onClick={() => requestHelp('explain')} disabled={isHelping}>Explain why</button><button className="btn-primary" onClick={() => requestHelp('repair')} disabled={isHelping}>{isHelping ? 'Preparing…' : 'Show repair'}</button></div>}
                  {isValid && <p className="valid-note">The rule detected: <strong>{selectedEdge.label}</strong></p>}
                  {!isInvalid && !isValid && <p className="scope-note">{scopeCopy(data.problem.mode)}</p>}
                </>
              )}
              {inspectorMode === 'hint' && <HelpPanel kind="hint" content={helpContent} back={() => setInspectorMode('evidence')} />}
              {inspectorMode === 'explain' && <HelpPanel kind="explain" content={helpContent} back={() => setInspectorMode('evidence')} />}
              {inspectorMode === 'repair' && <RepairPanel content={helpContent} nextStep={selectedNextStep} missingTerm={selectedEdge.verification?.likelyMissingTerm} repairLatex={repairLatex} isChecking={isChecking} onApply={applyRepair} onKeep={() => setInspectorMode('evidence')} />}
            </>
          ) : <div className="inspector-empty"><p>Select a transition to inspect its evidence.</p></div>}
        </aside>
      </main>
      {isProblemPickerOpen && <ProblemPicker problems={ProofService.getProblemLibrary()} isLoading={isLoadingProblem} onClose={() => setIsProblemPickerOpen(false)} onSelect={(problem) => loadProblem(problem)} onCustom={(problem) => loadProblem(problem, true)} />}
      <div className="sr-only" aria-live="polite">{announcement}</div>
      </>}
    </div>
  );
}

function EvidenceCard({ evidence, rule }) {
  if (evidence.kind === 'inequality-region') {
    return <InequalityNumberLine evidence={evidence} isValid={rule === 'inequality-region-preserved'} />;
  }
  if (evidence.kind === 'evaluation') {
    return (
      <section className="counterexample-card">
        <h3>Reality check: try {evidence.inputLatex}</h3>
        <div className="calc-table">
          <div className="calc-row"><span className="calc-label">Original</span><MathDisplay math={evidence.previous.leftLatex} className="calc-math" /><span className="calc-result">= {evidence.previous.rightValue}</span></div>
          <div className="calc-row"><span className="calc-label">Your step</span><MathDisplay math={evidence.next.leftLatex} className="calc-math" /><span className="calc-result">= {evidence.next.rightValue}</span></div>
        </div>
        <p className="calc-note">Because the results differ, this transition cannot be verified.</p>
      </section>
    );
  }
  if (evidence.kind === 'derivative-check') {
    const isIntegral = rule === 'indefinite-integral';
    return (
      <section className="counterexample-card">
        <h3>{isIntegral ? 'Antiderivative check' : 'Derivative check'}: try {evidence.inputLatex}</h3>
        <div className="calc-table">
          <div className="calc-row"><span className="calc-label">Expected</span><MathDisplay math={evidence.expectedLatex} className="calc-math" /><span className="calc-result">= {evidence.expectedValue}</span></div>
          <div className="calc-row"><span className="calc-label">{isIntegral ? 'Your result' : 'Your derivative'}</span><MathDisplay math={evidence.submittedLatex} className="calc-math" /><span className="calc-result">= {evidence.submittedValue}</span></div>
        </div>
      </section>
    );
  }
  if (evidence.kind === 'complex-comparison') {
    return (
      <section className="counterexample-card">
        <h3>Compare the real and imaginary parts</h3>
        <div className="calc-table">
          <div className="calc-row"><span className="calc-label">Expected</span><MathDisplay math={evidence.expectedLatex} className="calc-math" /></div>
          <div className="calc-row"><span className="calc-label">Your step</span><MathDisplay math={evidence.submittedLatex} className="calc-math" /></div>
          <div className="calc-row"><span className="calc-label">Difference</span><MathDisplay math={evidence.differenceLatex} className="calc-math" /></div>
        </div>
      </section>
    );
  }
  return (
    <section className="counterexample-card">
      <h3>Check every root</h3>
      <div className="evidence-line"><span>Expected:</span><MathDisplay math={`\\{${evidence.expectedSolutionsLatex.join(', ') }\\}`} className="inline-evidence-math" /></div>
      {evidence.missingSolutionsLatex.length > 0 && <div className="evidence-line"><span>Missing:</span><MathDisplay math={evidence.missingSolutionsLatex.join(', ')} className="inline-evidence-math" /></div>}
      {evidence.unexpectedSolutionsLatex.length > 0 && <div className="evidence-line"><span>Unexpected:</span><MathDisplay math={evidence.unexpectedSolutionsLatex.join(', ')} className="inline-evidence-math" /></div>}
    </section>
  );
}

function HelpPanel({ kind, content, back }) {
  const hint = kind === 'hint';
  return (
    <section className={hint ? 'hint-panel' : 'explain-panel'}>
      {hint ? <><span className="panel-eyebrow">{content?.title || 'A SMALL NUDGE'}</span><TeachingContent content={content?.question || content?.body} /></> : <><span className="panel-eyebrow">{content?.title || 'WHY THIS CHANGES'}</span><TeachingContent content={content?.body} /></>}
      <button className="btn-primary" onClick={back}>{hint ? 'I’ll try again' : 'Back to evidence'}</button>
    </section>
  );
}

function RepairPanel({ content, nextStep, missingTerm, repairLatex, isChecking, onApply, onKeep }) {
  return (
    <section className="repair-panel">
      <span className="panel-eyebrow">SUGGESTED REPAIR</span>
      <div className="diff-row"><span>Your step</span><MathDisplay math={nextStep?.math || ''} /></div>
      <div className="diff-row suggested"><span>Suggested</span>{repairLatex ? <MathDisplay math={repairLatex} /> : <span className="repair-unavailable">No repair candidate was returned.</span>}{missingTerm && <em>{missingTerm}</em>}</div>
      <TeachingContent content={content?.body || 'This is a draft. ProofLab will check it before updating your work.'} />
      <div className="repair-actions"><button className="btn-secondary" onClick={onKeep} disabled={isChecking}>Keep mine</button><button className="btn-primary" onClick={onApply} disabled={!repairLatex || isChecking}>{isChecking ? 'Checking…' : 'Apply and check'}</button></div>
    </section>
  );
}

function ProblemPicker({ problems, isLoading, onClose, onSelect, onCustom }) {
  const [custom, setCustom] = useState({ title: '', prompt: '', goal: '' });
  const [error, setError] = useState('');

  const submitCustom = (event) => {
    event.preventDefault();
    if (!custom.prompt.trim()) {
      setError('Start with an equation using x, such as 3x + 5 = 20.');
      return;
    }
    onCustom(custom);
  };

  return (
    <div className="problem-picker-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="problem-picker" role="dialog" aria-modal="true" aria-labelledby="problem-picker-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="picker-header"><div><span className="panel-eyebrow">PROBLEM LIBRARY</span><h2 id="problem-picker-title">Choose a starting point</h2></div><button className="icon-btn" onClick={onClose} aria-label="Close problem picker">×</button></div>
        <div className="example-grid">
          {problems.map((problem) => <button className="example-card" key={problem.id} onClick={() => onSelect(problem)} disabled={isLoading}><span>{problem.category}</span><strong>{problem.title}</strong><MathDisplay math={problem.prompt} /><small>{problem.goal}</small></button>)}
        </div>
        <form className="custom-problem-form" onSubmit={submitCustom}>
          <span className="panel-eyebrow">START YOUR OWN</span>
          <label>Problem name<input value={custom.title} onChange={(event) => setCustom((current) => ({ ...current, title: event.target.value }))} placeholder="e.g. My homework question" /></label>
          <label>Starting equation<EquationField value={custom.prompt} onChange={(value) => setCustom((current) => ({ ...current, prompt: value }))} ariaLabel="Starting equation" /></label>
          <label>What are you trying to do?<input value={custom.goal} onChange={(event) => setCustom((current) => ({ ...current, goal: event.target.value }))} placeholder="e.g. Find every value of x" /></label>
          {error && <p className="form-error">{error}</p>}
          <div className="picker-actions"><button type="button" className="btn-text" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={isLoading}>{isLoading ? 'Loading…' : 'Start problem'}</button></div>
        </form>
      </section>
    </div>
  );
}
