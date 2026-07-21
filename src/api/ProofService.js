// The browser talks directly to the single FastAPI backend. It never receives
// symbolic-engine, curriculum-template, or teaching-provider credentials.
export const ENV_MODE = 'Python API';

const API_BASE_URL = (process.env.NEXT_PUBLIC_PROOFLAB_API_URL || 'http://localhost:8000').replace(/\/+$/, '');

const clone = (value) => JSON.parse(JSON.stringify(value));

const titleFor = (result) => {
  if (result.status === 'valid') return 'This step is verified';
  if (result.status === 'invalid' && result.rule === 'inequality-sign-flip') return 'Reverse the inequality sign';
  if (result.status === 'invalid' && result.rule === 'derivative-order') return 'Advance the derivative order';
  if (result.status === 'invalid') return 'This transition needs repair';
  return 'This step needs rechecking';
};

const labelFor = (result) => {
  if (result.status === 'invalid' && result.rule === 'inequality-sign-flip') return 'sign did not flip';
  if (result.status === 'invalid' && result.rule === 'inequality-region-mismatch') return 'solution region changed';
  if (result.status === 'invalid' && result.rule === 'complex-solution-set') return 'incomplete solution set';
  if (result.status === 'invalid' && result.rule === 'derivative-order') return 'advance derivative order';
  if (result.status === 'invalid' && ['differentiate-polynomial', 'differentiate-trigonometric'].includes(result.rule)) return 'incorrect derivative';
  if (result.status === 'invalid' && result.rule === 'indefinite-integral') return 'incorrect antiderivative';
  if (result.status === 'invalid' && result.rule === 'complex-simplification') return 'different complex value';
  const labels = {
    'expand-square': 'expanded square',
    'balance-operation': 'balanced both sides',
    'solution-substitution': 'tested by substitution',
    'equivalent-rearrangement': 'equivalent',
    'inequality-region-preserved': 'solution region preserved',
    'differentiate-polynomial': 'correct derivative',
    'differentiate-trigonometric': 'correct trig derivative',
    'indefinite-integral': 'valid antiderivative',
    'complex-simplification': 'complex expression simplified',
    'complex-solution-set': 'solution set complete',
  };
  if (result.rule && labels[result.rule]) return labels[result.rule];
  if (result.status === 'invalid') return result.likelyMissingTerm ? 'missing term' : 'not verified';
  return 'needs rechecking';
};

const mistakePatternFor = (result) => {
  if (result.status !== 'invalid') return null;
  if (result.rule === 'inequality-sign-flip') return 'Sign did not flip';
  if (result.rule === 'equivalent-rearrangement' && result.likelyMissingTerm) return 'Middle term dropped';
  if (result.rule === 'differentiate-trigonometric') return 'Chain rule missed';
  if (result.rule === 'indefinite-integral' && !result.evidence) return 'Constant of integration missing';
  if (
    result.rule === 'complex-solution-set'
    && result.evidence?.missingSolutionsLatex?.length === 1
    && result.evidence?.unexpectedSolutionsLatex?.length === 0
  ) return 'One complex root missing';
  return null;
};

const edgeFromResult = (result, previousStep, nextStep) => ({
  status: result.status,
  label: labelFor(result),
  verification: result,
  inspectorData: {
    title: titleFor(result),
    finding: result.summary,
    evidence: result.evidence,
    mistakePattern: mistakePatternFor(result),
    previousStep,
    nextStep,
  },
});

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, { credentials: 'include', ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.detail || 'The ProofLab service is unavailable.');
  return body;
}

async function requestJson(path, payload) {
  return request(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

async function fetchProblemLibrary() {
  const catalog = await request('/curriculum');
  const nodeIds = catalog.nodes
    .filter((node) => node.missionIds.length > 0)
    .map((node) => node.id);
  const details = await Promise.all(nodeIds.map((nodeId) => request(`/curriculum/${encodeURIComponent(nodeId)}`)));
  const missions = details.flatMap((node) => node.missions);
  if (!missions.length) throw new Error('The curriculum has no Guided ProofLab missions yet.');
  return clone(missions);
}

export const ProofService = {
  getProblemLibrary() {
    return fetchProblemLibrary();
  },

  async fetchInitialState() {
    const problemLibrary = await this.getProblemLibrary();
    const initialProblem = problemLibrary.find((problem) => problem.id === 'missing-middle-term') ?? problemLibrary[0];
    const board = await this.loadProblem(initialProblem);
    return { ...board, problemLibrary };
  },

  async loadProblem(definition) {
    const problem = clone(definition);
    const steps = [
      { id: `${problem.id}-s1`, type: 'GIVEN', math: problem.prompt, kind: problem.rootKind, status: 'root', timestamp: 'Given' },
      ...(problem.seedSteps ?? []).map((seed, index) => ({
        id: `${problem.id}-s${index + 2}`,
        type: `STEP ${index + 2}`,
        math: seed.math,
        kind: seed.kind,
        status: 'checking',
        timestamp: 'Checking',
      })),
    ];
    const edges = [];

    for (let index = 1; index < steps.length; index += 1) {
      const edge = await this.verifyStep(steps[index - 1], steps[index], problem.mode);
      steps[index].status = edge.status;
      steps[index].timestamp = edge.status === 'valid' ? 'Checked' : edge.status === 'invalid' ? 'First check' : 'Needs rechecking';
      edges.push({ ...edge, id: `${problem.id}-e${index}`, from: steps[index - 1].id, to: steps[index].id });
    }

    return { problem, steps, edges, completionStatus: await this.assessCompletion(problem, steps) };
  },

  createCustomProblem({ title, prompt, goal }) {
    return this.loadProblem({
      id: `custom-${Date.now()}`,
      title: title.trim() || 'My algebra problem',
      category: 'Your problem',
      mode: 'algebra',
      rootKind: 'equation',
      prompt: prompt.trim(),
      goal: goal.trim() || 'Build a sequence of equivalent equations.',
      seedSteps: [],
      isCustom: true,
    });
  },

  async verifyStep(previousStep, nextStep, mode, activityId = null) {
    const result = await requestJson('/verify', {
      mode,
      previousStep: { id: previousStep.id, latex: previousStep.math, kind: previousStep.kind },
      nextStep: { id: nextStep.id, latex: nextStep.math, kind: nextStep.kind },
      ...(activityId ? { activityId } : {}),
    });
    return edgeFromResult(result, previousStep, nextStep);
  },

  async assessCompletion(problem, steps, recordProgress = false) {
    if (!problem.canonicalGoal) return 'not-applicable';
    const learnerSteps = steps.slice(1);
    if (!learnerSteps.length) return 'in-progress';
    const result = await requestJson('/assess-completion', {
      mode: problem.mode,
      givenStep: { id: steps[0].id, latex: steps[0].math, kind: steps[0].kind },
      terminalLearnerStep: { id: learnerSteps.at(-1).id, latex: learnerSteps.at(-1).math, kind: learnerSteps.at(-1).kind },
      learnerSteps: learnerSteps.map((step) => ({ id: step.id, latex: step.math, kind: step.kind })),
      canonicalGoal: problem.canonicalGoal,
      ...(recordProgress && !problem.isCustom ? { activityId: problem.id } : {}),
    });
    return result.status;
  },

  revealFinalForm(problem, givenStep) {
    return requestJson('/reveal-final-form', {
      mode: problem.mode,
      givenStep: { id: givenStep.id, latex: givenStep.math, kind: givenStep.kind },
      canonicalGoal: problem.canonicalGoal,
    });
  },

  explain(previousStep, nextStep, verification, mode) {
    return requestJson('/explain', {
      previousStep: previousStep.math,
      nextStep: nextStep.math,
      verification,
      mode,
    });
  },
};
