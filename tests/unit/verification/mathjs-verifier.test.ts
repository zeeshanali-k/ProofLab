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

  it('generates a repair that matches the active square, not a fixed example', async () => {
    const result = await verifier.verifyTransition(
      step('s1', '(x - 3)^2 = 16'),
      step('s2', 'x^2 + 9 = 16'),
    );
    expect(result).toMatchObject({
      status: 'invalid',
      likelyMissingTerm: '-6x',
      verifiedRepairLatex: 'x^2 - 6x + 9 = 16',
    });
  });

  it('recognizes balanced rearrangement after the repair', async () => {
    const result = await verifier.verifyTransition(
      step('s2', 'x^2 + 4x + 4 = 25'),
      step('s3', 'x^2 + 4x - 21 = 0'),
    );
    expect(result).toMatchObject({ status: 'valid', rule: 'balance-operation' });
  });

  it('supports a linear balance operation', async () => {
    const result = await verifier.verifyTransition(
      step('s1', '3x + 5 = 20'),
      step('s2', '3x = 15'),
    );
    expect(result).toMatchObject({ status: 'valid', rule: 'balance-operation' });
  });

  it('supports dividing both sides by a non-zero numeric constant', async () => {
    const result = await verifier.verifyTransition(
      step('s1', '2x + 2 = 6'),
      step('s2', 'x + 1 = 3'),
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
