// Toggle this to 'PROD' to route calls to your real backend
export const ENV_MODE = 'DEV'; 

const MOCK_STATE = {
  problem: {
    prompt: "(x + 2)^2 = 25",
    goal: "Find all values of x",
    progress: "2 of 4 steps checked"
  },
  steps: [
    { id: 's1', type: 'GIVEN', math: "(x + 2)^2 = 25", status: 'valid', timestamp: 'Just now' },
    { id: 's2', type: 'STEP 2', math: "x^2 + 4 = 25", status: 'invalid', timestamp: 'Editing' }
  ],
  edges: [
    { 
      id: 'e1', 
      from: 's1', 
      to: 's2', 
      status: 'invalid', 
      label: 'not equivalent',
      inspectorData: {
        title: "This transition changes the equation",
        finding: "The expanded expression is missing a term.",
        realityCheck: {
          testValue: "x = 3",
          originalMath: "(3 + 2)^2",
          originalResult: "25",
          stepMath: "3^2 + 4",
          stepResult: "13"
        }
      }
    }
  ]
};

export const ProofService = {
  async fetchInitialState() {
    if (ENV_MODE === 'DEV') {
      return Promise.resolve(MOCK_STATE);
    }
    // PROD: Replace with your actual backend endpoint
    const response = await fetch('/api/proofs/current');
    return response.json();
  },

  async verifyStep(previousStepMath, newStepMath) {
    if (ENV_MODE === 'DEV') {
      // Simulate network delay and mock a validation response
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            status: 'valid',
            label: 'equivalent',
            inspectorData: { title: "This step preserves the equation" }
          });
        }, 600);
      });
    }
    // PROD: Route to symbolic engine/backend
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ previousStepMath, newStepMath })
    });
    return response.json();
  }
};