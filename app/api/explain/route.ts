import { NextResponse } from 'next/server';
import type { ExplainMode, ExplanationResult, VerificationResult } from '@/lib/domain/types';

const modes = new Set<ExplainMode>(['hint', 'explain', 'repair']);

const explainFromEvidence = (mode: ExplainMode, verification: VerificationResult): ExplanationResult => {
  const missingTerm = verification.likelyMissingTerm;
  if (mode === 'hint') {
    return {
      title: 'A small nudge',
      body: 'Start by writing the square as two matching brackets. Then look for the two cross-products.',
      question: 'When you multiply each bracket, which two terms include both x and the number?',
    };
  }
  if (mode === 'repair') {
    return {
      title: 'Suggested repair',
      body: 'This is a draft. Apply it only to re-run verification.',
      repairLatex: verification.verifiedRepairLatex ?? (missingTerm ? `x^2 + ${missingTerm} + 4 = 25` : undefined),
    };
  }
  return {
    title: 'Why this changes',
    body: missingTerm
      ? `The two cross-products combine to ${missingTerm}. Leaving that term out changes the value of the expression, which is why the counterexample works.`
      : `${verification.summary} The evidence card shows a value where the two equations produce different results.`,
  };
};

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { mode?: unknown; verification?: VerificationResult };
    if (typeof payload.mode !== 'string' || !modes.has(payload.mode as ExplainMode) || !payload.verification) {
      return NextResponse.json({ error: 'A verification result and a valid explanation mode are required.' }, { status: 400 });
    }

    // The OpenAI-powered teaching provider intentionally remains disabled until
    // OPENAI_API_KEY is configured. This evidence-bound fallback means the UI
    // still has no open-ended chat behavior and never decides correctness itself.
    return NextResponse.json(explainFromEvidence(payload.mode as ExplainMode, payload.verification));
  } catch (error) {
    console.error('Explanation route failed:', error);
    return NextResponse.json({ error: 'ProofLab could not prepare teaching help right now.' }, { status: 500 });
  }
}
