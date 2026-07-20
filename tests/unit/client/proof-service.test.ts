import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProofService } from '@/src/api/ProofService';

afterEach(() => vi.unstubAllGlobals());

describe('problem library', () => {
  it('offers diverse reusable starting problems', () => {
    expect(ProofService.getProblemLibrary().map((problem) => problem.id)).toEqual([
      'missing-middle-term',
      'linear-balance',
      'inequality-sign-flip',
      'negative-square',
      'quadratic-solution-check',
      'factor-then-solve',
      'polynomial-derivative',
      'trig-chain-derivative',
      'product-rule-derivative',
      'repeated-derivative',
      'indefinite-integral',
      'missing-integration-constant',
      'complex-product',
      'complex-roots',
      'complex-complete-roots',
    ]);
  });

  it('starts a learner-defined problem with only the given equation', async () => {
    const board = await ProofService.createCustomProblem({
      title: 'Homework 4',
      prompt: '4x - 1 = 11',
      goal: 'Solve for x',
    });
    expect(board.problem).toMatchObject({ title: 'Homework 4', prompt: '4x - 1 = 11', isCustom: true });
    expect(board.steps).toHaveLength(1);
    expect(board.edges).toHaveLength(0);
  });

  it('verifies every seeded transition while loading an example', async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify({
      status: 'valid', rule: 'balance-operation', summary: 'Both sides were changed by the same amount.',
    }), { status: 200 })));
    vi.stubGlobal('fetch', fetchMock);

    const linear = ProofService.getProblemLibrary().find((problem) => problem.id === 'linear-balance');
    const board = await ProofService.loadProblem(linear);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(board.steps.map((step) => step.status)).toEqual(['root', 'valid', 'valid']);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      mode: 'algebra',
      previousStep: { kind: 'equation' },
      nextStep: { kind: 'equation' },
    });
  });

  it('uses task-scoped claim kinds for complex solution sets', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        status: 'invalid', rule: 'complex-solution-set', summary: 'A root is missing.', evidence: {
          kind: 'solution-set', expectedSolutionsLatex: ['2 i', '- 2 i'], submittedSolutionsLatex: ['2 i'], missingSolutionsLatex: ['- 2 i'], unexpectedSolutionsLatex: [],
        }, verifiedRepairLatex: '\\{2 i, - 2 i\\}',
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'needs-correction' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const problem = ProofService.getProblemLibrary().find((candidate) => candidate.id === 'complex-roots');
    const board = await ProofService.loadProblem(problem);
    expect(board.edges[0].label).toBe('incomplete solution set');
    expect(board.completionStatus).toBe('needs-correction');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      mode: 'complex-solve',
      previousStep: { kind: 'equation' },
      nextStep: { kind: 'solution-set' },
    });
  });

  it('does not assess or reveal a final form for an open-ended integration task', async () => {
    const integration = ProofService.getProblemLibrary().find((problem) => problem.id === 'indefinite-integral');
    const board = await ProofService.loadProblem(integration);

    expect(board.completionStatus).toBe('not-applicable');
    expect(board.problem.canonicalGoal).toBeUndefined();
  });

  it('sends canonical goal metadata only to the completion and reveal endpoints', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'complete' }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ canonicalLatex: "f'(x) = 3x^2 + 2" }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const problem = ProofService.getProblemLibrary().find((candidate) => candidate.id === 'polynomial-derivative');
    const steps = [
      { id: 's1', math: problem.prompt, kind: problem.rootKind },
      { id: 's2', math: "f'(x) = 3x^2 + 2", kind: 'derivative' },
    ];
    expect(await ProofService.assessCompletion(problem, steps)).toBe('complete');
    expect(await ProofService.revealFinalForm(problem, steps[0])).toEqual({ canonicalLatex: "f'(x) = 3x^2 + 2" });
    expect(fetchMock.mock.calls.map((call) => call[0])).toEqual([
      'http://127.0.0.1:8000/assess-completion',
      'http://127.0.0.1:8000/reveal-final-form',
    ]);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ canonicalGoal: { terminalDerivativeOrder: 1 } });
  });

  it('labels derivative-order feedback as a correction instead of a recheck', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 'invalid',
      rule: 'derivative-order',
      summary: "After f'(x), the next derivative must be f''(x), not f'(x).",
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const edge = await ProofService.verifyStep(
      { id: 's2', math: "f'(x) = 6x\\cos(3x^2 + 1)", kind: 'derivative' },
      { id: 's3', math: "f'(x) = 36x\\sin(3x^2 + 1)", kind: 'derivative' },
      'derivative',
    );

    expect(edge.status).toBe('invalid');
    expect(edge.label).toBe('advance derivative order');
    expect(edge.inspectorData.title).toBe('Advance the derivative order');
  });

  it('exposes the inequality hero with a fixed target and server-backed number-line evidence', async () => {
    const problem = ProofService.getProblemLibrary().find((candidate) => candidate.id === 'inequality-sign-flip');
    expect(problem).toMatchObject({ mode: 'inequality', rootKind: 'inequality', canonicalGoal: { kind: 'inequality' } });
    expect(problem.seedSteps).toEqual([
      { math: '-2x > 4', kind: 'inequality' },
      { math: 'x > -2', kind: 'inequality' },
    ]);

    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 'invalid',
      rule: 'inequality-sign-flip',
      summary: 'Dividing by a negative reverses the inequality sign.',
      evidence: {
        kind: 'inequality-region',
        previousRegion: { boundaryLatex: '-2', direction: 'left', inclusive: false },
        submittedRegion: { boundaryLatex: '-2', direction: 'right', inclusive: false },
        testValueLatex: '0',
        previousIncludesTest: false,
        submittedIncludesTest: true,
        numberLine: { previousBoundaryPosition: 35, submittedBoundaryPosition: 35, testValuePosition: 75 },
      },
      verifiedRepairLatex: 'x < -2',
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const edge = await ProofService.verifyStep(
      { id: 's2', math: '-2x > 4', kind: 'inequality' },
      { id: 's3', math: 'x > -2', kind: 'inequality' },
      'inequality',
    );
    expect(edge.label).toBe('sign did not flip');
    expect(edge.inspectorData.mistakePattern).toBe('Sign did not flip');
    expect(edge.inspectorData.evidence.testValueLatex).toBe('0');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      mode: 'inequality', previousStep: { kind: 'inequality' }, nextStep: { kind: 'inequality' },
    });
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
      const edge = await ProofService.verifyStep(
        { id: 's1', math: 'x = 1', kind: 'equation' },
        { id: 's2', math: 'x = 2', kind: 'equation' },
        'algebra',
      );
      expect(edge.inspectorData.mistakePattern).toBe(expected);
    }
  });
});
