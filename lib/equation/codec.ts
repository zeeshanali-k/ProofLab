import { parse, type ConstantNode, type MathNode, type OperatorNode, type SymbolNode } from 'mathjs';

export class EquationSyntaxError extends Error {}

export interface DecodedEquation {
  source: string;
  canonical: string;
  left: string;
  right: string;
}

const readGroup = (source: string, start: number): [string, number] => {
  if (source[start] !== '{') throw new EquationSyntaxError('Expected a braced fraction term.');
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1;
    if (source[index] === '}') depth -= 1;
    if (depth === 0) return [source.slice(start + 1, index), index + 1];
  }
  throw new EquationSyntaxError('Unclosed group in equation.');
};

const replaceFractions = (source: string): string => {
  let result = '';
  for (let index = 0; index < source.length;) {
    if (!source.startsWith('\\frac', index)) {
      result += source[index];
      index += 1;
      continue;
    }
    const [numerator, afterNumerator] = readGroup(source, index + 5);
    const [denominator, afterDenominator] = readGroup(source, afterNumerator);
    result += `(${replaceFractions(numerator)})/(${replaceFractions(denominator)})`;
    index = afterDenominator;
  }
  return result;
};

const tokenize = (source: string): string[] => {
  const tokens = source.match(/\d+|x|[()+\-*/^]/g) ?? [];
  if (tokens.join('') !== source.replace(/\s/g, '')) throw new EquationSyntaxError('This equation uses unsupported notation.');
  return tokens;
};

const needsImplicitMultiply = (left: string, right: string) =>
  (left === 'x' || left === ')' || /^\d+$/.test(left)) && (right === 'x' || right === '(' || /^\d+$/.test(right));

const canonicalizeSide = (source: string) => {
  const tokens = tokenize(source);
  if (!tokens.length) throw new EquationSyntaxError('Both sides of the equation need an expression.');
  const canonical: string[] = [];
  let depth = 0;

  tokens.forEach((token, index) => {
    if (token === '(') depth += 1;
    if (token === ')') depth -= 1;
    if (depth < 0) throw new EquationSyntaxError('Parentheses do not match.');
    if (index && needsImplicitMultiply(tokens[index - 1], token)) canonical.push('*');
    canonical.push(token);
  });
  if (depth !== 0) throw new EquationSyntaxError('Parentheses do not match.');
  return canonical.join('');
};

const validateMathNode = (node: MathNode) => {
  const permitted = new Set(['ConstantNode', 'SymbolNode', 'OperatorNode', 'ParenthesisNode']);
  if (!permitted.has(node.type)) throw new EquationSyntaxError('This equation is outside the current algebra scope.');

  if (node.type === 'SymbolNode' && (node as SymbolNode).name !== 'x') {
    throw new EquationSyntaxError('Only the variable x is supported.');
  }

  if (node.type === 'OperatorNode') {
    const operatorNode = node as OperatorNode;
    const allowedOperators = new Set(['add', 'subtract', 'multiply', 'divide', 'pow', 'unaryMinus', 'unaryPlus']);
    if (!allowedOperators.has(operatorNode.fn)) throw new EquationSyntaxError('This operation is outside the current algebra scope.');
    if (operatorNode.fn === 'pow') {
      const exponent = operatorNode.args[1] as ConstantNode | undefined;
      if (exponent?.type !== 'ConstantNode' || !Number.isInteger(Number(exponent.value)) || Number(exponent.value) < 0 || Number(exponent.value) > 2) {
        throw new EquationSyntaxError('Only powers through two are supported.');
      }
    }
  }
};

const validateParsedExpression = (expression: string) => {
  const parsed = parse(expression);
  parsed.traverse(validateMathNode);
  if (/\/\([^()]*x[^()]*\)/.test(expression) || /\/x/.test(expression)) {
    throw new EquationSyntaxError('Variable denominators are outside the current algebra scope.');
  }
};

export function decodeEquation(source: string): DecodedEquation {
  if (typeof source !== 'string' || !source.trim()) throw new EquationSyntaxError('An equation is required.');

  const normalized = replaceFractions(source)
    .replaceAll('\\left', '')
    .replaceAll('\\right', '')
    .replaceAll('\\cdot', '*')
    .replaceAll('\\times', '*')
    .replaceAll('−', '-')
    .replaceAll('²', '^2')
    .replace(/\\[,! ]/g, '')
    .replace(/[{}]/g, (token) => (token === '{' ? '(' : ')'))
    .trim();

  if ((normalized.match(/=/g) ?? []).length !== 1) {
    throw new EquationSyntaxError('Use exactly one equals sign.');
  }
  if (!/^[0-9x+\-*/^().=\s]+$/.test(normalized)) {
    throw new EquationSyntaxError('Only x, numbers, basic operations, parentheses, fractions, and one equals sign are supported.');
  }

  const [rawLeft, rawRight] = normalized.split('=');
  const left = canonicalizeSide(rawLeft);
  const right = canonicalizeSide(rawRight);
  validateParsedExpression(left);
  validateParsedExpression(right);
  return { source, canonical: `${left}=${right}`, left, right };
}
