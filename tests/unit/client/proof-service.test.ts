import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProofService } from '@/src/api/ProofService';

afterEach(() => vi.unstubAllGlobals());

describe('problem library', () => {
  it('offers diverse reusable starting problems', () => {
    expect(ProofService.getProblemLibrary().map((problem) => problem.id)).toEqual([
      'missing-middle-term',
      'linear-balance',
      'negative-square',
      'quadratic-solution-check',
      'polynomial-derivative',
      'complex-product',
      'complex-roots',
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
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      status: 'invalid', rule: 'complex-solution-set', summary: 'A root is missing.', evidence: {
        kind: 'solution-set', expectedSolutionsLatex: ['2 i', '- 2 i'], submittedSolutionsLatex: ['2 i'], missingSolutionsLatex: ['- 2 i'], unexpectedSolutionsLatex: [],
      }, verifiedRepairLatex: '\\{2 i, - 2 i\\}',
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const problem = ProofService.getProblemLibrary().find((candidate) => candidate.id === 'complex-roots');
    const board = await ProofService.loadProblem(problem);
    expect(board.edges[0].label).toBe('incomplete solution set');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({
      mode: 'complex-solve',
      previousStep: { kind: 'equation' },
      nextStep: { kind: 'solution-set' },
    });
  });
});
