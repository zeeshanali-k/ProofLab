import { NextResponse } from 'next/server';
import type { ProofStep } from '@/lib/domain/types';
import { getVerificationProvider } from '@/lib/verification/provider';

export const runtime = 'nodejs';

const isStep = (value: unknown): value is Pick<ProofStep, 'id' | 'latex'> =>
  typeof value === 'object' && value !== null &&
  typeof (value as { id?: unknown }).id === 'string' &&
  typeof (value as { latex?: unknown }).latex === 'string';

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    const previousPayload = (payload as { previousStep?: unknown }).previousStep;
    const nextPayload = (payload as { nextStep?: unknown }).nextStep;
    if (!isStep(previousPayload) || !isStep(nextPayload)) {
      return NextResponse.json({ error: 'previousStep and nextStep require an id and LaTex equation.' }, { status: 400 });
    }

    // Ignore browser-provided canonical strings. The server always re-parses LaTex.
    const previousStep: ProofStep = { id: previousPayload.id, latex: previousPayload.latex };
    const nextStep: ProofStep = { id: nextPayload.id, latex: nextPayload.latex };
    const result = await getVerificationProvider().verifyTransition(previousStep, nextStep);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Verification route failed:', error);
    return NextResponse.json({ error: 'ProofLab could not check this step right now.' }, { status: 500 });
  }
}
