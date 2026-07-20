import type { ValidationError } from './types';

export function validateEquation(
	equation: string,
	inputs: Record<string, number>
): ValidationError[] {
	const errors: ValidationError[] = [];

	const variablePattern = /[a-zA-Z]+/g;
	const variables = equation.match(variablePattern) || [];
	const constants = ['pi', 'e', 'sin', 'cos', 'tan', 'log', 'sqrt', 'abs'];

	for (const v of variables) {
		if (!(v in inputs) && !constants.includes(v) && !isMathFunction(v)) {
			errors.push({
				field: v,
				message: `Missing value for "${v}"`,
				type: 'missing'
			});
		}
	}

	if (equation.includes('/') && inputs) {
		const parts = equation.split('/');
		if (parts.length > 1) {
			const denom = parts[1].trim();
			const denomVars = denom.match(/[a-zA-Z]+/g) || [];
			for (const v of denomVars) {
				if (v in inputs && Math.abs(inputs[v]) < 1e-10) {
					errors.push({
						field: v,
						message: `Division by zero — "${v}" is near zero`,
						type: 'out_of_range'
					});
				}
			}
		}
	}

	return errors;
}

export function getLiveValidation(
	input: string,
	cursorPosition: number
): ValidationError | null {
	const before = input.slice(0, cursorPosition);
	const varMatch = before.match(/([a-zA-Z]+)$/);
	if (varMatch) {
		const v = varMatch[1];
		if (!['sin', 'cos', 'tan', 'log', 'sqrt', 'abs'].includes(v)) {
			return {
				field: v,
				message: `Unknown variable "${v}"`,
				type: 'syntax'
			};
		}
	}
	return null;
}

function isMathFunction(name: string): boolean {
	return ['sin', 'cos', 'tan', 'log', 'sqrt', 'abs', 'exp', 'ln'].includes(name);
}
