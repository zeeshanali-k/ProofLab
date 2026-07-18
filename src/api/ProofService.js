// The client only talks to Next.js routes. Problems are local learning prompts;
// every transition is still verified by /api/verify before it is trusted.
export const ENV_MODE = 'API-backed demo';

const PROBLEM_LIBRARY = [
  {
    id: 'missing-middle-term',
    title: 'The missing middle term',
    category: 'Quadratics',
    prompt: '(x + 2)^2 = 25',
    goal: 'Expand the square without losing a term.',
    seedSteps: ['x^2 + 4 = 25'],
  },
  {
    id: 'linear-balance',
    title: 'Keep both sides balanced',
    category: 'Linear equations',
    prompt: '3x + 5 = 20',
    goal: 'Isolate x using the same operation on both sides.',
    seedSteps: ['3x = 15', 'x = 5'],
  },
  {
    id: 'negative-square',
    title: 'A negative cross term',
    category: 'Quadratics',
    prompt: '(x - 3)^2 = 16',
    goal: 'Notice what changes when a binomial is squared.',
    seedSteps: ['x^2 + 9 = 16'],
  },
  {
    id: 'quadratic-solution-check',
    title: 'Test a proposed solution',
    category: 'Quadratics',
    prompt: 'x^2 - 5x + 6 = 0',
    goal: 'Rearrange, then test a value by substitution.',
    seedSteps: ['x^2 - 5x = -6', 'x = 2'],
  },
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const leftSide = (equation) => equation.split('=')[0]?.trim() || equation;
const atValue = (equation, value) => leftSide(equation).replaceAll('x', `(${value})`);

const edgeFromResult = (result, previousStep, nextStep) => {
  const title = result.status === 'valid'
    ? 'This step preserves the equation'
    : result.status === 'invalid'
      ? 'This transition changes the equation'
      : 'This step needs rechecking';
  const counterexample = result.counterexample;

  return {
    status: result.status,
    label: result.rule === 'expand-square'
      ? 'expanded square'
      : result.rule === 'balance-operation'
        ? 'balanced both sides'
        : result.rule === 'solution-substitution'
          ? 'tested by substitution'
          : result.status === 'invalid'
            ? result.likelyMissingTerm ? 'missing term' : 'not equivalent'
            : result.status === 'valid' ? 'equivalent' : 'needs rechecking',
    verification: result,
    inspectorData: {
      title,
      finding: result.summary,
      realityCheck: counterexample ? {
        testValue: `x = ${counterexample.value}`,
        originalMath: atValue(previousStep.math, counterexample.value),
        originalResult: String(counterexample.previousLeft),
        stepMath: atValue(nextStep.math, counterexample.value),
        stepResult: String(counterexample.nextLeft),
      } : undefined,
    },
  };
};

async function requestJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'The ProofLab service is unavailable.');
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
      { id: `${problem.id}-s1`, type: 'GIVEN', math: problem.prompt, status: 'root', timestamp: 'Given' },
      ...(problem.seedSteps ?? []).map((math, index) => ({
        id: `${problem.id}-s${index + 2}`,
        type: `STEP ${index + 2}`,
        math,
        status: 'checking',
        timestamp: 'Checking',
      })),
    ];
    const edges = [];

    for (let index = 1; index < steps.length; index += 1) {
      const edge = await this.verifyStep(steps[index - 1], steps[index]);
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
      prompt: prompt.trim(),
      goal: goal.trim() || 'Build a sequence of equivalent equations.',
      seedSteps: [],
      isCustom: true,
    });
  },

  async verifyStep(previousStep, nextStep) {
    const result = await requestJson('/api/verify', {
      previousStep: { id: previousStep.id, latex: previousStep.math },
      nextStep: { id: nextStep.id, latex: nextStep.math },
    });
    return edgeFromResult(result, previousStep, nextStep);
  },

  async explain(previousStep, nextStep, verification, mode) {
    return requestJson('/api/explain', {
      previousStep: previousStep.math,
      nextStep: nextStep.math,
      verification,
      mode,
    });
  },
};
