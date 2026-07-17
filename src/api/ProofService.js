// This UI branch deliberately keeps a client-side adapter. The API branch
// swaps its implementation without changing the board's calling contract.
export const ENV_MODE = 'Local demo';

const MOCK_STATE = {
  problem: {
    prompt: '(x + 2)^2 = 25',
    goal: 'Find all values of x',
    progress: '2 of 4 steps checked',
  },
  steps: [
    { id: 's1', type: 'GIVEN', math: '(x + 2)^2 = 25', status: 'root', timestamp: 'Given' },
    { id: 's2', type: 'STEP 2', math: 'x^2 + 4 = 25', status: 'invalid', timestamp: 'First check' },
  ],
  edges: [
    {
      id: 'e1',
      from: 's1',
      to: 's2',
      status: 'invalid',
      label: 'missing term',
      inspectorData: {
        title: 'This transition changes the equation',
        finding: 'The expanded expression is missing a term.',
        realityCheck: {
          testValue: 'x = 3',
          originalMath: '(3 + 2)^2',
          originalResult: '25',
          stepMath: '3^2 + 4',
          stepResult: '13',
        },
      },
    },
  ],
};

const clone = (value) => JSON.parse(JSON.stringify(value));
const compact = (value) => value.replaceAll(' ', '').replaceAll('\\left', '').replaceAll('\\right', '');

export const ProofService = {
  async fetchInitialState() {
    return clone(MOCK_STATE);
  },

  async verifyStep(previousStepMath, newStepMath) {
    await new Promise((resolve) => window.setTimeout(resolve, 460));
    const previous = compact(previousStepMath);
    const next = compact(newStepMath);

    if (previous === '(x+2)^2=25' && next === 'x^2+4=25') {
      return clone(MOCK_STATE.edges[0]);
    }

    if (
      (previous === '(x+2)^2=25' && next === 'x^2+4x+4=25') ||
      (previous === 'x^2+4x+4=25' && next === 'x^2+4x-21=0')
    ) {
      return {
        status: 'valid',
        label: previous.includes('(x+2)') ? 'expanded square' : 'subtracted 25 from both sides',
        inspectorData: {
          title: 'This step preserves the equation',
          finding: previous.includes('(x+2)')
            ? 'Nice—every term from the square is present.'
            : 'Nice—both sides were reduced by 25.',
        },
      };
    }

    return {
      status: 'inconclusive',
      label: 'needs rechecking',
      inspectorData: {
        title: 'This step needs rechecking',
        finding: 'The local demo can only check the seeded quadratic transformations. The API verifier will cover the full MVP scope.',
      },
    };
  },
};
