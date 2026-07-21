import { afterEach, describe, expect, it, vi } from 'vitest';
import { LeetMathService } from '@/src/api/LeetMathService';

afterEach(() => vi.unstubAllGlobals());

describe('LeetMathService', () => {
  it('uses the safe catalog, progress, preview, submission, and history routes', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: '001' }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([{ challengeId: '001', status: 'solved', attemptCount: 1 }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ visualization: { type: 'number-line', phase: 'draft', learnerData: {} } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'accepted', summary: 'Mathematical contract satisfied.', visualization: { type: 'none', phase: 'accepted', learnerData: {} } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(LeetMathService.fetchCatalog()).resolves.toEqual([{ id: '001' }]);
    await expect(LeetMathService.fetchProgress()).resolves.toEqual([{ challengeId: '001', status: 'solved', attemptCount: 1 }]);
    await LeetMathService.preview('003', 'x < -2');
    await LeetMathService.submit('001', 'x = 5');
    await LeetMathService.fetchSubmissions('001');

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'http://localhost:8000/challenges',
      'http://localhost:8000/challenges/progress',
      'http://localhost:8000/challenges/003/preview',
      'http://localhost:8000/challenges/001/submit',
      'http://localhost:8000/challenges/001/submissions',
    ]);
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ latex: 'x < -2' });
    expect(JSON.parse(fetchMock.mock.calls[3][1].body)).toEqual({ latex: 'x = 5' });
    expect(fetchMock.mock.calls.every(([, options]) => options.credentials === 'include')).toBe(true);
  });
});
