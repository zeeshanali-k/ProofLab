import { afterEach, describe, expect, it, vi } from 'vitest';
import { OllamaTeachingProvider, OpenAICompatibleTeachingProvider, TeachingProviderError } from '@/lib/ai/teaching-provider';

const request = {
  mode: 'repair' as const,
  previousStep: '(x + 2)^2 = 25',
  nextStep: 'x^2 + 4 = 25',
  verification: {
    status: 'invalid' as const,
    summary: 'The expanded expression is missing a term.',
    likelyMissingTerm: '4x',
    verifiedRepairLatex: 'x^2 + 4x + 4 = 25',
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.OLLAMA_MODEL;
  delete process.env.OPENAI_COMPATIBLE_BASE_URL;
  delete process.env.OPENAI_COMPATIBLE_MODEL;
  delete process.env.OPENAI_COMPATIBLE_API_KEY;
});

describe('teaching providers', () => {
  it('calls Ollama server-side and returns the AI repair as a draft to be verified', async () => {
    process.env.OLLAMA_MODEL = 'test-model';
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: { content: JSON.stringify({ title: 'Repair', body: 'Use the complete square.', repairLatex: 'x = 999' }) },
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const result = await new OllamaTeachingProvider().generate(request);
    expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:11434/api/chat', expect.objectContaining({ method: 'POST' }));
    expect(result).toEqual({ title: 'Repair', body: 'Use the complete square.', repairLatex: 'x = 999' });
  });

  it('falls back to a verifier-approved repair when the model omits a candidate', async () => {
    process.env.OLLAMA_MODEL = 'test-model';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      message: { content: JSON.stringify({ title: 'Repair', body: 'Use the completed expansion.' }) },
    }), { status: 200 })));

    await expect(new OllamaTeachingProvider().generate(request)).resolves.toMatchObject({
      repairLatex: 'x^2 + 4x + 4 = 25',
    });
  });

  it('uses the standard Chat Completions endpoint for an OpenAI-compatible service', async () => {
    process.env.OPENAI_COMPATIBLE_BASE_URL = 'https://example.test/v1/';
    process.env.OPENAI_COMPATIBLE_MODEL = 'compatible-model';
    process.env.OPENAI_COMPATIBLE_API_KEY = 'server-only-key';
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ title: 'Repair', body: 'Add the cross term.' }) } }],
    }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await new OpenAICompatibleTeachingProvider().generate(request);
    expect(fetchMock).toHaveBeenCalledWith('https://example.test/v1/chat/completions', expect.objectContaining({
      headers: expect.objectContaining({ authorization: 'Bearer server-only-key' }),
    }));
  });

  it('rejects incomplete provider configuration before making a request', async () => {
    await expect(new OpenAICompatibleTeachingProvider().generate(request)).rejects.toBeInstanceOf(TeachingProviderError);
  });
});
