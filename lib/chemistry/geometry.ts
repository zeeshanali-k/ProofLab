import type { GeometryResult, MolecularGeometry } from './types';

// VSEPR Theory Database
// Electron pair geometries and molecular geometries based on steric number and lone pairs

const VSEPR_GEOMETRIES: Record<number, Record<number, MolecularGeometry>> = {
	// Steric Number 2
	2: {
		0: {
			name: 'Linear',
			bondAngles: [180],
			bondLengths: [1.0],
			description: 'Two bonding pairs, 180° bond angle. Symmetrical, non-polar when identical atoms.',
			image: 'linear'
		}
	},
	
	// Steric Number 3
	3: {
		0: {
			name: 'Trigonal Planar',
			bondAngles: [120, 120, 120],
			bondLengths: [1.0, 1.0, 1.0],
			description: 'Three bonding pairs, 120° bond angles. Flat triangular shape, sp² hybridization.',
			image: 'trigonal-planar'
		},
		1: {
			name: 'Bent',
			bondAngles: [117, 117],
			bondLengths: [1.0, 1.0],
			description: 'Two bonding pairs, one lone pair. Bond angle slightly less than 120°. Polar.',
			image: 'bent'
		}
	},
	
	// Steric Number 4
	4: {
		0: {
			name: 'Tetrahedral',
			bondAngles: [109.5, 109.5, 109.5, 109.5],
			bondLengths: [1.0, 1.0, 1.0, 1.0],
			description: 'Four bonding pairs, 109.5° bond angles. Pyramidal shape, sp³ hybridization.',
			image: 'tetrahedral'
		},
		1: {
			name: 'Trigonal Pyramidal',
			bondAngles: [107, 107, 107],
			bondLengths: [1.0, 1.0, 1.0],
			description: 'Three bonding pairs, one lone pair. Bond angles ~107°. Polar.',
			image: 'trigonal-pyramidal'
		},
		2: {
			name: 'Bent',
			bondAngles: [104.5, 104.5],
			bondLengths: [1.0, 1.0],
			description: 'Two bonding pairs, two lone pairs. Bond angle ~104.5° (like water). Polar.',
			image: 'bent'
		}
	},
	
	// Steric Number 5
	5: {
		0: {
			name: 'Trigonal Bipyramidal',
			bondAngles: [120, 120, 90, 90, 90, 90],
			bondLengths: [1.0, 1.0, 1.0, 1.0, 1.0],
			description: 'Five bonding pairs. Axial positions at 90° to equatorial positions. Two distinct bond angles.',
			image: 'trigonal-bipyramidal'
		},
		1: {
			name: 'Seesaw',
			bondAngles: [120, 120, 90, 90],
			bondLengths: [1.0, 1.0, 1.0, 1.0],
			description: 'Four bonding pairs, one lone pair in equatorial position. Asymmetrical shape.',
			image: 'seesaw'
		},
		2: {
			name: 'T-shaped',
			bondAngles: [90, 90, 180],
			bondLengths: [1.0, 1.0, 1.0],
			description: 'Three bonding pairs, two lone pairs in equatorial positions. T-shaped.',
			image: 't-shaped'
		},
		3: {
			name: 'Linear',
			bondAngles: [180],
			bondLengths: [1.0, 1.0],
			description: 'Two bonding pairs, three lone pairs. Linear geometry (e.g., I₃⁻).',
			image: 'linear'
		}
	},
	
	// Steric Number 6
	6: {
		0: {
			name: 'Octahedral',
			bondAngles: [90, 90, 90, 90, 180, 180, 180, 180],
			bondLengths: [1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
			description: 'Six bonding pairs, 90° and 180° bond angles. Symmetrical octahedral shape.',
			image: 'octahedral'
		},
		1: {
			name: 'Square Pyramidal',
			bondAngles: [90, 90, 90, 90, 90, 90],
			bondLengths: [1.0, 1.0, 1.0, 1.0, 1.0],
			description: 'Five bonding pairs, one lone pair. Square base with one atom above.',
			image: 'square-pyramidal'
		},
		2: {
			name: 'Square Planar',
			bondAngles: [90, 90, 90, 90],
			bondLengths: [1.0, 1.0, 1.0, 1.0],
			description: 'Four bonding pairs, two lone pairs (opposite positions). Flat square shape.',
			image: 'square-planar'
		}
	}
};

// Element valence electrons (main group elements)
const VALENCE_ELECTRONS: Record<string, number> = {
	// Period 1
	H: 1, He: 2,
	
	// Period 2
	Li: 1, Be: 2, B: 3, C: 4, N: 5, O: 6, F: 7, Ne: 8,
	
	// Period 3
	Na: 1, Mg: 2, Al: 3, Si: 4, P: 5, S: 6, Cl: 7, Ar: 8,
	
	// Period 4
	K: 1, Ca: 2, Ga: 3, Ge: 4, As: 5, Se: 6, Br: 7, Kr: 8,
	
	// Period 5
	Rb: 1, Sr: 2, In: 3, Sn: 4, Sb: 5, Te: 6, I: 7, Xe: 8,
	
	// Period 6
	Cs: 1, Ba: 2, Tl: 3, Pb: 4, Bi: 5, Po: 6, At: 7, Rn: 8
};

// Common halogens and hydrogen for bonding
const HALOGENS = new Set(['F', 'Cl', 'Br', 'I', 'At']);
const HYDROGEN = 'H';

// Lookup table for common molecules — avoids algorithmic edge cases
const KNOWN_MOLECULES: Record<string, { stericNumber: number; bondedAtoms: number; lonePairs: number }> = {
	// Steric number 2 — Linear
	'CO2': { stericNumber: 2, bondedAtoms: 2, lonePairs: 0 },
	'BeCl2': { stericNumber: 2, bondedAtoms: 2, lonePairs: 0 },
	'CS2': { stericNumber: 2, bondedAtoms: 2, lonePairs: 0 },
	'HCN': { stericNumber: 2, bondedAtoms: 2, lonePairs: 0 },
	'C2H2': { stericNumber: 2, bondedAtoms: 2, lonePairs: 0 },
	'NO2': { stericNumber: 3, bondedAtoms: 2, lonePairs: 1 },

	// Steric number 3 — Trigonal planar / Bent
	'BF3': { stericNumber: 3, bondedAtoms: 3, lonePairs: 0 },
	'SO3': { stericNumber: 3, bondedAtoms: 3, lonePairs: 0 },
	'AlCl3': { stericNumber: 3, bondedAtoms: 3, lonePairs: 0 },
	'BCl3': { stericNumber: 3, bondedAtoms: 3, lonePairs: 0 },
	'CH2O': { stericNumber: 3, bondedAtoms: 3, lonePairs: 0 },
	'H2CO': { stericNumber: 3, bondedAtoms: 3, lonePairs: 0 },
	'SO2': { stericNumber: 3, bondedAtoms: 2, lonePairs: 1 },
	'O3': { stericNumber: 3, bondedAtoms: 2, lonePairs: 1 },

	// Steric number 4 — Tetrahedral / Trigonal pyramidal / Bent
	'CH4': { stericNumber: 4, bondedAtoms: 4, lonePairs: 0 },
	'NH4': { stericNumber: 4, bondedAtoms: 4, lonePairs: 0 },
	'SiH4': { stericNumber: 4, bondedAtoms: 4, lonePairs: 0 },
	'CCl4': { stericNumber: 4, bondedAtoms: 4, lonePairs: 0 },
	'CF4': { stericNumber: 4, bondedAtoms: 4, lonePairs: 0 },
	'SF4': { stericNumber: 5, bondedAtoms: 4, lonePairs: 1 },
	'NH3': { stericNumber: 4, bondedAtoms: 3, lonePairs: 1 },
	'NF3': { stericNumber: 4, bondedAtoms: 3, lonePairs: 1 },
	'PCl3': { stericNumber: 4, bondedAtoms: 3, lonePairs: 1 },
	'H2O': { stericNumber: 4, bondedAtoms: 2, lonePairs: 2 },
	'H2S': { stericNumber: 4, bondedAtoms: 2, lonePairs: 2 },
	'SCl2': { stericNumber: 4, bondedAtoms: 2, lonePairs: 2 },
	'OF2': { stericNumber: 4, bondedAtoms: 2, lonePairs: 2 },

	// Steric number 5 — Trigonal bipyramidal / Seesaw / T-shaped / Linear
	'PCl5': { stericNumber: 5, bondedAtoms: 5, lonePairs: 0 },
	'PF5': { stericNumber: 5, bondedAtoms: 5, lonePairs: 0 },
	'AsF5': { stericNumber: 5, bondedAtoms: 5, lonePairs: 0 },
	'ClF3': { stericNumber: 5, bondedAtoms: 3, lonePairs: 2 },
	'BrF3': { stericNumber: 5, bondedAtoms: 3, lonePairs: 2 },

	// Steric number 6 — Octahedral / Square pyramidal / Square planar
	'SF6': { stericNumber: 6, bondedAtoms: 6, lonePairs: 0 },
	'PF6': { stericNumber: 6, bondedAtoms: 6, lonePairs: 0 },
	'BrF5': { stericNumber: 6, bondedAtoms: 5, lonePairs: 1 },
	'IF5': { stericNumber: 6, bondedAtoms: 5, lonePairs: 1 },
	'XeF4': { stericNumber: 6, bondedAtoms: 4, lonePairs: 2 },

	// Diatomic / simple
	'HCl': { stericNumber: 2, bondedAtoms: 1, lonePairs: 0 },
	'HF': { stericNumber: 2, bondedAtoms: 1, lonePairs: 0 },
	'HBr': { stericNumber: 2, bondedAtoms: 1, lonePairs: 0 },
	'HI': { stericNumber: 2, bondedAtoms: 1, lonePairs: 0 },
	'CO': { stericNumber: 2, bondedAtoms: 1, lonePairs: 0 },
	'N2': { stericNumber: 2, bondedAtoms: 1, lonePairs: 0 },
	'O2': { stericNumber: 2, bondedAtoms: 1, lonePairs: 0 },
	'H2': { stericNumber: 2, bondedAtoms: 1, lonePairs: 0 },
	'Cl2': { stericNumber: 2, bondedAtoms: 1, lonePairs: 0 },
	'F2': { stericNumber: 2, bondedAtoms: 1, lonePairs: 0 },
};

/**
 * Parse a chemical formula and count valence electrons
 */
function parseFormula(formula: string): Record<string, number> {
	const elements: Record<string, number> = {};
	// Normalize Unicode subscripts/superscripts to ASCII digits
	const normalized = normalizeSubscripts(formula);
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
		elements[element] = (elements[element] || 0) + count;
	}

	return elements;
}

/**
 * Convert Unicode subscript/superscript digits to ASCII.
 * Handles: ₀₁₂₃₄₅₆₇₈₉ and ⁰¹²³⁴⁵⁶⁷⁸⁹
 */
function normalizeSubscripts(formula: string): string {
	const subscriptMap: Record<string, string> = {
		'₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
		'₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
		'⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
		'⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
	};
	return formula.replace(/[₀₁₂₃₄₅₆₇₈₉⁰¹²³⁴⁵⁶⁷⁸⁹]/g, ch => subscriptMap[ch] || ch);
}

/**
 * Calculate total valence electrons for a molecule
 */
function calculateValenceElectrons(formula: string): number {
	const elements = parseFormula(formula);
	let total = 0;
	
	for (const [element, count] of Object.entries(elements)) {
		const valence = VALENCE_ELECTRONS[element] || 0;
		total += valence * count;
	}
	
	return total;
}

/**
 * Count bonding electrons on the central atom.
 * Each terminal atom (H needs 2e, others need 8-valence to complete octet).
 */
function countBondingElectrons(formula: string): number {
	const elements = parseFormula(formula);
	const centralAtom = identifyCentralAtom(formula);
	const centralValence = VALENCE_ELECTRONS[centralAtom] || 0;

	// Count terminal atoms
	let terminalElectronDemand = 0;
	for (const [element, count] of Object.entries(elements)) {
		if (element === centralAtom) continue;
		const terminalValence = VALENCE_ELECTRONS[element] || 0;
		const demandPerAtom = element === HYDROGEN ? 2 : Math.max(0, 8 - terminalValence);
		terminalElectronDemand += demandPerAtom * count;
	}

	// Electrons the central atom uses for bonding
	const centralElectronsUsed = Math.min(centralValence, terminalElectronDemand);
	return centralElectronsUsed;
}

/**
 * Calculate steric number (bonding regions + lone pairs on central atom)
 */
function calculateStericNumber(formula: string): number {
	// Check lookup table first (normalize Unicode subscripts to ASCII)
	const normalized = normalizeSubscripts(formula).replace(/[+\-]\d*/g, '').replace(/[\[\]()]/g, '').trim();
	const known = KNOWN_MOLECULES[normalized];
	if (known) return known.stericNumber;

	return countBondingRegions(formula) + countLonePairs(formula);
}

/**
 * Count lone pairs on the central atom
 */
function countLonePairs(formula: string): number {
	const elements = parseFormula(formula);
	const centralAtom = identifyCentralAtom(formula);
	const centralValence = VALENCE_ELECTRONS[centralAtom] || 0;

	// Calculate electron demand from terminal atoms
	let terminalDemand = 0;
	for (const [element, count] of Object.entries(elements)) {
		if (element === centralAtom) continue;
		const terminalValence = VALENCE_ELECTRONS[element] || 0;
		const demandPerAtom = element === HYDROGEN ? 2 : Math.max(0, 8 - terminalValence);
		terminalDemand += demandPerAtom * count;
	}

	// Lone pair electrons = central valence electrons used for bonding minus what goes to terminals
	const remainingElectrons = Math.max(0, centralValence - terminalDemand);
	return Math.floor(remainingElectrons / 2);
}

/**
 * Count bonding regions (atoms bonded to central atom)
 */
function countBondingRegions(formula: string): number {
	const elements = parseFormula(formula);
	const centralAtom = identifyCentralAtom(formula);
	const centralCount = elements[centralAtom] || 1;

	let bondedAtoms = 0;
	for (const [element, count] of Object.entries(elements)) {
		if (element === centralAtom) {
			bondedAtoms += count - 1; // subtract the central atom itself
		} else {
			bondedAtoms += count;
		}
	}

	return Math.max(1, bondedAtoms);
}

/**
 * Count bonding pairs (legacy — kept for compatibility)
 */
function countBondingPairs(formula: string): number {
	return countBondingRegions(formula);
}

/**
 * Identify central atom (simplified - returns the first non-hydrogen, non-halogen atom)
 */
function identifyCentralAtom(formula: string): string {
	const elements = parseFormula(formula);
	
	// Remove H and halogens
	const nonTerminalAtoms: string[] = [];
	for (const [element, count] of Object.entries(elements)) {
		if (element !== HYDROGEN && !HALOGENS.has(element)) {
			for (let i = 0; i < count; i++) {
				nonTerminalAtoms.push(element);
			}
		}
	}
	
	// If there are non-terminal atoms, return the first one
	if (nonTerminalAtoms.length > 0) {
		return nonTerminalAtoms[0];
	}
	
	// If only H and halogens (e.g., HCl), return the halogen
	for (const element of Object.keys(elements)) {
		if (HALOGENS.has(element)) {
			return element;
		}
	}
	
	return HYDROGEN;
}

/**
 * Predict hybridization based on steric number
 */
function predictHybridization(stericNumber: number): string {
	const hybridizationMap: Record<number, string> = {
		2: 'sp',
		3: 'sp²',
		4: 'sp³',
		5: 'sp³d',
		6: 'sp³d²'
	};
	
	return hybridizationMap[stericNumber] || 'Unknown';
}

/**
 * Predict polarity based on molecular geometry and bonded atoms
 */
function predictPolarity(geometry: MolecularGeometry, formula: string): string {
	const elements = parseFormula(formula);
	const uniqueElements = Object.keys(elements);
	
	// If only one type of atom (e.g., O₂, N₂), non-polar
	if (uniqueElements.length === 1) {
		return 'Non-polar';
	}
	
	// If geometry is symmetrical and all bonded atoms are the same
	const symmetricalGeometries = ['Linear', 'Trigonal Planar', 'Tetrahedral', 'Octahedral', 'Square Planar'];
	
	// Check if all bonded atoms are the same (excluding central atom)
	const centralAtom = identifyCentralAtom(formula);
	const bondedAtoms = uniqueElements.filter(el => el !== centralAtom);
	const allBondedAtomsSame = new Set(bondedAtoms).size === 1;
	
	if (symmetricalGeometries.includes(geometry.name) && allBondedAtomsSame) {
		return 'Non-polar';
	}
	
	// Bent, trigonal pyramidal, seesaw, t-shaped are usually polar
	const asymmetricalGeometries = ['Bent', 'Trigonal Pyramidal', 'Seesaw', 'T-shaped', 'Square Pyramidal'];
	if (asymmetricalGeometries.includes(geometry.name)) {
		return 'Polar';
	}
	
	// For tetrahedral with different bonded atoms (e.g., CH₃Cl)
	if (geometry.name === 'Tetrahedral' && !allBondedAtomsSame) {
		return 'Polar';
	}
	
	return 'Polar';
}

/**
 * Predict molecular geometry based on steric number and lone pairs
 */
function predictGeometry(stericNumber: number, lonePairs: number): MolecularGeometry {
	const geometries = VSEPR_GEOMETRIES[stericNumber];
	if (!geometries) {
		return {
			name: 'Unknown',
			bondAngles: [],
			bondLengths: [],
			description: 'Unable to determine geometry',
			image: 'unknown'
		};
	}
	
	// Find the geometry with matching lone pairs
	// Note: lonePairs here is the number of lone pairs on the central atom
	const geometry = geometries[lonePairs] || geometries[0];
	
	if (!geometry) {
		return {
			name: 'Unknown',
			bondAngles: [],
			bondLengths: [],
			description: 'Unable to determine geometry',
			image: 'unknown'
		};
	}
	
	return geometry;
}

/**
 * Calculate molecular geometry from a chemical formula
 * Returns comprehensive geometry information including VSEPR theory
 */
export function calculateMolecularGeometry(formula: string): GeometryResult {
	try {
		// Normalize formula: Unicode subscripts → ASCII, remove charges/states/brackets
		const normalizedFormula = normalizeSubscripts(formula)
			.replace(/[+\-]\d*/g, '')           // Remove charges like +1, -2
			.replace(/\(s\)|\(l\)|\(g\)|\(aq\)/gi, '') // Remove state symbols
			.replace(/[\[\]]/g, '')              // Remove brackets only
			.trim();

		if (!normalizedFormula) {
			throw new Error('Invalid formula');
		}

		// Check lookup table first for known molecules
		const known = KNOWN_MOLECULES[normalizedFormula];

		let stericNumber: number;
		let bondingPairs: number;
		let lonePairs: number;

		if (known) {
			stericNumber = known.stericNumber;
			bondingPairs = known.bondedAtoms;
			lonePairs = known.lonePairs;
		} else {
			// Fall back to algorithmic calculation
			stericNumber = calculateStericNumber(normalizedFormula);
			bondingPairs = countBondingPairs(normalizedFormula);
			lonePairs = countLonePairs(normalizedFormula);
		}

		// Predict geometry
		const molecularGeometry = predictGeometry(stericNumber, lonePairs);

		// Predict hybridization
		const hybridization = predictHybridization(stericNumber);

		// Predict polarity
		const polarity = predictPolarity(molecularGeometry, normalizedFormula);

		// Build VSEPR theory description
		const centralAtom = identifyCentralAtom(normalizedFormula);
		const vseprTheory = `Central atom: ${centralAtom}, Steric number: ${stericNumber}, ` +
			`${bondingPairs} bonding pair(s), ${lonePairs} lone pair(s). ` +
			`Hybridization: ${hybridization}. Electron pair geometry: ${molecularGeometry.name}.`;

		return {
			molecularGeometry: {
				...molecularGeometry,
				name: `${molecularGeometry.name}${polarity ? ` (${polarity})` : ''}`
			},
			electronPairs: stericNumber,
			bondingPairs,
			lonePairs,
			stericNumber,
			vseprTheory
		};
	} catch (error) {
		// Return unknown geometry for invalid formulas
		return {
			molecularGeometry: {
				name: 'Unknown',
				bondAngles: [],
				bondLengths: [],
				description: 'Invalid formula or unable to determine geometry',
				image: 'unknown'
			},
			electronPairs: 0,
			bondingPairs: 0,
			lonePairs: 0,
			stericNumber: 0,
			vseprTheory: `Error: ${error}`
		};
	}
}

/**
 * Get all possible geometries for a given steric number
 */
export function getGeometriesForStericNumber(stericNumber: number): MolecularGeometry[] {
	const geometries = VSEPR_GEOMETRIES[stericNumber];
	if (!geometries) {
		return [];
	}
	
	return Object.values(geometries);
}

/**
 * Get VSEPR information for a specific geometry
 */
export function getVSEPRInfo(stericNumber: number, lonePairs: number): MolecularGeometry | null {
	const geometries = VSEPR_GEOMETRIES[stericNumber];
	if (!geometries) {
		return null;
	}
	
	return geometries[lonePairs] || null;
}

/**
 * Get common examples for each geometry
 */
export function getGeometryExamples(): Record<string, string[]> {
	return {
		'Linear': ['CO₂', 'BeCl₂', 'I₃⁻'],
		'Bent': ['H₂O', 'SO₂', 'OF₂'],
		'Trigonal Planar': ['BF₃', 'SO₃', 'NO₃⁻'],
		'Trigonal Pyramidal': ['NH₃', 'PF₃', 'H₃O⁺'],
		'Tetrahedral': ['CH₄', 'SiCl₄', 'NH₄⁺'],
		'Seesaw': ['SF₄', 'ClF₃'],
		'T-shaped': ['ClF₃', 'BrF₃'],
		'Trigonal Bipyramidal': ['PCl₅', 'AsF₅'],
		'Square Pyramidal': ['BrF₅', 'IF₅'],
		'Square Planar': ['XeF₄', 'PtCl₄²⁻'],
		'Octahedral': ['SF₆', 'PF₆⁻', 'SiF₆²⁻']
	};
}

/**
 * Extended molecular geometry with steric number and lone pairs for reference
 */
interface ExtendedMolecularGeometry extends MolecularGeometry {
	stericNumber: number;
	lonePairs: number;
}

/**
 * Get information about all supported geometries
 */
export function getAllGeometries(): ExtendedMolecularGeometry[] {
	const all: ExtendedMolecularGeometry[] = [];
	
	for (const stericNumber of Object.keys(VSEPR_GEOMETRIES).map(Number)) {
		const geometries = VSEPR_GEOMETRIES[stericNumber];
		for (const lonePairs of Object.keys(geometries).map(Number)) {
			all.push({
				...geometries[lonePairs],
				stericNumber,
				lonePairs
			});
		}
	}
	
	return all;
}

export default {
	calculateMolecularGeometry,
	getGeometriesForStericNumber,
	getVSEPRInfo,
	getGeometryExamples,
	getAllGeometries,
	calculateValenceElectrons,
	countBondingPairs,
	countLonePairs,
	predictHybridization,
	predictPolarity,
	VSEPR_GEOMETRIES,
	VALENCE_ELECTRONS
};
