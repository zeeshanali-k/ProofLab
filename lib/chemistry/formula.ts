import { Formula } from '@chemistry/formula';
import type { ParsedFormula } from './types';

/**
 * Parses a chemical formula and returns element composition and molecular weight
 * 
 * @param input - The chemical formula string (e.g., "C2H5OH")
 * @returns ParsedFormula containing elements, molecular weight, and normalized formula string
 */
export function parseFormula(input: string): ParsedFormula {
	try {
		// Normalize the input formula
		const normalizedInput = normalizeFormula(input);
		
		// Parse the formula into element counts
		const parsed = Formula.parse(normalizedInput);
		
		// Calculate molecular weight
		const weight = Formula.convertToWeight(parsed);
		
		// Get standardized formula string - build it manually if stringify doesn't exist
		const str = buildFormulaString(parsed);
		
		return {
			elements: parsed,
			molecularWeight: weight,
			formulaString: str
		};
	} catch (error) {
		// Fallback for simple formulas
		return parseFormulaFallback(input);
	}
}

/**
 * Normalizes a chemical formula for parsing
 */
function normalizeFormula(input: string): string {
	// Convert Unicode subscripts/superscripts to ASCII digits
	const ascii = input.replace(/[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹]/g, ch => {
		const map: Record<string, string> = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9' };
		return map[ch] || ch;
	});
	// Remove any whitespace and state symbols
	return ascii
		.replace(/\s+/g, '')
		.replace(/\(s\)|\(l\)|\(g\)|\(aq\)/g, '');
}

/**
 * Fallback parser for simple formulas when @chemistry/formula fails
 */
function parseFormulaFallback(input: string): ParsedFormula {
	const elements: Record<string, number> = {};
	let molecularWeight = 0;

	// Element atomic weights (approximate)
	const atomicWeights: Record<string, number> = {
		H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011,
		N: 14.007, O: 15.999, F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305,
		Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948,
		K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996,
		Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
		Br: 79.904, Ag: 107.87, I: 126.90, Au: 196.97, Pb: 207.2
	};

	// Normalize Unicode subscripts first
	const normalizedInput = input.replace(/[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹]/g, ch => {
		const map: Record<string, string> = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9' };
		return map[ch] || ch;
	});

	// Parse element symbol followed by optional count
	// Pattern: element symbol (uppercase + optional lowercase) followed by optional digits
	const elementPattern = /([A-Z][a-z]?)(\d*)/g;
	let match;
	let formulaString = normalizedInput.replace(/\s+/g, '').replace(/\(s\)|\(l\)|\(g\)|\(aq\)/g, '');

	while ((match = elementPattern.exec(formulaString)) !== null) {
		const element = match[1];
		const count = match[2] ? parseInt(match[2], 10) : 1;
		
		elements[element] = (elements[element] || 0) + count;
		
		// Calculate weight contribution
		const weight = atomicWeights[element] || 0;
		molecularWeight += weight * count;
	}
	
	return {
		elements,
		molecularWeight,
		formulaString
	};
}

/**
 * Builds a formula string from parsed elements
 */
function buildFormulaString(parsed: Record<string, number>): string {
	const parts: string[] = [];
	Object.entries(parsed).forEach(([element, count]) => {
		if (count === 1) {
			parts.push(element);
		} else {
			parts.push(`${element}${count}`);
		}
	});
	return parts.join('');
}

/**
 * Validates if a formula string is valid
 */
export function isValidFormula(input: string): boolean {
	try {
		const normalized = normalizeFormula(input);
		Formula.parse(normalized);
		return true;
	} catch (error) {
		return false;
	}
}

/**
 * Gets the empirical formula from a molecular formula
 */
export function getEmpiricalFormula(formula: string): string {
	try {
		const parsed = Formula.parse(normalizeFormula(formula));
		// Formula.empirical might not exist, so we'll simplify manually
		const empirical = simplifyToEmpirical(parsed);
		return buildFormulaString(empirical);
	} catch (error) {
		return formula;
	}
}

/**
 * Simplifies a parsed formula to its empirical form
 */
function simplifyToEmpirical(parsed: Record<string, number>): Record<string, number> {
	// Find the greatest common divisor of all counts
	const counts = Object.values(parsed);
	const gcd = counts.reduce((a, b) => findGCD(a, b), counts[0] || 1);
	
	const empirical: Record<string, number> = {};
	Object.entries(parsed).forEach(([element, count]) => {
		empirical[element] = count / gcd;
	});
	
	return empirical;
}

/**
 * Finds the greatest common divisor of two numbers
 */
function findGCD(a: number, b: number): number {
	if (b === 0) return a;
	return findGCD(b, a % b);
}

/**
 * Calculates mass percentage of each element in a formula
 */
export function getMassPercentage(formula: string): Array<{ element: string; count: number; mass: number; percentage: number }> {
	const parsed = parseFormula(formula);
	const totalMass = parsed.molecularWeight;
	
	const percentages = Object.entries(parsed.elements).map(([element, count]) => {
		// Get atomic weight (fallback to 0 if not found)
		const atomicWeights: Record<string, number> = {
			H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011,
			N: 14.007, O: 15.999, F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305,
			Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45
		};
		const weight = atomicWeights[element] || 0;
		const mass = weight * count;
		return {
			element,
			count,
			mass,
			percentage: totalMass > 0 ? (mass / totalMass) * 100 : 0
		};
	});
	
	return percentages;
}
