import type { ProofStep, VerificationProvider, VerificationResult } from '@/lib/domain/types';

/**
 * Future Python adapter. The browser never calls this service directly; it keeps
 * the same contract as the in-process Math.js verifier.
 */
export class SympyVerifier implements VerificationProvider {
  async verifyTransition(previous: ProofStep, next: ProofStep): Promise<VerificationResult> {
    const endpoint = process.env.SYMPY_VERIFIER_URL;
    if (!endpoint) {
      return {
        status: 'inconclusive',
        summary: 'The Python verifier is selected but has not been configured.',
        limitations: ['Set SYMPY_VERIFIER_URL or use VERIFIER_PROVIDER=mathjs.'],
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ previousStep: previous, nextStep: next }),
    });
    if (!response.ok) throw new Error(`Python verifier returned ${response.status}.`);
    return response.json() as Promise<VerificationResult>;
  }
}
