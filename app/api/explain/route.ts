import { NextResponse } from 'next/server';
import type { ExplainMode, VerificationResult } from '@/lib/domain/types';
import { getTeachingProvider, TeachingProviderError } from '@/lib/ai/teaching-provider';

const modes = new Set<ExplainMode>(['hint', 'explain', 'repair']);

export async function POST(request: Request) {
  try {
    const payload = await request.json() as { mode?: unknown; verification?: VerificationResult; previousStep?: unknown; nextStep?: unknown };
    if (typeof payload.mode !== 'string' || !modes.has(payload.mode as ExplainMode) || !payload.verification || typeof payload.previousStep !== 'string' || typeof payload.nextStep !== 'string') {
      return NextResponse.json({ error: 'Equations, a verification result, and a valid explanation mode are required.' }, { status: 400 });
    }
    const result = await getTeachingProvider().generate({
      previousStep: payload.previousStep,
      nextStep: payload.nextStep,
      verification: payload.verification,
      mode: payload.mode as ExplainMode,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Explanation route failed:', error);
    if (error instanceof TeachingProviderError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'ProofLab could not prepare teaching help right now.' }, { status: 500 });
  }
}
