// The client only talks to these Next.js routes. The route selects Math.js for
// the MVP or the future private Python adapter through VERIFIER_PROVIDER.
export const ENV_MODE = 'API-backed demo';

const INITIAL_STEPS = [
  { id: 's1', type: 'GIVEN', math: '(x + 2)^2 = 25', status: 'root', timestamp: 'Given' },
  { id: 's2', type: 'STEP 2', math: 'x^2 + 4 = 25', status: 'invalid', timestamp: 'First check' },
];

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
        : result.status === 'invalid'
          ? result.likelyMissingTerm ? 'missing term' : 'not equivalent'
          : result.status === 'valid' ? 'equivalent' : 'needs rechecking',
    verification: result,
    inspectorData: {
      title,
      finding: result.summary,
      realityCheck: counterexample ? {
        testValue: `x = ${counterexample.value}`,
        originalMath: atValue(previousStep.latex, counterexample.value),
        originalResult: String(counterexample.previousLeft),
        stepMath: atValue(nextStep.latex, counterexample.value),
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

export const ProofService = {
  async fetchInitialState() {
    const [previousStep, nextStep] = INITIAL_STEPS;
    const initialEdge = await this.verifyStep(previousStep, nextStep);
    return { problem: { prompt: previousStep.math, goal: 'Find all values of x', progress: '2 of 4 steps checked' }, steps: INITIAL_STEPS, edges: [{ ...initialEdge, id: 'e1', from: previousStep.id, to: nextStep.id }] };
  },

  async verifyStep(previousStep, nextStep) {
    const result = await requestJson('/api/verify', {
      previousStep: { id: previousStep.id, latex: previousStep.math },
      nextStep: { id: nextStep.id, latex: nextStep.math },
    });
    return edgeFromResult(result, { latex: previousStep.math }, { latex: nextStep.math });
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
