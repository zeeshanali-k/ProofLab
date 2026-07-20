import { balance } from 'fast-balance';
import type { StoichiometryResult, LimitingReactantResult, TheoreticalYieldResult } from './types';

// Atomic masses for common elements (g/mol)
const ATOMIC_MASSES: Record<string, number> = {
	// Period 1
	H: 1.008, He: 4.0026,
	
	// Period 2
	Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011, N: 14.007, O: 15.999, F: 18.998, Ne: 20.180,
	
	// Period 3
	Na: 22.990, Mg: 24.305, Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948,
	
	// Period 4
	K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996, Mn: 54.938,
	Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38, Ga: 69.723, Ge: 72.63, As: 74.922,
	Se: 78.971, Br: 79.904, Kr: 83.798,
	
	// Period 5
	Rb: 85.468, Sr: 87.62, Y: 88.906, Zr: 91.224, Nb: 92.906, Mo: 95.95, Tc: 98, Ru: 101.07,
	Rh: 102.91, Pd: 106.42, Ag: 107.87, Cd: 112.41, In: 114.82, Sn: 118.71, Sb: 121.76, Te: 127.60,
	I: 126.90, Xe: 131.29,
	
	// Period 6
	Cs: 132.91, Ba: 137.33, La: 138.91, Ce: 140.12, Pr: 140.91, Nd: 144.24, Pm: 145, Sm: 150.36,
	Eu: 151.96, Gd: 157.25, Tb: 158.93, Dy: 162.50, Ho: 164.93, Er: 167.26, Tm: 168.93, Yb: 173.05,
	Lu: 174.97, Hf: 178.49, Ta: 180.95, W: 183.84, Re: 186.21, Os: 190.23, Ir: 192.22, Pt: 195.08,
	Au: 196.97, Hg: 200.59, Tl: 204.38, Pb: 207.2, Bi: 208.98, Po: 209, At: 210, Rn: 222,
	
	// Period 7
	Fr: 223, Ra: 226, Ac: 227, Th: 232.04, Pa: 231.04, U: 238.03, Np: 237, Pu: 244
};

// Polyatomic ion masses (g/mol)
const POLYATOMIC_MASSES: Record<string, number> = {
	'NH4+': 18.039,
	'NO3-': 62.005,
	'NO2-': 46.006,
	'SO4^2-': 96.063,
	'SO3^2-': 80.063,
	'CO3^2-': 60.009,
	'HCO3-': 61.017,
	'PO4^3-': 94.971,
	'HPO4^2-': 95.977,
	'H2PO4-': 96.983,
	'OH-': 17.008,
	'CN-': 26.018,
	'C2H3O2-': 59.044,
	'ClO-': 51.453,
	'ClO2-': 67.452,
	'ClO3-': 83.451,
	'ClO4-': 99.451,
	'MnO4-': 118.936,
	'CrO4^2-': 115.99,
	'Cr2O7^2-': 215.99,
	'S2O3^2-': 112.13,
	'C4H4O6^2-': 174.10
};

/**
 * Parse a chemical formula and calculate its molar mass
 */
export function calculateMolarMass(formula: string): { mass: number; elements: Record<string, number> } {
	const elements: Record<string, number> = {};
	let mass = 0;
	
	// Parse formula with parentheses handling
	const parsed = parseFormula(formula);
	
	for (const [element, count] of Object.entries(parsed)) {
		const elementMass = ATOMIC_MASSES[element] || 0;
		if (elementMass > 0) {
			elements[element] = count;
			mass += elementMass * count;
		}
	}
	
	return { mass, elements };
}

/**
 * Parse a chemical formula into elements and counts
 */
function parseFormula(formula: string): Record<string, number> {
	const result: Record<string, number> = {};
	// Normalize Unicode subscripts/superscripts to ASCII digits
	const normalized = formula.replace(/[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹]/g, ch => {
		const map: Record<string, string> = { '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9' };
		return map[ch] || ch;
	});
	let i = 0;

	while (i < normalized.length) {
		// Parse element symbol
		let element = normalized[i];
		if (i + 1 < normalized.length && normalized[i + 1] === normalized[i + 1].toLowerCase()) {
			element += normalized[i + 1];
			i += 2;
		} else {
			i++;
		}

		// Parse count
		let countStr = '';
		while (i < normalized.length && /\d/.test(normalized[i])) {
			countStr += normalized[i];
			i++;
		}

		const count = countStr ? parseInt(countStr) : 1;
		result[element] = (result[element] || 0) + count;
	}

	return result;
}

/**
 * Calculate stoichiometry from a balanced equation
 */
export function calculateStoichiometry(
	equation: string,
	givenMass: number,
	givenSpecies: string
): StoichiometryResult {
	try {
		// Balance the equation
		const balanced = balance(normalizeEquation(equation), { showOne: true, format: 'text' });
		
		// Find the given species in reactants or products
		const speciesInfo = findSpeciesInfo(balanced.reactants, balanced.products, givenSpecies);
		
		if (!speciesInfo) {
			return {
				isValid: false,
				error: `Species '${givenSpecies}' not found in equation`
			};
		}
		
		// Calculate molar mass of given species
		const molarMass = calculateMolarMass(speciesInfo.formula);
		
		// Calculate moles of given species
		const molesGiven = givenMass / molarMass.mass;
		
		// Calculate moles of all other species
		const results: Record<string, { mass: number; moles: number; formula: string }> = {};
		
		// Process reactants
		for (const reactant of balanced.reactants) {
			const reactantMolarMass = calculateMolarMass(reactant.formula);
			const moleRatio = reactant.coefficient / speciesInfo.coefficient;
			const moles = molesGiven * moleRatio;
			const mass = moles * reactantMolarMass.mass;
			
			results[reactant.formula] = {
				mass,
				moles,
				formula: reactant.formula
			};
		}
		
		// Process products
		for (const product of balanced.products) {
			const productMolarMass = calculateMolarMass(product.formula);
			const moleRatio = product.coefficient / speciesInfo.coefficient;
			const moles = molesGiven * moleRatio;
			const mass = moles * productMolarMass.mass;
			
			results[product.formula] = {
				mass,
				moles,
				formula: product.formula
			};
		}
		
		return {
			isValid: true,
			equation: balanced.equation,
			givenSpecies,
			givenMass,
			molesGiven,
			molarMass: molarMass.mass,
			results,
			reactants: balanced.reactants,
			products: balanced.products
		};
	} catch (error) {
		return {
			isValid: false,
			error: `Failed to calculate stoichiometry: ${error}`
		};
	}
}

/**
 * Find species info in reactants or products
 */
function findSpeciesInfo(
	reactants: Array<{ formula: string; coefficient: number }>,
	products: Array<{ formula: string; coefficient: number }>,
	species: string
): { formula: string; coefficient: number; isReactant: boolean } | null {
	// Check reactants
	for (const reactant of reactants) {
		if (reactant.formula === species) {
			return { ...reactant, isReactant: true };
		}
	}
	
	// Check products
	for (const product of products) {
		if (product.formula === species) {
			return { ...product, isReactant: false };
		}
	}
	
	return null;
}

/**
 * Normalize equation for balancing
 */
function normalizeEquation(equation: string): string {
	return equation
		.replace(/[\u2192\u21CC\u21D2\u2194]|=>|<->|<=/g, '->')
		.replace(/\s+/g, ' ')
		.trim();
}

/**
 * Find limiting reactant
 */
export function findLimitingReactant(
	equation: string,
	masses: Record<string, number>
): LimitingReactantResult {
	try {
		const balanced = balance(normalizeEquation(equation), { showOne: true, format: 'text' });
		
		const limitingReactant: { species: string; moles: number; mass: number } | null = null;
		const excessReactants: Array<{ species: string; moles: number; mass: number; molesRequired: number }> = [];
		
		// Calculate moles for each reactant
		const reactantMoles: Record<string, number> = {};
		const reactantMolarMasses: Record<string, number> = {};
		
		for (const reactant of balanced.reactants) {
			const molarMass = calculateMolarMass(reactant.formula);
			const mass = masses[reactant.formula] || 0;
			const moles = mass / molarMass.mass;
			
			reactantMoles[reactant.formula] = moles;
			reactantMolarMasses[reactant.formula] = molarMass.mass;
		}
		
		// Find limiting reactant
		let limiting: { species: string; moleRatio: number; moles: number } | null = null;
		
		for (const reactant of balanced.reactants) {
			const moleRatio = reactant.coefficient;
			const moles = reactantMoles[reactant.formula] || 0;
			const ratio = moles / moleRatio;
			
			if (!limiting || ratio < (limiting.moles / limiting.moleRatio)) {
				limiting = { species: reactant.formula, moleRatio, moles };
			}
		}
		
		// Calculate excess
		if (limiting) {
			for (const reactant of balanced.reactants) {
				if (reactant.formula !== limiting.species) {
					const moleRatio = reactant.coefficient / limiting.moleRatio;
					const molesRequired = limiting.moles * moleRatio;
					const molesAvailable = reactantMoles[reactant.formula] || 0;
					const molesExcess = molesAvailable - molesRequired;
					
					if (molesExcess > 0) {
						excessReactants.push({
							species: reactant.formula,
							moles: molesAvailable,
							mass: (molesAvailable * reactantMolarMasses[reactant.formula]) || 0,
							molesRequired
						});
					}
				}
			}
		}
		
		return {
			isValid: true,
			equation: balanced.equation,
			limitingReactant: limiting?.species || '',
			excessReactants,
			reactantMoles,
			reactantMolarMasses
		};
	} catch (error) {
		return {
			isValid: false,
			error: `Failed to find limiting reactant: ${error}`
		};
	}
}

/**
 * Calculate theoretical yield
 */
export function calculateTheoreticalYield(
	equation: string,
	limitingReactantMass: number,
	limitingReactant: string,
	targetProduct: string
): TheoreticalYieldResult {
	try {
		const balanced = balance(normalizeEquation(equation), { showOne: true, format: 'text' });
		
		// Find limiting reactant info
		const limitingReactantInfo = balanced.reactants.find(r => r.formula === limitingReactant);
		const targetProductInfo = balanced.products.find(p => p.formula === targetProduct);
		
		if (!limitingReactantInfo || !targetProductInfo) {
			return {
				isValid: false,
				error: 'Species not found in equation'
			};
		}
		
		// Calculate molar masses
		const limitingMolarMass = calculateMolarMass(limitingReactant);
		const productMolarMass = calculateMolarMass(targetProduct);
		
		// Calculate moles of limiting reactant
		const molesLimiting = limitingReactantMass / limitingMolarMass.mass;
		
		// Calculate moles of target product
		const moleRatio = targetProductInfo.coefficient / limitingReactantInfo.coefficient;
		const molesProduct = molesLimiting * moleRatio;
		
		// Calculate theoretical yield
		const theoreticalYield = molesProduct * productMolarMass.mass;
		
		return {
			isValid: true,
			equation: balanced.equation,
			limitingReactant,
			limitingReactantMass,
			targetProduct,
			theoreticalYield,
			moleRatio,
			limitingMolarMass: limitingMolarMass.mass,
			productMolarMass: productMolarMass.mass
		};
	} catch (error) {
		return {
			isValid: false,
			error: `Failed to calculate theoretical yield: ${error}`
		};
	}
}

/**
 * Calculate percent yield
 */
export function calculatePercentYield(
	theoreticalYield: number,
	actualYield: number
): number {
	if (theoreticalYield === 0) return 0;
	return (actualYield / theoreticalYield) * 100;
}

/**
 * Get element atomic mass
 */
export function getAtomicMass(symbol: string): number {
	return ATOMIC_MASSES[symbol] || 0;
}

/**
 * Get polyatomic ion mass
 */
export function getPolyatomicMass(ion: string): number {
	return POLYATOMIC_MASSES[ion] || 0;
}

export default {
	calculateMolarMass,
	calculateStoichiometry,
	findLimitingReactant,
	calculateTheoreticalYield,
	calculatePercentYield,
	getAtomicMass,
	getPolyatomicMass,
	ATOMIC_MASSES,
	POLYATOMIC_MASSES
};
