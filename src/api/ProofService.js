// The browser talks directly to the single FastAPI backend. It never receives
// symbolic-engine or teaching-provider credentials.
export const ENV_MODE = 'Python API';

const API_BASE_URL = (process.env.NEXT_PUBLIC_PROOFLAB_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');

const PROBLEM_LIBRARY = [
  {
    id: 'missing-middle-term',
    title: 'The missing middle term',
    category: 'Quadratics',
    mode: 'algebra',
    rootKind: 'equation',
    prompt: '(x + 2)^2 = 25',
    goal: 'Expand the square without losing a term.',
    seedSteps: [{ math: 'x^2 + 4 = 25', kind: 'equation' }],
  },
  {
    id: 'linear-balance',
    title: 'Keep both sides balanced',
    category: 'Linear equations',
    mode: 'algebra',
    rootKind: 'equation',
    prompt: '3x + 5 = 20',
    goal: 'Isolate x using the same operation on both sides.',
    seedSteps: [{ math: '3x = 15', kind: 'equation' }, { math: 'x = 5', kind: 'equation' }],
  },
  {
    id: 'negative-square',
    title: 'A negative cross term',
    category: 'Quadratics',
    mode: 'algebra',
    rootKind: 'equation',
    prompt: '(x - 3)^2 = 16',
    goal: 'Notice what changes when a binomial is squared.',
    seedSteps: [{ math: 'x^2 + 9 = 16', kind: 'equation' }],
  },
  {
    id: 'quadratic-solution-check',
    title: 'Test a proposed solution',
    category: 'Quadratics',
    mode: 'algebra',
    rootKind: 'equation',
    prompt: 'x^2 - 5x + 6 = 0',
    goal: 'Rearrange, then test a value by substitution.',
    seedSteps: [{ math: 'x^2 - 5x = -6', kind: 'equation' }, { math: 'x = 2', kind: 'equation' }],
  },
  {
    id: 'polynomial-derivative',
    title: 'Differentiate a polynomial',
    category: 'Calculus',
    mode: 'derivative',
    rootKind: 'function',
    prompt: 'f(x) = x^3 + 2x',
    goal: 'Use the power rule to find the derivative.',
    seedSteps: [{ math: "f'(x) = 3x + 2", kind: 'derivative' }],
  },
  {
    id: 'complex-product',
    title: 'Multiply complex numbers',
    category: 'Complex numbers',
    mode: 'complex-simplify',
    rootKind: 'expression',
    prompt: '(2 + 3i)(1 - 2i)',
    goal: 'Simplify into a + bi form.',
    seedSteps: [{ math: '8 + i', kind: 'expression' }],
  },
  {
    id: 'complex-roots',
    title: 'Find both imaginary roots',
    category: 'Complex equations',
    mode: 'complex-solve',
    rootKind: 'equation',
    prompt: 'x^2 + 4 = 0',
    goal: 'Enter every solution in the complex solution set.',
    seedSteps: [{ math: '\\{2i\\}', kind: 'solution-set' }],
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));

const titleFor = (result) => {
  if (result.status === 'valid') return 'This step is verified';
  if (result.status === 'invalid') return 'This transition needs repair';
  return 'This step needs rechecking';
};

const labelFor = (result) => {
  if (result.status === 'invalid' && result.rule === 'complex-solution-set') return 'incomplete solution set';
  if (result.status === 'invalid' && result.rule === 'differentiate-polynomial') return 'incorrect derivative';
  if (result.status === 'invalid' && result.rule === 'complex-simplification') return 'different complex value';
  const labels = {
    'expand-square': 'expanded square',
    'balance-operation': 'balanced both sides',
    'solution-substitution': 'tested by substitution',
    'equivalent-rearrangement': 'equivalent',
    'differentiate-polynomial': 'correct derivative',
    'complex-simplification': 'complex expression simplified',
    'complex-solution-set': 'solution set complete',
  };
  if (result.rule && labels[result.rule]) return labels[result.rule];
  if (result.status === 'invalid') return result.likelyMissingTerm ? 'missing term' : 'not verified';
  return 'needs rechecking';
};

const edgeFromResult = (result, previousStep, nextStep) => ({
  status: result.status,
  label: labelFor(result),
  verification: result,
  inspectorData: {
    title: titleFor(result),
    finding: result.summary,
    evidence: result.evidence,
    previousStep,
    nextStep,
  },
});

async function requestJson(path, payload) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.detail || 'The ProofLab service is unavailable.');
  return body;
}

const definitionFor = (id) => PROBLEM_LIBRARY.find((problem) => problem.id === id);

export const ProofService = {
  getProblemLibrary() {
    return clone(PROBLEM_LIBRARY);
  },

  async fetchInitialState() {
    return this.loadProblem(definitionFor('missing-middle-term'));
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

    return { problem, steps, edges };
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

  async verifyStep(previousStep, nextStep, mode) {
    const result = await requestJson('/verify', {
      mode,
      previousStep: { id: previousStep.id, latex: previousStep.math, kind: previousStep.kind },
      nextStep: { id: nextStep.id, latex: nextStep.math, kind: nextStep.kind },
    });
    return edgeFromResult(result, previousStep, nextStep);
  },

  async explain(previousStep, nextStep, verification, mode) {
    return requestJson('/explain', {
      previousStep: previousStep.math,
      nextStep: nextStep.math,
      verification,
      mode,
    });
  },
};
