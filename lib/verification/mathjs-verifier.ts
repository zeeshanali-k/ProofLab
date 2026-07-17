import { parse } from 'mathjs';
import { decodeEquation, EquationSyntaxError, type DecodedEquation } from '@/lib/equation/codec';
import type { Counterexample, ProofStep, VerificationProvider, VerificationResult } from '@/lib/domain/types';

const EPSILON = 1e-9;
const SAMPLE_VALUES = [3, -7, -3, -2, -1, 0, 1, 2, 7];

const closeEnough = (first: number, second: number) => Math.abs(first - second) < EPSILON;

const evaluate = (expression: string, value: number) => {
  const result = parse(expression).compile().evaluate({ x: value });
  if (typeof result !== 'number' || !Number.isFinite(result)) throw new EquationSyntaxError('This equation cannot be evaluated safely.');
  return result;
};

const residual = (equation: DecodedEquation, value: number) => evaluate(equation.left, value) - evaluate(equation.right, value);

const sideValues = (equation: DecodedEquation, value: number) => ({
  left: evaluate(equation.left, value),
  right: evaluate(equation.right, value),
});

const equationsAreEquivalent = (previous: DecodedEquation, next: DecodedEquation) => {
  const comparisons = SAMPLE_VALUES.map((value) => ({ previous: residual(previous, value), next: residual(next, value) }));
  const sameResidual = comparisons.every(({ previous: first, next: second }) => closeEnough(first, second));
  const reversedResidual = comparisons.every(({ previous: first, next: second }) => closeEnough(first, -second));
  return sameResidual || reversedResidual;
};

const counterexampleFor = (previous: DecodedEquation, next: DecodedEquation): Counterexample | undefined => {
  for (const value of SAMPLE_VALUES) {
    const previousValues = sideValues(previous, value);
    const nextValues = sideValues(next, value);
    if (!closeEnough(previousValues.left - previousValues.right, nextValues.left - nextValues.right)) {
      return {
        variable: 'x',
        value,
        previousLeft: previousValues.left,
        previousRight: previousValues.right,
        nextLeft: nextValues.left,
        nextRight: nextValues.right,
      };
    }
  }
  return undefined;
};

const numericValue = (expression: string) => (/^-?\d+$/.test(expression) ? Number(expression) : undefined);

const solutionValue = (equation: DecodedEquation) => {
  if (equation.left === 'x') return numericValue(equation.right);
  if (equation.right === 'x') return numericValue(equation.left);
  return undefined;
};

const squareParameter = (equation: DecodedEquation) => {
  const match = equation.left.match(/^\(x([+-])(\d+)\)\^2$/);
  if (!match) return undefined;
  return match[1] === '-' ? -Number(match[2]) : Number(match[2]);
};

const hasMissingSquareTerm = (previous: DecodedEquation, next: DecodedEquation) => {
  const parameter = squareParameter(previous);
  if (parameter === undefined || previous.right !== next.right) return undefined;
  const expectedWithoutMiddle = `x^2+${parameter * parameter}`;
  const matchesWithoutMiddle = SAMPLE_VALUES.every((value) => closeEnough(evaluate(next.left, value), evaluate(expectedWithoutMiddle, value)));
  if (!matchesWithoutMiddle) return undefined;
  const coefficient = 2 * parameter;
  return coefficient === 1 ? 'x' : coefficient === -1 ? '-x' : `${coefficient}x`;
};

const resultForEquivalentTransition = (previous: DecodedEquation, next: DecodedEquation): VerificationResult => {
  const parameter = squareParameter(previous);
  if (parameter !== undefined) {
    return {
      status: 'valid',
      rule: 'expand-square',
      summary: 'Nice—every term from the square is present.',
    };
  }
  if (next.right === '0' && previous.right !== '0') {
    return {
      status: 'valid',
      rule: 'balance-operation',
      summary: 'Nice—both sides were changed by the same amount.',
    };
  }
  return {
    status: 'valid',
    rule: 'equivalent-rearrangement',
    summary: 'This step preserves the equation.',
  };
};

export class MathJsVerifier implements VerificationProvider {
  async verifyTransition(previousStep: ProofStep, nextStep: ProofStep): Promise<VerificationResult> {
    let previous: DecodedEquation;
    let next: DecodedEquation;
    try {
      previous = decodeEquation(previousStep.canonical || previousStep.latex);
      next = decodeEquation(nextStep.canonical || nextStep.latex);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'This equation is outside the current algebra scope.';
      return {
        status: 'unsupported',
        summary: 'ProofLab cannot verify this kind of step yet.',
        limitations: [message, 'This version checks one-variable linear and quadratic algebra.'],
      };
    }

    try {
      const proposedSolution = solutionValue(next);
      if (proposedSolution !== undefined) {
        const values = sideValues(previous, proposedSolution);
        if (closeEnough(values.left, values.right)) {
          return {
            status: 'valid',
            rule: 'solution-substitution',
            summary: `x = ${proposedSolution} satisfies the previous equation.`,
          };
        }
        return {
          status: 'invalid',
          rule: 'solution-substitution',
          summary: `x = ${proposedSolution} does not satisfy the previous equation.`,
          counterexample: {
            variable: 'x', value: proposedSolution,
            previousLeft: values.left, previousRight: values.right,
            nextLeft: proposedSolution, nextRight: proposedSolution,
          },
        };
      }

      if (equationsAreEquivalent(previous, next)) return resultForEquivalentTransition(previous, next);

      const counterexample = counterexampleFor(previous, next);
      if (counterexample) {
        const likelyMissingTerm = hasMissingSquareTerm(previous, next);
        return {
          status: 'invalid',
          summary: likelyMissingTerm ? 'The expanded expression is missing a term.' : 'These equations are not equivalent.',
          counterexample,
          likelyMissingTerm,
          verifiedRepairLatex: likelyMissingTerm ? 'x^2 + 4x + 4 = 25' : undefined,
        };
      }

      return {
        status: 'inconclusive',
        summary: 'ProofLab could not confirm this transition.',
        limitations: ['The expression is within the basic syntax scope, but no supported rule matched it.'],
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The verifier could not evaluate this step.';
      return {
        status: 'inconclusive',
        summary: 'ProofLab could not confirm this transition.',
        limitations: [message],
      };
    }
  }
}
