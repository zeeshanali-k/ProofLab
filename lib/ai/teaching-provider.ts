import type { ExplanationResult, TeachingProvider, TeachingRequest } from '@/lib/domain/types';

type AIProviderName = 'ollama' | 'openai-compatible' | 'local';

export class TeachingProviderError extends Error {
  constructor(message: string, readonly status = 503) {
    super(message);
    this.name = 'TeachingProviderError';
  }
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const buildSystemPrompt = () => [
  "You are ProofLab's algebra coach for students aged 13–18.",
  'Correctness is already decided by the supplied verification evidence. Never override, reinterpret, or add to it.',
  'Use only the equations and evidence supplied. Be concise, encouraging, and specific.',
  'Return exactly one JSON object: {"title":"...","body":"...","question":"... optional","repairLatex":"... optional"}.',
  'Body may use short Markdown paragraphs, bullets, bold text, and KaTeX wrapped in $...$, but never repeat the title or a UI heading.',
  'For hint mode, ask one guiding question and do not reveal the corrected equation or missing term.',
  'For explain mode, explain the verified counterexample or rule in fewer than 100 words.',
  'For repair mode, include one proposed repairLatex equation. It is a draft and will be verified before ProofLab applies it.',
].join(' ');

const buildUserPrompt = ({ previousStep, nextStep, verification, mode }: TeachingRequest) => JSON.stringify({
  task: mode,
  previousStep,
  nextStep,
  verifiedEvidence: verification,
});

const parseModelJson = (content: string, request: TeachingRequest): ExplanationResult => {
  const cleaned = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new TeachingProviderError('The selected AI provider returned an invalid teaching response.', 502);
  }
  if (!parsed || typeof parsed !== 'object') throw new TeachingProviderError('The selected AI provider returned an invalid teaching response.', 502);
  const candidate = parsed as Record<string, unknown>;
  if (typeof candidate.title !== 'string' || typeof candidate.body !== 'string') {
    throw new TeachingProviderError('The selected AI provider omitted required teaching content.', 502);
  }

  const response: ExplanationResult = { title: candidate.title.slice(0, 90), body: candidate.body.slice(0, 700) };
  if (request.mode === 'hint' && typeof candidate.question === 'string') response.question = candidate.question.slice(0, 400);
  if (request.mode === 'repair') {
    if (typeof candidate.repairLatex === 'string' && candidate.repairLatex.trim()) {
      response.repairLatex = candidate.repairLatex.trim().slice(0, 400);
    } else if (request.verification.verifiedRepairLatex) {
      response.repairLatex = request.verification.verifiedRepairLatex;
    }
  }
  return response;
};

const fetchWithTimeout = async (url: string, init: RequestInit) => {
  const timeoutMs = Number(process.env.AI_TIMEOUT_MS ?? '20000');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number.isFinite(timeoutMs) ? timeoutMs : 20000);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new TeachingProviderError('The AI provider took too long to respond. Try again in a moment.');
    }
    throw new TeachingProviderError('ProofLab could not reach the configured AI provider.');
  } finally {
    clearTimeout(timeout);
  }
};

export class OllamaTeachingProvider implements TeachingProvider {
  async generate(request: TeachingRequest): Promise<ExplanationResult> {
    const baseUrl = trimTrailingSlash(process.env.OLLAMA_BASE_URL ?? 'http://127.0.0.1:11434');
    const model = process.env.OLLAMA_MODEL ?? 'llama3.2:3b';

    const response = await fetchWithTimeout(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,
        format: 'json',
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(request) },
        ],
      }),
    });
    const body = await response.json().catch(() => null) as { message?: { content?: unknown }; error?: unknown } | null;
    if (!response.ok) throw new TeachingProviderError(typeof body?.error === 'string' ? body.error : `Ollama returned ${response.status}.`, response.status);
    if (typeof body?.message?.content !== 'string') throw new TeachingProviderError('Ollama returned no teaching content.', 502);
    return parseModelJson(body.message.content, request);
  }
}

export class OpenAICompatibleTeachingProvider implements TeachingProvider {
  async generate(request: TeachingRequest): Promise<ExplanationResult> {
    const configuredBaseUrl = process.env.OPENAI_COMPATIBLE_BASE_URL;
    const model = process.env.OPENAI_COMPATIBLE_MODEL;
    if (!configuredBaseUrl || !model) {
      throw new TeachingProviderError('Set OPENAI_COMPATIBLE_BASE_URL and OPENAI_COMPATIBLE_MODEL before requesting AI teaching help.');
    }
    const apiKey = process.env.OPENAI_COMPATIBLE_API_KEY;
    const response = await fetchWithTimeout(`${trimTrailingSlash(configuredBaseUrl)}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user', content: buildUserPrompt(request) },
        ],
      }),
    });
    const body = await response.json().catch(() => null) as { choices?: Array<{ message?: { content?: unknown } }>; error?: { message?: unknown } | unknown } | null;
    if (!response.ok) {
      const message = body?.error && typeof body.error === 'object' && typeof (body.error as { message?: unknown }).message === 'string'
        ? (body.error as { message: string }).message
        : `The OpenAI-compatible provider returned ${response.status}.`;
      throw new TeachingProviderError(message, response.status);
    }
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== 'string') throw new TeachingProviderError('The OpenAI-compatible provider returned no teaching content.', 502);
    return parseModelJson(content, request);
  }
}

export class LocalEvidenceTeachingProvider implements TeachingProvider {
  async generate(request: TeachingRequest): Promise<ExplanationResult> {
    const missingTerm = request.verification.likelyMissingTerm;
    if (request.mode === 'hint') {
      return { title: 'A small nudge', body: 'Start by writing the expression as two matching brackets.', question: 'Which two cross-products appear when you multiply the brackets?' };
    }
    if (request.mode === 'repair') {
      return { title: 'Suggested repair', body: 'This is a draft. ProofLab will check it before changing your work.', repairLatex: request.verification.verifiedRepairLatex };
    }
    return { title: 'Why this changes', body: missingTerm ? `The two cross-products combine to ${missingTerm}. Leaving that term out changes the expression.` : request.verification.summary };
  }
}

export const getTeachingProvider = (): TeachingProvider => {
  const provider = (process.env.AI_PROVIDER ?? 'ollama') as AIProviderName;
  if (provider === 'ollama') return new OllamaTeachingProvider();
  if (provider === 'openai-compatible') return new OpenAICompatibleTeachingProvider();
  if (provider === 'local') return new LocalEvidenceTeachingProvider();
  throw new TeachingProviderError('AI_PROVIDER must be ollama, openai-compatible, or local.', 500);
};
