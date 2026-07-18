import type { VerificationProvider } from '@/lib/domain/types';
import { MathJsVerifier } from '@/lib/verification/mathjs-verifier';
import { SympyVerifier } from '@/lib/verification/sympy-verifier';

export function getVerificationProvider(): VerificationProvider {
  if (process.env.VERIFIER_PROVIDER === 'sympy') return new SympyVerifier();
  return new MathJsVerifier();
}
