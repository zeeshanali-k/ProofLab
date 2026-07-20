import { balance } from 'fast-balance';
import type { BalanceResult, Suggestion } from './types';

/**
 * Extracts and preserves the original arrow type from an equation
 */
function extractArrowType(input: string): { normalized: string; arrowType: string; arrowIndex: number } {
	const arrowMatch = input.match(/(\s*)([\u2192\u21CC\u21D2\u2194\u2261]|->|=>|<->|<=>|<=|→|⇌|⇒|↔|=)\s*/);
	const arrowType = arrowMatch ? arrowMatch[2] : '->';
	const arrowIndex = arrowMatch?.index ?? -1;
	
	// Normalize all arrows to -> for parsing
	let normalized = input.replace(/[\u2192\u21CC\u21D2\u2194\u2261]|=>|<->|<=>|<=/g, '->');
	
	// Remove state symbols temporarily for better parsing
	normalized = normalized.replace(/\(s\)|\(l\)|\(g\)|\(aq\)/g, '');
	
	return { normalized, arrowType, arrowIndex };
}

/**
 * Restores the original arrow type in a balanced equation
 */
function restoreArrowType(equation: string, arrowType: string): string {
	const arrowMap: Record<string, string> = {
		'->': '->',
		'\u2192': '\u2192',      // →
		'\u21CC': '\u21CC',      // ⇌
		'\u21D2': '\u21D2',      // ⇒
		'\u2194': '\u2194',      // ↔
		'=': '=',
		'=>': '\u2192',
		'<->': '\u2194',
		'<=>': '\u21CC'
	};
	
	const normalizedArrow = arrowMap[arrowType] || arrowType;
	// Replace all arrow variations with the original type
	return equation.replace(/->|\u2192|\u21CC|\u21D2|\u2194|=>|<->|<=>|<=/g, normalizedArrow);
}

/**
 * Balances a chemical equation and returns the result
 * 
 * @param input - The chemical equation string (e.g., "H2 + O2 -> H2O")
 * @returns BalanceResult containing the balanced equation, reactants, products, validation status, and arrow type
 */
export function balanceEquation(input: string): BalanceResult & { arrowType?: string; suggestion?: Suggestion } {
	try {
		const { normalized, arrowType, arrowIndex } = extractArrowType(input);
		
		// fast-balance handles: ->, →, ⇒, ⇌, <=>, <->, -->, =
		// Auto-strips: (s), (l), (g), (aq)
		// Handles: nested parentheses, ionic charges, hydrates
		const result = balance(normalized, { showOne: true, format: 'text' });
		
		// Restore original arrow type in the equation
		const restoredEquation = restoreArrowType(result.equation, arrowType);
		
		return {
			equation: restoredEquation,
			reactants: result.reactants,
			products: result.products,
			isValid: true,
			arrowType
		};
	} catch (error) {
		const { arrowType } = extractArrowType(input);
		const suggestion = suggestCorrection(input);
		
		return {
			equation: input,
			reactants: [],
			products: [],
			isValid: false,
			error: getEnhancedErrorMessage(input, error),
			arrowType,
			suggestion: suggestion ?? undefined
		};
	}
}

/**
 * Provides step-by-step balancing (for educational display)
 * Uses fast-balance for core balancing
 */
export function balanceWithSteps(input: string): {
	result: BalanceResult & { arrowType?: string; suggestion?: Suggestion };
	steps: string[];
} {
	const result = balanceEquation(input);
	const steps = generateBalanceSteps(input, result);
	return { result, steps };
}

/**
 * Generates enhanced error messages for common issues
 */
function getEnhancedErrorMessage(input: string, error: unknown): string {
	const trimmed = input.trim();
	
	if (!trimmed) {
		return 'Please enter an equation';
	}
	
	// Check for missing arrow
	if (!trimmed.match(/[\u2192\u21CC\u21D2\u2194\u2261]|->|=>|<->|<=|→|⇌|⇒|↔|=/)) {
		return 'Missing reaction arrow. Use ->, →, ⇌, ⇒, or =';
	}
	
	// Check for invalid characters
	if (trimmed.match(/[^a-zA-Z0-9\s\+\-\=\(\)\u2192\u21CC\u21D2\u2194\u2261\+\-\d]/)) {
		return 'Invalid characters detected. Use only element symbols, numbers, +, ->, and parentheses';
	}
	
	// Check for unrecognized element symbols
	const elementPattern = /\b([A-Z][a-z]?)\b/g;
	const matches = trimmed.match(elementPattern) || [];
	
	// Common valid elements (first 20)
	const validElements = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th', 'Pa', 'U', 'Np', 'Pu'];
	
	for (const el of matches) {
		if (!validElements.includes(el)) {
			return `Unknown element symbol: ${el}. Did you mean a valid chemical element?`;
		}
	}
	
	// Fallback to original error
	return error instanceof Error ? error.message : 'Could not balance equation';
}

/**
 * Suggests corrections for common equation errors
 */
export function suggestCorrection(input: string): Suggestion | null {
	const trimmed = input.trim();
	
	// 1. Missing arrow
	if (!trimmed.includes('->') && !trimmed.includes('\u2192') && 
		!trimmed.includes('\u21CC') && !trimmed.includes('=') &&
		!trimmed.includes('\u21D2') && !trimmed.includes('\u2194')) {
		return {
			corrected: `${trimmed} -> `,
			message: "Added reaction arrow. Type the products after '->'",
			type: 'arrow'
		};
	}
	
	// 2. Common typos
	const typoCorrections: Array<{ pattern: RegExp; replacement: string; message: string }> = [
		{ pattern: /\bH20\b/g, replacement: 'H2O', message: "Fixed: Water is H₂O, not H20" },
		{ pattern: /\bH20\b/g, replacement: 'H2O', message: "Fixed: Water is H₂O" },
		{ pattern: /\bCO\b(?![2])/g, replacement: 'CO2', message: "Suggested: Did you mean CO₂ (carbon dioxide)?" },
		{ pattern: /\bNaCl2\b/g, replacement: 'NaCl', message: "Fixed: Sodium chloride is NaCl, not NaCl₂" },
		{ pattern: /\bCaCl\b/g, replacement: 'CaCl2', message: "Fixed: Calcium chloride is CaCl₂" },
		{ pattern: /\bAl2O\b/g, replacement: 'Al2O3', message: "Fixed: Aluminum oxide is Al₂O₃" },
		{ pattern: /\bFeO\b/g, replacement: 'Fe2O3', message: "Suggested: Iron(III) oxide is Fe₂O₃ (or FeO for iron(II) oxide)" },
		{ pattern: /\bSO\b(?![24])/g, replacement: 'SO2', message: "Suggested: Did you mean SO₂ (sulfur dioxide)?" },
		{ pattern: /\bNO\b(?![23])/g, replacement: 'NO2', message: "Suggested: Did you mean NO₂ (nitrogen dioxide)?" },
	];
	
	for (const { pattern, replacement, message } of typoCorrections) {
		if (pattern.test(trimmed)) {
			const corrected = trimmed.replace(pattern, replacement);
			return { corrected, message, type: 'typo' };
		}
	}
	
	// 3. Missing parentheses in polyatomic ions
	if (trimmed.includes('OH') && !trimmed.includes('OH)') && !trimmed.includes('(OH')) {
		return {
			corrected: trimmed.replace(/OH/g, '(OH)'),
			message: "Added parentheses for hydroxide ion: (OH)",
			type: 'formula'
		};
	}
	
	// 4. Missing state symbols (optional suggestion)
	if (trimmed.includes('->') && !trimmed.includes('(s)') && 
		!trimmed.includes('(l)') && !trimmed.includes('(g)') && 
		!trimmed.includes('(aq)')) {
		return {
			corrected: trimmed,
			message: "Tip: Add state symbols like (s), (l), (g), or (aq) for clarity",
			type: 'state'
		};
	}
	
	return null;
}

/**
 * Generates human-readable steps for balancing an equation
 */
function generateBalanceSteps(original: string, result: BalanceResult): string[] {
	const steps: string[] = [];
	
	if (!result.isValid || result.reactants.length === 0) {
		return steps;
	}

	// Step 1: Original equation
	steps.push(`Original: ${original}`);

	// Step 2: Identify elements
	const allElements = new Set<string>();
	[...result.reactants, ...result.products].forEach(spec => {
		const formulaElements = extractElements(spec.formula);
		Object.keys(formulaElements).forEach(el => allElements.add(el));
	});
	steps.push(`Elements to balance: ${Array.from(allElements).join(', ')}`);

	// Step 3: Count atoms on each side
	const leftCount = countAtoms(result.reactants);
	const rightCount = countAtoms(result.products);
	
	const unbalanced: string[] = [];
	Array.from(allElements).forEach(el => {
		const left = leftCount[el] || 0;
		const right = rightCount[el] || 0;
		if (left !== right) {
			unbalanced.push(`${el}: ${left} (left) vs ${right} (right)`);
		}
	});
	
	if (unbalanced.length > 0) {
		steps.push(`Unbalanced elements: ${unbalanced.join(', ')}`);
	}

	// Step 4: Final balanced equation
	steps.push(`Balanced: ${result.equation}`);

	return steps;
}

/**
 * Extracts elements and their counts from a formula
 */
function extractElements(formula: string): Record<string, number> {
	const elements: Record<string, number> = {};
	// Simple element extraction (doesn't handle complex cases like parentheses)
	const elementPattern = /([A-Z][a-z]?)(\d*)/g;
	let match;
	while ((match = elementPattern.exec(formula)) !== null) {
		const element = match[1];
		const count = match[2] ? parseInt(match[2], 10) : 1;
		elements[element] = (elements[element] || 0) + count;
	}
	return elements;
}

/**
 * Counts total atoms for each element across multiple species
 */
function countAtoms(species: Array<{ formula: string; coefficient: number }>): Record<string, number> {
	const counts: Record<string, number> = {};
	species.forEach(spec => {
		const elements = extractElements(spec.formula);
		Object.entries(elements).forEach(([el, count]) => {
			counts[el] = (counts[el] || 0) + (count * spec.coefficient);
		});
	});
	return counts;
}

/**
 * Classifies the type of chemical reaction
 */
export function classifyReaction(equation: string): 'combustion' | 'acid-base' | 'redox' | 'precipitation' | 'decomposition' | 'other' {
	const normalized = equation.toLowerCase();
	
	// Check for combustion (CxHy + O2 -> CO2 + H2O)
	if (normalized.includes('o2') && (normalized.includes('co2') || normalized.includes('h2o'))) {
		return 'combustion';
	}
	
	// Check for acid-base (H+ + OH- -> H2O)
	if ((normalized.includes('h+') || normalized.includes('hcl') || normalized.includes('h2so4')) &&
		(normalized.includes('oh-') || normalized.includes('naoh') || normalized.includes('koh'))) {
		return 'acid-base';
	}
	
	// Check for decomposition (single reactant -> multiple products)
	const arrowIndex = equation.indexOf('->');
	if (arrowIndex !== -1) {
		const reactants = equation.substring(0, arrowIndex).trim();
		const products = equation.substring(arrowIndex + 2).trim();
		const reactantCount = reactants.split('+').length;
		const productCount = products.split('+').length;
		if (reactantCount === 1 && productCount > 1) {
			return 'decomposition';
		}
		if (reactantCount > 1 && productCount === 1) {
			return 'precipitation';
		}
	}
	
	// Default to other
	return 'other';
}
