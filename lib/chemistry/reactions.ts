import type { Suggestion } from './types';

// Common reaction patterns for product prediction
interface ReactionPattern {
	type: 'combustion' | 'acid-base' | 'redox' | 'precipitation' | 'decomposition' | 'synthesis' | 'double-displacement';
	reactants: string[];
	products: string[];
	description: string;
	priority: number; // Higher priority = checked first
}

// Database of common reaction predictions
const REACTION_DATABASE: ReactionPattern[] = [
	// Combustion reactions (hydrocarbon + O2)
	{
		type: 'combustion',
		reactants: ['CH4', 'O2'],
		products: ['CO2', 'H2O'],
		description: 'Complete combustion of methane produces carbon dioxide and water',
		priority: 100
	},
	{
		type: 'combustion',
		reactants: ['C2H6', 'O2'],
		products: ['CO2', 'H2O'],
		description: 'Complete combustion of ethane',
		priority: 99
	},
	{
		type: 'combustion',
		reactants: ['C3H8', 'O2'],
		products: ['CO2', 'H2O'],
		description: 'Complete combustion of propane',
		priority: 99
	},
	{
		type: 'combustion',
		reactants: ['C4H10', 'O2'],
		products: ['CO2', 'H2O'],
		description: 'Complete combustion of butane',
		priority: 99
	},
	{
		type: 'combustion',
		reactants: ['C2H5OH', 'O2'],
		products: ['CO2', 'H2O'],
		description: 'Complete combustion of ethanol',
		priority: 98
	},
	{
		type: 'combustion',
		reactants: ['CH3OH', 'O2'],
		products: ['CO2', 'H2O'],
		description: 'Complete combustion of methanol',
		priority: 98
	},
	{
		type: 'combustion',
		reactants: ['C6H12O6', 'O2'],
		products: ['CO2', 'H2O'],
		description: 'Complete combustion of glucose',
		priority: 97
	},
	
	// Acid-Base reactions
	{
		type: 'acid-base',
		reactants: ['HCl', 'NaOH'],
		products: ['NaCl', 'H2O'],
		description: 'Hydrochloric acid reacts with sodium hydroxide to form sodium chloride and water',
		priority: 100
	},
	{
		type: 'acid-base',
		reactants: ['HCl', 'KOH'],
		products: ['KCl', 'H2O'],
		description: 'Hydrochloric acid reacts with potassium hydroxide',
		priority: 99
	},
	{
		type: 'acid-base',
		reactants: ['H2SO4', 'NaOH'],
		products: ['Na2SO4', 'H2O'],
		description: 'Sulfuric acid reacts with sodium hydroxide',
		priority: 99
	},
	{
		type: 'acid-base',
		reactants: ['H2SO4', 'KOH'],
		products: ['K2SO4', 'H2O'],
		description: 'Sulfuric acid reacts with potassium hydroxide',
		priority: 98
	},
	{
		type: 'acid-base',
		reactants: ['HNO3', 'NaOH'],
		products: ['NaNO3', 'H2O'],
		description: 'Nitric acid reacts with sodium hydroxide',
		priority: 98
	},
	{
		type: 'acid-base',
		reactants: ['HNO3', 'KOH'],
		products: ['KNO3', 'H2O'],
		description: 'Nitric acid reacts with potassium hydroxide',
		priority: 97
	},
	{
		type: 'acid-base',
		reactants: ['H2CO3', 'NaOH'],
		products: ['Na2CO3', 'H2O'],
		description: 'Carbonic acid reacts with sodium hydroxide',
		priority: 97
	},
	{
		type: 'acid-base',
		reactants: ['CH3COOH', 'NaOH'],
		products: ['CH3COONa', 'H2O'],
		description: 'Acetic acid reacts with sodium hydroxide to form sodium acetate and water',
		priority: 97
	},
	{
		type: 'acid-base',
		reactants: ['HCl', 'NH3'],
		products: ['NH4Cl'],
		description: 'Hydrochloric acid reacts with ammonia to form ammonium chloride',
		priority: 96
	},
	
	// Precipitation reactions
	{
		type: 'precipitation',
		reactants: ['AgNO3', 'NaCl'],
		products: ['AgCl', 'NaNO3'],
		description: 'Silver nitrate reacts with sodium chloride to form silver chloride precipitate',
		priority: 100
	},
	{
		type: 'precipitation',
		reactants: ['AgNO3', 'KCl'],
		products: ['AgCl', 'KNO3'],
		description: 'Silver nitrate reacts with potassium chloride',
		priority: 99
	},
	{
		type: 'precipitation',
		reactants: ['Pb(NO3)2', 'NaI'],
		products: ['PbI2', 'NaNO3'],
		description: 'Lead nitrate reacts with sodium iodide to form lead iodide precipitate',
		priority: 99
	},
	{
		type: 'precipitation',
		reactants: ['Pb(NO3)2', 'KI'],
		products: ['PbI2', 'KNO3'],
		description: 'Lead nitrate reacts with potassium iodide',
		priority: 98
	},
	{
		type: 'precipitation',
		reactants: ['BaCl2', 'Na2SO4'],
		products: ['BaSO4', 'NaCl'],
		description: 'Barium chloride reacts with sodium sulfate to form barium sulfate precipitate',
		priority: 98
	},
	{
		type: 'precipitation',
		reactants: ['BaCl2', 'K2SO4'],
		products: ['BaSO4', 'KCl'],
		description: 'Barium chloride reacts with potassium sulfate',
		priority: 97
	},
	{
		type: 'precipitation',
		reactants: ['CaCl2', 'Na2CO3'],
		products: ['CaCO3', 'NaCl'],
		description: 'Calcium chloride reacts with sodium carbonate to form calcium carbonate precipitate',
		priority: 97
	},
	{
		type: 'precipitation',
		reactants: ['CuSO4', 'NaOH'],
		products: ['Cu(OH)2', 'Na2SO4'],
		description: 'Copper sulfate reacts with sodium hydroxide to form copper hydroxide precipitate',
		priority: 97
	},
	
	// Decomposition reactions
	{
		type: 'decomposition',
		reactants: ['H2O2'],
		products: ['H2O', 'O2'],
		description: 'Hydrogen peroxide decomposes into water and oxygen',
		priority: 100
	},
	{
		type: 'decomposition',
		reactants: ['CaCO3'],
		products: ['CaO', 'CO2'],
		description: 'Calcium carbonate decomposes into calcium oxide and carbon dioxide',
		priority: 99
	},
	{
		type: 'decomposition',
		reactants: ['KClO3'],
		products: ['KCl', 'O2'],
		description: 'Potassium chlorate decomposes into potassium chloride and oxygen',
		priority: 99
	},
	{
		type: 'decomposition',
		reactants: ['NaHCO3'],
		products: ['Na2CO3', 'H2O', 'CO2'],
		description: 'Sodium bicarbonate decomposes into sodium carbonate, water, and carbon dioxide',
		priority: 98
	},
	{
		type: 'decomposition',
		reactants: ['H2CO3'],
		products: ['H2O', 'CO2'],
		description: 'Carbonic acid decomposes into water and carbon dioxide',
		priority: 98
	},
	{
		type: 'decomposition',
		reactants: ['NH4NO3'],
		products: ['N2O', 'H2O'],
		description: 'Ammonium nitrate decomposes into nitrous oxide and water',
		priority: 97
	},
	
	// Synthesis reactions
	{
		type: 'synthesis',
		reactants: ['H2', 'O2'],
		products: ['H2O'],
		description: 'Hydrogen and oxygen combine to form water',
		priority: 100
	},
	{
		type: 'synthesis',
		reactants: ['N2', 'H2'],
		products: ['NH3'],
		description: 'Nitrogen and hydrogen combine to form ammonia (Haber process)',
		priority: 99
	},
	{
		type: 'synthesis',
		reactants: ['C', 'O2'],
		products: ['CO2'],
		description: 'Carbon and oxygen combine to form carbon dioxide',
		priority: 99
	},
	{
		type: 'synthesis',
		reactants: ['S', 'O2'],
		products: ['SO2'],
		description: 'Sulfur and oxygen combine to form sulfur dioxide',
		priority: 98
	},
	{
		type: 'synthesis',
		reactants: ['Na', 'Cl2'],
		products: ['NaCl'],
		description: 'Sodium and chlorine combine to form sodium chloride',
		priority: 98
	},
	
	// Double displacement reactions
	{
		type: 'double-displacement',
		reactants: ['NaCl', 'AgNO3'],
		products: ['AgCl', 'NaNO3'],
		description: 'Sodium chloride reacts with silver nitrate to form silver chloride and sodium nitrate',
		priority: 99
	},
	{
		type: 'double-displacement',
		reactants: ['KI', 'Pb(NO3)2'],
		products: ['PbI2', 'KNO3'],
		description: 'Potassium iodide reacts with lead nitrate to form lead iodide and potassium nitrate',
		priority: 98
	},
	
	// Redox reactions
	{
		type: 'redox',
		reactants: ['Zn', 'CuSO4'],
		products: ['ZnSO4', 'Cu'],
		description: 'Zinc displaces copper from copper sulfate solution',
		priority: 100
	},
	{
		type: 'redox',
		reactants: ['Fe', 'CuSO4'],
		products: ['FeSO4', 'Cu'],
		description: 'Iron displaces copper from copper sulfate solution',
		priority: 99
	},
	{
		type: 'redox',
		reactants: ['Mg', 'HCl'],
		products: ['MgCl2', 'H2'],
		description: 'Magnesium reacts with hydrochloric acid to produce magnesium chloride and hydrogen gas',
		priority: 99
	},
	{
		type: 'redox',
		reactants: ['Zn', 'HCl'],
		products: ['ZnCl2', 'H2'],
		description: 'Zinc reacts with hydrochloric acid to produce zinc chloride and hydrogen gas',
		priority: 98
	},
	{
		type: 'redox',
		reactants: ['Cu', 'AgNO3'],
		products: ['Cu(NO3)2', 'Ag'],
		description: 'Copper displaces silver from silver nitrate solution',
		priority: 98
	},
	{
		type: 'redox',
		reactants: ['Cl2', 'NaBr'],
		products: ['NaCl', 'Br2'],
		description: 'Chlorine displaces bromine from sodium bromide solution',
		priority: 97
	}
];

// Common element charges for product prediction
const ELEMENT_CHARGES: Record<string, number> = {
	// Alkali metals (+1)
	'Li': 1, 'Na': 1, 'K': 1, 'Rb': 1, 'Cs': 1,
	// Alkaline earth metals (+2)
	'Be': 2, 'Mg': 2, 'Ca': 2, 'Sr': 2, 'Ba': 2,
	// Transition metals (common charges)
	'Fe': 2, 'Fe3': 3, 'Cu': 2, 'Cu1': 1, 'Zn': 2, 'Ag': 1, 'Hg': 2, 'Hg2': 1,
	// Boron group (+3)
	'B': 3, 'Al': 3, 'Ga': 3,
	// Carbon group (+4, +2)
	'C': 4, 'Si': 4, 'Sn': 4,
	// Nitrogen group (+5, +3, -3)
	'N': -3, 'P': -3,
	// Chalcogens (-2)
	'O': -2, 'S': -2, 'Se': -2,
	// Halogens (-1)
	'F': -1, 'Cl': -1, 'Br': -1, 'I': -1,
	// Hydrogen (+1 usually, -1 in hydrides)
	'H': 1
};

// Polyatomic ions
const POLYATOMIC_IONS: Record<string, { charge: number; formula: string }> = {
	// +1 cations
	'NH4+': { charge: 1, formula: 'NH4+' },
	// -1 anions
	'OH-': { charge: -1, formula: 'OH-' },
	'NO3-': { charge: -1, formula: 'NO3-' },
	'NO2-': { charge: -1, formula: 'NO2-' },
	'HCO3-': { charge: -1, formula: 'HCO3-' },
	'CH3COO-': { charge: -1, formula: 'CH3COO-' },
	'ClO-': { charge: -1, formula: 'ClO-' },
	'ClO2-': { charge: -1, formula: 'ClO2-' },
	'ClO3-': { charge: -1, formula: 'ClO3-' },
	'ClO4-': { charge: -1, formula: 'ClO4-' },
	'CN-': { charge: -1, formula: 'CN-' },
	'SCN-': { charge: -1, formula: 'SCN-' },
	'MnO4-': { charge: -1, formula: 'MnO4-' },
	// -2 anions
	'CO3^2-': { charge: -2, formula: 'CO3^2-' },
	'SO4^2-': { charge: -2, formula: 'SO4^2-' },
	'SO3^2-': { charge: -2, formula: 'SO3^2-' },
	'S2O3^2-': { charge: -2, formula: 'S2O3^2-' },
	'CrO4^2-': { charge: -2, formula: 'CrO4^2-' },
	'C2O4^2-': { charge: -2, formula: 'C2O4^2-' },
	// -3 anions
	'PO4^3-': { charge: -3, formula: 'PO4^3-' },
	'PO3^3-': { charge: -3, formula: 'PO3^3-' }
};

/**
 * Normalize a chemical formula (remove spaces, handle charges)
 */
function normalizeFormula(formula: string): string {
	return formula
		.replace(/\s+/g, '')
		.replace(/[+\-]\d*/g, '')  // Remove charges like +2, -1
		.toUpperCase();
}

/**
 * Check if a formula matches another formula (ignoring coefficients)
 */
function formulasMatch(formula1: string, formula2: string): boolean {
	const norm1 = normalizeFormula(formula1).replace(/\d+/g, '');
	const norm2 = normalizeFormula(formula2).replace(/\d+/g, '');
	return norm1 === norm2;
}

/**
 * Parse a chemical equation into reactants and products
 */
function parseEquation(equation: string): { reactants: string[]; products: string[] } {
	const arrowMatch = equation.match(/([^->⇌⇒↔=]+)[->⇌⇒↔=]+([^->⇌⇒↔=]*)/);
	if (!arrowMatch) {
		// If no arrow, assume it's reactants only
		const reactants = equation
			.split('+')
			.map(s => s.trim())
			.filter(s => s.length > 0);
		return { reactants, products: [] };
	}
	
	const reactants = arrowMatch[1]
		.split('+')
		.map(s => s.trim())
		.filter(s => s.length > 0);
	
	const products = arrowMatch[2]
		.split('+')
		.map(s => s.trim())
		.filter(s => s.length > 0);
	
	return { reactants, products };
}

/**
 * Find matching reaction pattern from the database
 */
function findMatchingPattern(reactants: string[]): ReactionPattern | null {
	const normalizedReactants = reactants.map(r => normalizeFormula(r));
	
	// Sort by priority (highest first)
	const sortedPatterns = [...REACTION_DATABASE].sort((a, b) => b.priority - a.priority);
	
	for (const pattern of sortedPatterns) {
		const patternReactants = pattern.reactants.map(r => normalizeFormula(r));
		
		// Check if all pattern reactants are present in the input
		const allPresent = patternReactants.every(patternReactant =>
			normalizedReactants.some(inputReactant =>
				formulasMatch(inputReactant, patternReactant)
			)
		);
		
		// Check if the number of reactants matches
		if (allPresent && patternReactants.length === normalizedReactants.length) {
			return pattern;
		}
		
		// If we have a subset match (for incomplete equations)
		if (allPresent && patternReactants.length <= normalizedReactants.length) {
			return pattern;
		}
	}
	
	return null;
}

/**
 * Predict products from reactants
 */
export function predictProducts(reactants: string[]): { products: string[]; reactionType: string; description: string; confidence: number } {
	const normalizedReactants = reactants.map(r => normalizeFormula(r));
	
	// Try to find a matching pattern
	const matchingPattern = findMatchingPattern(reactants);
	
	if (matchingPattern) {
		return {
			products: matchingPattern.products,
			reactionType: matchingPattern.type,
			description: matchingPattern.description,
			confidence: 0.95
		};
	}
	
	// Try to predict based on reaction type classification
	const reactantString = reactants.join(' + ');
	const classifiedType = classifyReaction(reactantString + ' -> ');
	
	// Generate generic products based on type
	const genericProducts = generateGenericProducts(reactants, classifiedType);
	
	if (genericProducts.length > 0) {
		return {
			products: genericProducts,
			reactionType: classifiedType,
			description: `Predicted ${classifiedType} reaction products`,
			confidence: 0.7
		};
	}
	
	// No prediction possible
	return {
		products: [],
			reactionType: 'unknown',
			description: 'Unable to predict products for this reaction',
		confidence: 0
	};
}

/**
 * Generate generic products based on reaction type
 */
function generateGenericProducts(reactants: string[], reactionType: string): string[] {
	const products: string[] = [];
	
	switch (reactionType) {
		case 'combustion':
			// Hydrocarbon + O2 -> CO2 + H2O
			if (reactants.some(r => r.includes('C')) && reactants.some(r => r.includes('H'))) {
				products.push('CO2', 'H2O');
			} else if (reactants.some(r => r.includes('C'))) {
				products.push('CO2');
			} else if (reactants.some(r => r.includes('H'))) {
				products.push('H2O');
			}
			break;
		
		case 'acid-base':
			// Acid + Base -> Salt + Water
			products.push('H2O');
			// Try to generate salt
			const acid = reactants.find(r => isAcid(r));
			const base = reactants.find(r => isBase(r));
			if (acid && base) {
				const salt = generateSalt(acid, base);
				if (salt) products.push(salt);
			}
			break;
		
		case 'precipitation':
			// Look for common precipitates
			if (reactants.some(r => r.includes('Ag')) && reactants.some(r => r.includes('Cl'))) {
				products.push('AgCl');
			} else if (reactants.some(r => r.includes('Pb')) && reactants.some(r => r.includes('I'))) {
				products.push('PbI2');
			} else if (reactants.some(r => r.includes('Ba')) && reactants.some(r => r.includes('SO4'))) {
				products.push('BaSO4');
			} else if (reactants.some(r => r.includes('Ca')) && reactants.some(r => r.includes('CO3'))) {
				products.push('CaCO3');
			}
			break;
		
		case 'decomposition':
			// Single compound -> multiple products
			if (reactants.length === 1) {
				const compound = reactants[0];
				if (compound.includes('H2O2')) {
					products.push('H2O', 'O2');
				} else if (compound.includes('CaCO3')) {
					products.push('CaO', 'CO2');
				} else if (compound.includes('KClO3')) {
					products.push('KCl', 'O2');
				} else if (compound.includes('H2CO3')) {
					products.push('H2O', 'CO2');
				}
			}
			break;
		
		case 'synthesis':
			// Multiple reactants -> single product
			if (reactants.length === 2) {
				// Common synthesis reactions
				if (reactants.some(r => r.includes('H2')) && reactants.some(r => r.includes('O2'))) {
					products.push('H2O');
				} else if (reactants.some(r => r.includes('N2')) && reactants.some(r => r.includes('H2'))) {
					products.push('NH3');
				} else if (reactants.some(r => r.includes('C')) && reactants.some(r => r.includes('O2'))) {
					products.push('CO2');
				}
			}
			break;
		
		case 'redox':
			// Metal displacement reactions
			const metal = reactants.find(r => isMetal(r));
			const compound = reactants.find(r => !isMetal(r) && !isAcid(r) && !isBase(r));
			if (metal && compound) {
				const metalSymbol = metal.replace(/\d+/g, '');
				const compoundParts = parseCompound(compound);
				if (compoundParts) {
					// Simple displacement: Metal + Compound -> MetalCompound + DisplacedMetal
					products.push(compoundParts.cation + metalSymbol);
					products.push(compoundParts.anion);
				}
			}
			break;
	}
	
	return products.filter(p => p.length > 0);
}

/**
 * Check if a compound is an acid
 */
function isAcid(compound: string): boolean {
	const normalized = normalizeFormula(compound);
	return normalized.startsWith('H') && !['H2', 'H2O', 'H2O2'].includes(normalized);
}

/**
 * Check if a compound is a base
 */
function isBase(compound: string): boolean {
	const normalized = normalizeFormula(compound);
	return normalized.includes('OH') || normalized.includes('NH3');
}

/**
 * Check if a compound is a metal
 */
function isMetal(compound: string): boolean {
	const normalized = normalizeFormula(compound);
	// Single element metals
	const singleElement = normalized.replace(/\d+/g, '');
	if (singleElement.length <= 2) {
		const metalElements = ['Li', 'Na', 'K', 'Rb', 'Cs', 'Be', 'Mg', 'Ca', 'Sr', 'Ba', 
			'Fe', 'Cu', 'Zn', 'Ag', 'Hg', 'Al', 'Sn', 'Pb'];
		return metalElements.includes(singleElement);
	}
	return false;
}

/**
 * Parse a compound into cation and anion
 */
function parseCompound(compound: string): { cation: string; anion: string } | null {
	const normalized = normalizeFormula(compound);
	
	// Simple binary compounds
	if (normalized.includes('SO4')) {
		return { cation: normalized.replace('SO4', ''), anion: 'SO4' };
	} else if (normalized.includes('NO3')) {
		return { cation: normalized.replace('NO3', ''), anion: 'NO3' };
	} else if (normalized.includes('CO3')) {
		return { cation: normalized.replace('CO3', ''), anion: 'CO3' };
	} else if (normalized.includes('Cl')) {
		return { cation: normalized.replace('Cl', ''), anion: 'Cl' };
	} else if (normalized.includes('Br')) {
		return { cation: normalized.replace('Br', ''), anion: 'Br' };
	} else if (normalized.includes('I')) {
		return { cation: normalized.replace('I', ''), anion: 'I' };
	} else if (normalized.includes('S')) {
		return { cation: normalized.replace('S', ''), anion: 'S' };
	} else if (normalized.includes('O')) {
		return { cation: normalized.replace('O', ''), anion: 'O' };
	}
	
	return null;
}

/**
 * Generate salt from acid and base
 */
function generateSalt(acid: string, base: string): string | null {
	const acidFormula = normalizeFormula(acid);
	const baseFormula = normalizeFormula(base);
	
	// Simple cases
	if (acidFormula === 'HCL' && baseFormula === 'NAOH') return 'NaCl';
	if (acidFormula === 'HCL' && baseFormula === 'KOH') return 'KCl';
	if (acidFormula === 'H2SO4' && baseFormula === 'NAOH') return 'Na2SO4';
	if (acidFormula === 'H2SO4' && baseFormula === 'KOH') return 'K2SO4';
	if (acidFormula === 'HNO3' && baseFormula === 'NAOH') return 'NaNO3';
	if (acidFormula === 'HNO3' && baseFormula === 'KOH') return 'KNO3';
	if (acidFormula === 'CH3COOH' && baseFormula === 'NAOH') return 'CH3COONa';
	
	// Extract anion from acid
	let anion = '';
	if (acidFormula.includes('SO4')) anion = 'SO4';
	else if (acidFormula.includes('NO3')) anion = 'NO3';
	else if (acidFormula.includes('CO3')) anion = 'CO3';
	else if (acidFormula.includes('PO4')) anion = 'PO4';
	else if (acidFormula.includes('CL')) anion = 'Cl';
	else if (acidFormula.includes('BR')) anion = 'Br';
	else if (acidFormula.includes('I')) anion = 'I';
	
	// Extract cation from base
	let cation = '';
	if (baseFormula.includes('NA')) cation = 'Na';
	else if (baseFormula.includes('K')) cation = 'K';
	else if (baseFormula.includes('CA')) cation = 'Ca';
	else if (baseFormula.includes('MG')) cation = 'Mg';
	else if (baseFormula.includes('NH4')) cation = 'NH4';
	
	if (anion && cation) {
		// Balance charges
		const anionCharge = getAnionCharge(anion);
		const cationCharge = getCationCharge(cation);
		
		if (anionCharge && cationCharge) {
			const cationCount = Math.abs(anionCharge);
			const anionCount = Math.abs(cationCharge);
			
			// Simplify counts
			const gcd = findGCD(cationCount, anionCount);
			const simplifiedCationCount = cationCount / gcd;
			const simplifiedAnionCount = anionCount / gcd;
			
			if (simplifiedCationCount === 1 && simplifiedAnionCount === 1) {
				return cation + anion;
			} else if (simplifiedAnionCount === 1) {
				return cation + simplifiedCationCount + anion;
			} else if (simplifiedCationCount === 1) {
				return cation + anion + simplifiedAnionCount;
			} else {
				return cation + simplifiedCationCount + anion + simplifiedAnionCount;
			}
		}
		
		return cation + anion;
	}
	
	return null;
}

/**
 * Get charge of an anion
 */
function getAnionCharge(anion: string): number | null {
	const anionCharges: Record<string, number> = {
		'SO4': -2, 'SO3': -2, 'CO3': -2, 'S2O3': -2, 'CrO4': -2, 'C2O4': -2,
		'PO4': -3, 'PO3': -3,
		'Cl': -1, 'Br': -1, 'I': -1, 'F': -1, 'CN': -1, 'SCN': -1, 'OH': -1,
		'NO3': -1, 'NO2': -1, 'HCO3': -1, 'CH3COO': -1, 'ClO': -1, 'ClO2': -1, 'ClO3': -1, 'ClO4': -1,
		'O': -2, 'S': -2
	};
	return anionCharges[anion] || null;
}

/**
 * Get charge of a cation
 */
function getCationCharge(cation: string): number | null {
	const cationCharges: Record<string, number> = {
		'Li': 1, 'Na': 1, 'K': 1, 'Rb': 1, 'Cs': 1, 'NH4': 1, 'Ag': 1,
		'Be': 2, 'Mg': 2, 'Ca': 2, 'Sr': 2, 'Ba': 2, 'Cu': 2, 'Zn': 2, 'Hg': 2,
		'B': 3, 'Al': 3,
		'Fe': 2, 'Fe3': 3
	};
	return cationCharges[cation] || null;
}

/**
 * Find greatest common divisor
 */
function findGCD(a: number, b: number): number {
	if (b === 0) return a;
	return findGCD(b, a % b);
}

/**
 * Classify reaction type (imported from balancer.ts logic)
 */
function classifyReaction(equation: string): 'combustion' | 'acid-base' | 'redox' | 'precipitation' | 'decomposition' | 'synthesis' | 'double-displacement' | 'other' {
	const normalized = equation.toLowerCase();
	
	// Check for combustion (CxHy + O2 -> CO2 + H2O)
	if (normalized.includes('o2') && (normalized.includes('co2') || normalized.includes('h2o'))) {
		return 'combustion';
	}

	// Check for acid-base (H+ + OH- -> H2O)
	if ((normalized.includes('h+') || normalized.includes('hcl') || normalized.includes('h2so4') || normalized.includes('hno3')) &&
		(normalized.includes('oh-') || normalized.includes('naoh') || normalized.includes('koh') || normalized.includes('nh3'))) {
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

	// Check for synthesis
	if (arrowIndex !== -1) {
		const reactants = equation.substring(0, arrowIndex).trim();
		const productCount = equation.substring(arrowIndex + 2).trim().split('+').length;
		if (reactants.split('+').length > 1 && productCount === 1) {
			return 'synthesis';
		}
	}

	// Check for double displacement (two compounds -> two compounds)
	if (arrowIndex !== -1) {
		const reactantParts = equation.substring(0, arrowIndex).split('+');
		const productParts = equation.substring(arrowIndex + 2).split('+');
		if (reactantParts.length === 2 && productParts.length === 2) {
			const allCompounds = [...reactantParts, ...productParts];
			if (allCompounds.every(p => p.trim().length > 1)) {
				return 'double-displacement';
			}
		}
	}

	// Default to other
	return 'other';
}

/**
 * Auto-complete an incomplete equation (reactants only)
 */
export function autoCompleteEquation(reactants: string[]): {
	fullEquation: string;
	products: string[];
	reactionType: string;
	description: string;
	confidence: number;
	balanced: string;
} {
	// Predict products
	const prediction = predictProducts(reactants);
	
	if (prediction.products.length === 0) {
		return {
			fullEquation: reactants.join(' + ') + ' -> ',
			products: [],
			reactionType: 'unknown',
			description: 'Unable to predict products',
			confidence: 0,
			balanced: reactants.join(' + ') + ' -> '
		};
	}
	
	// Build full equation
	const fullEquation = reactants.join(' + ') + ' -> ' + prediction.products.join(' + ');
	
	// Try to balance it (import balance from fast-balance would be needed)
	// For now, return unbalanced but with predicted products
	return {
		fullEquation,
		products: prediction.products,
		reactionType: prediction.reactionType,
		description: prediction.description,
		confidence: prediction.confidence,
		balanced: fullEquation // Placeholder - would need balancing
	};
}

/**
 * Get all possible products for given reactants
 */
export function getAllPossibleProducts(reactants: string[]): Array<{
	products: string[];
	reactionType: string;
	description: string;
	confidence: number;
}> {
	// Find all matching patterns
	const normalizedReactants = reactants.map(r => normalizeFormula(r));
	const allPatterns: ReactionPattern[] = [];
	
	// Check each pattern
	for (const pattern of REACTION_DATABASE) {
		const patternReactants = pattern.reactants.map(r => normalizeFormula(r));
		
		// Check if all pattern reactants are present
		const allPresent = patternReactants.every(patternReactant =>
			normalizedReactants.some(inputReactant =>
				formulasMatch(inputReactant, patternReactant)
			)
		);
		
		if (allPresent) {
			allPatterns.push(pattern);
		}
	}
	
	// Convert to result format
	return allPatterns.map(pattern => ({
		products: pattern.products,
		reactionType: pattern.type,
		description: pattern.description,
		confidence: pattern.priority / 100
	}));
}

/**
 * Get reaction information including predicted products
 */
export function getReactionInfo(equation: string): {
	originalEquation: string;
	reactants: string[];
	products: string[];
	predictedProducts: string[];
	reactionType: string;
	description: string;
	confidence: number;
	isComplete: boolean;
	isBalanced: boolean;
} {
	const parsed = parseEquation(equation);
	
	// Check if equation has products
	const isComplete = parsed.products.length > 0;
	
	// Predict products if not complete
	let predictedProducts: string[] = [];
	let confidence = 0;
	let description = '';
	let reactionType = 'other';
	
	if (!isComplete) {
		const prediction = predictProducts(parsed.reactants);
		predictedProducts = prediction.products;
		confidence = prediction.confidence;
		description = prediction.description;
		reactionType = prediction.reactionType;
	} else {
		// Classify complete equation
		reactionType = classifyReaction(equation);
		description = getReactionDescription(reactionType, parsed.reactants, parsed.products);
		predictedProducts = parsed.products;
		confidence = 1.0;
	}
	
	return {
		originalEquation: equation,
		reactants: parsed.reactants,
		products: parsed.products,
		predictedProducts,
		reactionType,
		description,
		confidence,
		isComplete,
		isBalanced: false // Would need balancing check
	};
}

/**
 * Get description for a reaction
 */
function getReactionDescription(reactionType: string, reactants: string[], products: string[]): string {
	switch (reactionType) {
		case 'combustion':
			return `Combustion: ${reactants.join(' + ')} burn in oxygen to produce ${products.join(' + ')}`;
		case 'acid-base':
			return `Acid-base neutralization: ${reactants.join(' + ')} react to form ${products.join(' + ')}`;
		case 'precipitation':
			return `Precipitation: ${reactants.join(' + ')} form ${products.join(' + ')} precipitate`;
		case 'decomposition':
			return `Decomposition: ${reactants.join(' + ')} break down into ${products.join(' + ')}`;
		case 'synthesis':
			return `Synthesis: ${reactants.join(' + ')} combine to form ${products.join(' + ')}`;
		case 'double-displacement':
			return `Double displacement: ${reactants.join(' + ')} exchange ions to form ${products.join(' + ')}`;
		case 'redox':
			return `Redox: ${reactants.join(' + ')} undergo electron transfer to form ${products.join(' + ')}`;
		default:
			return `Reaction: ${reactants.join(' + ')} react to form ${products.join(' + ')}`;
	}
}

/**
 * Get common reaction examples by type
 */
export function getReactionExamples(reactionType: string): string[] {
	const examples: Record<string, string[]> = {
		'combustion': [
			'CH4 + 2O2 -> CO2 + 2H2O',
			'C2H5OH + 3O2 -> 2CO2 + 3H2O',
			'C6H12O6 + 6O2 -> 6CO2 + 6H2O'
		],
		'acid-base': [
			'HCl + NaOH -> NaCl + H2O',
			'H2SO4 + 2NaOH -> Na2SO4 + 2H2O',
			'HNO3 + KOH -> KNO3 + H2O'
		],
		'precipitation': [
			'AgNO3 + NaCl -> AgCl + NaNO3',
			'BaCl2 + Na2SO4 -> BaSO4 + 2NaCl',
			'Pb(NO3)2 + 2KI -> PbI2 + 2KNO3'
		],
		'decomposition': [
			'2H2O2 -> 2H2O + O2',
			'CaCO3 -> CaO + CO2',
			'2KClO3 -> 2KCl + 3O2'
		],
		'synthesis': [
			'2H2 + O2 -> 2H2O',
			'N2 + 3H2 -> 2NH3',
			'C + O2 -> CO2'
		],
		'double-displacement': [
			'NaCl + AgNO3 -> AgCl + NaNO3',
			'KI + Pb(NO3)2 -> PbI2 + 2KNO3',
			'BaCl2 + Na2SO4 -> BaSO4 + 2NaCl'
		],
		'redox': [
			'Zn + CuSO4 -> ZnSO4 + Cu',
			'Fe + CuSO4 -> FeSO4 + Cu',
			'Mg + 2HCl -> MgCl2 + H2'
		],
		'other': []
	};
	
	return examples[reactionType] || [];
}

/**
 * Check if a reaction is valid
 */
export function isValidReaction(equation: string): boolean {
	const parsed = parseEquation(equation);
	
	// Must have reactants
	if (parsed.reactants.length === 0) {
		return false;
	}
	
	// If it's a complete equation, must have products
	const arrowIndex = equation.indexOf('->');
	if (arrowIndex !== -1) {
		const productsPart = equation.substring(arrowIndex + 2).trim();
		if (productsPart.length === 0) {
			return false;
		}
	}
	
	return true;
}

export default {
	predictProducts,
	autoCompleteEquation,
	getAllPossibleProducts,
	getReactionInfo,
	getReactionExamples,
	isValidReaction,
	classifyReaction,
	REACTION_DATABASE,
	ELEMENT_CHARGES,
	POLYATOMIC_IONS
};
