import { describe, expect, it } from 'vitest';
import { MathJsVerifier } from '@/lib/verification/mathjs-verifier';

const verifier = new MathJsVerifier();
const step = (id: string, latex: string) => ({ id, latex });

describe('MathJsVerifier', () => {
  it('confirms the repaired square expansion', async () => {
    const result = await verifier.verifyTransition(
      step('s1', '(x + 2)^2 = 25'),
      step('s2', 'x^2 + 4x + 4 = 25'),
    );
    expect(result).toMatchObject({ status: 'valid', rule: 'expand-square' });
  });

  it('returns a concrete missing-middle-term counterexample', async () => {
    const result = await verifier.verifyTransition(
      step('s1', '(x + 2)^2 = 25'),
      step('s2', 'x^2 + 4 = 25'),
    );
    expect(result).toMatchObject({
      status: 'invalid',
      likelyMissingTerm: '4x',
      counterexample: { variable: 'x', value: 3, previousLeft: 25, previousRight: 25, nextLeft: 13, nextRight: 25 },
    });
  });

  it('recognizes balanced rearrangement after the repair', async () => {
    const result = await verifier.verifyTransition(
      step('s2', 'x^2 + 4x + 4 = 25'),
      step('s3', 'x^2 + 4x - 21 = 0'),
    );
    expect(result).toMatchObject({ status: 'valid', rule: 'balance-operation' });
  });

  it('rejects unsupported variables without evaluating them', async () => {
    const result = await verifier.verifyTransition(
      step('s1', 'y^2 = 4'),
      step('s2', 'y = 2'),
    );
    expect(result.status).toBe('unsupported');
  });

  it('checks a proposed numeric solution by substitution', async () => {
    const result = await verifier.verifyTransition(
      step('s1', 'x^2 + 4x - 21 = 0'),
      step('s2', 'x = 7'),
    );
    expect(result).toMatchObject({ status: 'invalid', rule: 'solution-substitution' });
  });
});
