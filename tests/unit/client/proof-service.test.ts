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
  });
});
