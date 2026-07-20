import { afterEach, describe, expect, it, vi } from 'vitest';
import { LeetMathService } from '@/src/api/LeetMathService';

afterEach(() => vi.unstubAllGlobals());

describe('LeetMathService', () => {
  it('uses the safe catalog, preview, submission, and history routes', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([{ id: '001' }]), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ visualization: { type: 'number-line', phase: 'draft', learnerData: {} } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ status: 'accepted', summary: 'Mathematical contract satisfied.', visualization: { type: 'none', phase: 'accepted', learnerData: {} } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(LeetMathService.fetchCatalog()).resolves.toEqual([{ id: '001' }]);
    await LeetMathService.preview('003', 'x < -2');
    await LeetMathService.submit('001', 'x = 5', 'f2fb2f3c-9717-4ae0-aa03-40cfb371e4cd');
    await LeetMathService.fetchSubmissions('001', 'f2fb2f3c-9717-4ae0-aa03-40cfb371e4cd');

    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual([
      'http://127.0.0.1:8000/challenges',
      'http://127.0.0.1:8000/challenges/003/preview',
      'http://127.0.0.1:8000/challenges/001/submit',
      'http://127.0.0.1:8000/challenges/001/submissions',
    ]);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ latex: 'x < -2' });
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({ latex: 'x = 5', anonymousSessionId: 'f2fb2f3c-9717-4ae0-aa03-40cfb371e4cd' });
    expect(fetchMock.mock.calls[3][1].headers).toEqual({ 'X-ProofLab-Session': 'f2fb2f3c-9717-4ae0-aa03-40cfb371e4cd' });
  });
});
