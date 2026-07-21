import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProofService } from '@/src/api/ProofService';

const algebraNode = 'algebra.symbolic-reasoning';
const inequalityNode = 'algebra.inequalities';
const derivativeNode = 'calculus.derivatives';
const integralNode = 'calculus.integrals';
const complexSimplificationNode = 'complex-numbers.simplification';
const complexSolutionsNode = 'complex-numbers.solutions';

const mission = (id: string, nodeId: string, overrides = {}) => ({
  id,
  title: id,
  category: 'Math',
  mode: 'algebra',
  rootKind: 'equation',
  prompt: 'x = 1',
  goal: 'Check the next step.',
  seedSteps: [],
  curriculumNodeId: nodeId,
  allowedExperiences: ['guided-prooflab'],
  ...overrides,
});

const missionsByNode = {
  [algebraNode]: [
    mission('missing-middle-term', algebraNode, { prompt: '(x + 2)^2 = 25', seedSteps: [{ math: 'x^2 + 4 = 25', kind: 'equation' }] }),
    mission('linear-balance', algebraNode, { prompt: '3x + 5 = 20', seedSteps: [{ math: '3x = 15', kind: 'equation' }, { math: 'x = 5', kind: 'equation' }] }),
    mission('negative-square', algebraNode), mission('quadratic-solution-check', algebraNode), mission('factor-then-solve', algebraNode),
  ],
  [inequalityNode]: [mission('inequality-sign-flip', inequalityNode, { mode: 'inequality', rootKind: 'inequality', prompt: '-2x + 3 > 7', canonicalGoal: { kind: 'inequality' }, seedSteps: [{ math: '-2x > 4', kind: 'inequality' }, { math: 'x > -2', kind: 'inequality' }] })],
  [derivativeNode]: [
    mission('polynomial-derivative', derivativeNode, { mode: 'derivative', rootKind: 'function', prompt: 'f(x) = x^3 + 2x', canonicalGoal: { kind: 'derivative', terminalDerivativeOrder: 1 }, seedSteps: [{ math: "f'(x) = 3x^2 + 2", kind: 'derivative' }] }),
    mission('trig-chain-derivative', derivativeNode), mission('product-rule-derivative', derivativeNode), mission('repeated-derivative', derivativeNode),
  ],
  [integralNode]: [
    mission('indefinite-integral', integralNode, { mode: 'integral', rootKind: 'expression', prompt: '\\int 3x^2 + \\cos(2x + 1)\\, dx' }),
    mission('missing-integration-constant', integralNode),
  ],
  [complexSimplificationNode]: [mission('complex-product', complexSimplificationNode, { mode: 'complex-simplify', rootKind: 'expression', canonicalGoal: { kind: 'complex-simplify' } })],
  [complexSolutionsNode]: [
    mission('complex-roots', complexSolutionsNode, { mode: 'complex-solve', rootKind: 'equation', prompt: 'x^2 + 4 = 0', canonicalGoal: { kind: 'complex-solve' }, seedSteps: [{ math: '\\{2i\\}', kind: 'solution-set' }] }),
    mission('complex-complete-roots', complexSolutionsNode),
  ],
};

function curriculumFetch(apiResponse = () => new Response(JSON.stringify({}), { status: 200 })) {
  return vi.fn((input: string | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith('/curriculum')) {
      return Promise.resolve(new Response(JSON.stringify({
        nodes: Object.entries(missionsByNode).map(([id, missions]) => ({ id, missionIds: missions.map((item) => item.id) })),
      }), { status: 200 }));
    }
    const nodeId = Object.keys(missionsByNode).find((id) => url.endsWith(`/curriculum/${id}`));
    if (nodeId) return Promise.resolve(new Response(JSON.stringify({ missions: missionsByNode[nodeId as keyof typeof missionsByNode] }), { status: 200 }));
    return Promise.resolve(apiResponse(url, init));
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('server-owned guided problem library', () => {
  it('loads the diverse reusable starting problems from the curriculum API', async () => {
    const fetchMock = curriculumFetch();
    vi.stubGlobal('fetch', fetchMock);

    expect((await ProofService.getProblemLibrary()).map((problem) => problem.id)).toEqual([
      'missing-middle-term', 'linear-balance', 'negative-square', 'quadratic-solution-check', 'factor-then-solve',
      'inequality-sign-flip', 'polynomial-derivative', 'trig-chain-derivative', 'product-rule-derivative', 'repeated-derivative',
      'indefinite-integral', 'missing-integration-constant', 'complex-product', 'complex-roots', 'complex-complete-roots',
    ]);
    expect(fetchMock.mock.calls.filter(([url]) => String(url).includes('/curriculum')).length).toBe(7);
  });

  it('starts a learner-defined problem with only the given equation', async () => {
    const board = await ProofService.createCustomProblem({ title: 'Homework 4', prompt: '4x - 1 = 11', goal: 'Solve for x' });
    expect(board.problem).toMatchObject({ title: 'Homework 4', prompt: '4x - 1 = 11', isCustom: true });
    expect(board.steps).toHaveLength(1);
    expect(board.edges).toHaveLength(0);
  });

  it('verifies every seeded transition while loading an example', async () => {
    const fetchMock = curriculumFetch(() => new Response(JSON.stringify({ status: 'valid', rule: 'balance-operation', summary: 'Both sides were changed by the same amount.' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const linear = (await ProofService.getProblemLibrary()).find((problem) => problem.id === 'linear-balance');
    const board = await ProofService.loadProblem(linear);
    const verificationCalls = fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/verify'));
    expect(verificationCalls).toHaveLength(2);
    expect(board.steps.map((step) => step.status)).toEqual(['root', 'valid', 'valid']);
    expect(JSON.parse(verificationCalls[0][1]?.body as string)).toMatchObject({ mode: 'algebra', previousStep: { kind: 'equation' }, nextStep: { kind: 'equation' } });
  });

  it('uses task-scoped claim kinds for complex solution sets', async () => {
    const fetchMock = curriculumFetch((url) => new Response(JSON.stringify(
      url.endsWith('/verify')
        ? { status: 'invalid', rule: 'complex-solution-set', summary: 'A root is missing.', evidence: { kind: 'solution-set', expectedSolutionsLatex: ['2 i', '- 2 i'], submittedSolutionsLatex: ['2 i'], missingSolutionsLatex: ['- 2 i'], unexpectedSolutionsLatex: [] }, verifiedRepairLatex: '\\{2 i, - 2 i\\}' }
        : { status: 'needs-correction' },
    ), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const problem = (await ProofService.getProblemLibrary()).find((candidate) => candidate.id === 'complex-roots');
    const board = await ProofService.loadProblem(problem);
    expect(board.edges[0].label).toBe('incomplete solution set');
    expect(board.completionStatus).toBe('needs-correction');
    const verificationCall = fetchMock.mock.calls.find(([url]) => String(url).endsWith('/verify'));
    expect(JSON.parse(verificationCall?.[1]?.body as string)).toMatchObject({ mode: 'complex-solve', previousStep: { kind: 'equation' }, nextStep: { kind: 'solution-set' } });
  });

  it('does not assess or reveal a final form for an open-ended integration task', async () => {
    const fetchMock = curriculumFetch();
    vi.stubGlobal('fetch', fetchMock);
    const integration = (await ProofService.getProblemLibrary()).find((problem) => problem.id === 'indefinite-integral');
    const board = await ProofService.loadProblem(integration);

    expect(board.completionStatus).toBe('not-applicable');
    expect(board.problem.canonicalGoal).toBeUndefined();
  });

  it('sends canonical goal metadata only to the completion and reveal endpoints', async () => {
    const fetchMock = curriculumFetch((url) => new Response(JSON.stringify(
      url.endsWith('/assess-completion') ? { status: 'complete' } : { canonicalLatex: "f'(x) = 3x^2 + 2" },
    ), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const problem = (await ProofService.getProblemLibrary()).find((candidate) => candidate.id === 'polynomial-derivative');
    const steps = [{ id: 's1', math: problem.prompt, kind: problem.rootKind }, { id: 's2', math: "f'(x) = 3x^2 + 2", kind: 'derivative' }];
    expect(await ProofService.assessCompletion(problem, steps)).toBe('complete');
    expect(await ProofService.revealFinalForm(problem, steps[0])).toEqual({ canonicalLatex: "f'(x) = 3x^2 + 2" });
    const apiCalls = fetchMock.mock.calls.filter(([url]) => !String(url).includes('/curriculum'));
    expect(apiCalls.map(([url]) => url)).toEqual(['http://localhost:8000/assess-completion', 'http://localhost:8000/reveal-final-form']);
    expect(JSON.parse(apiCalls[0][1]?.body as string)).toMatchObject({ canonicalGoal: { terminalDerivativeOrder: 1 } });
  });
});

describe('verification response mapping', () => {
  it('labels derivative-order feedback as a correction instead of a recheck', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'invalid', rule: 'derivative-order', summary: "After f'(x), the next derivative must be f''(x), not f'(x)." }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const edge = await ProofService.verifyStep({ id: 's2', math: "f'(x) = 6x\\cos(3x^2 + 1)", kind: 'derivative' }, { id: 's3', math: "f'(x) = 36x\\sin(3x^2 + 1)", kind: 'derivative' }, 'derivative');
    expect(edge.status).toBe('invalid');
    expect(edge.label).toBe('advance derivative order');
    expect(edge.inspectorData.title).toBe('Advance the derivative order');
  });

  it('exposes server-backed inequality number-line evidence', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: 'invalid', rule: 'inequality-sign-flip', summary: 'Dividing by a negative reverses the inequality sign.', evidence: { kind: 'inequality-region', previousRegion: { boundaryLatex: '-2', direction: 'left', inclusive: false }, submittedRegion: { boundaryLatex: '-2', direction: 'right', inclusive: false }, testValueLatex: '0', previousIncludesTest: false, submittedIncludesTest: true, numberLine: { previousBoundaryPosition: 35, submittedBoundaryPosition: 35, testValuePosition: 75 } }, verifiedRepairLatex: 'x < -2' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);
    const edge = await ProofService.verifyStep({ id: 's2', math: '-2x > 4', kind: 'inequality' }, { id: 's3', math: 'x > -2', kind: 'inequality' }, 'inequality');
    expect(edge.label).toBe('sign did not flip');
    expect(edge.inspectorData.mistakePattern).toBe('Sign did not flip');
    expect(edge.inspectorData.evidence.testValueLatex).toBe('0');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ mode: 'inequality', previousStep: { kind: 'inequality' }, nextStep: { kind: 'inequality' } });
  });

  it('maps deterministic verifier details to compact mistake patterns', async () => {
    const cases = [
      [{ status: 'invalid', rule: 'equivalent-rearrangement', summary: 'Missing term.', likelyMissingTerm: '4 x' }, 'Middle term dropped'],
      [{ status: 'invalid', rule: 'differentiate-trigonometric', summary: 'Incorrect derivative.' }, 'Chain rule missed'],
      [{ status: 'invalid', rule: 'indefinite-integral', summary: 'Include + C.' }, 'Constant of integration missing'],
      [{ status: 'invalid', rule: 'complex-solution-set', summary: 'Missing root.', evidence: { kind: 'solution-set', missingSolutionsLatex: ['- 2 i'], unexpectedSolutionsLatex: [] } }, 'One complex root missing'],
    ];
    let requestIndex = 0;
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify(cases[requestIndex++][0]), { status: 200 })));
    vi.stubGlobal('fetch', fetchMock);

    for (const [, expected] of cases) {
      const edge = await ProofService.verifyStep({ id: 's1', math: 'x = 1', kind: 'equation' }, { id: 's2', math: 'x = 2', kind: 'equation' }, 'algebra');
      expect(edge.inspectorData.mistakePattern).toBe(expected);
    }
  });
});
