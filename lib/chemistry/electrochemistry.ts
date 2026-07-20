import type { ElectrochemistryResult } from './types';

// Standard reduction potentials at 25°C in volts
// Source: CRC Handbook of Chemistry and Physics
export const STANDARD_REDUCTION_POTENTIALS: Record<string, number> = {
	// More positive E° (stronger oxidizing agents)
	'F2(g) + 2e- → 2F-(aq)': 2.866,
	'O3(g) + 2H+(aq) + 2e- → O2(g) + H2O(l)': 2.076,
	'S2O8^2-(aq) + 2e- → 2SO4^2-(aq)': 2.010,
	'Ag2+(aq) + e- → Ag+(aq)': 1.980,
	'Co3+(aq) + e- → Co2+(aq)': 1.92,
	'H2O2(aq) + 2H+(aq) + 2e- → 2H2O(l)': 1.782,
	'Au3+(aq) + 3e- → Au(s)': 1.498,
	'Cl2(g) + 2e- → 2Cl-(aq)': 1.358,
	'Cr2O7^2-(aq) + 14H+(aq) + 6e- → 2Cr3+(aq) + 7H2O(l)': 1.36,
	'MnO4-(aq) + 8H+(aq) + 5e- → Mn2+(aq) + 4H2O(l)': 1.507,
	'O2(g) + 4H+(aq) + 4e- → 2H2O(l)': 1.229,
	'Pt2+(aq) + 2e- → Pt(s)': 1.20,
	'Au+(aq) + e- → Au(s)': 1.18,
	'Br2(l) + 2e- → 2Br-(aq)': 1.066,
	'NO3-(aq) + 4H+(aq) + 3e- → NO(g) + 2H2O(l)': 0.957,
	'Ag+(aq) + e- → Ag(s)': 0.7996,
	'Fe3+(aq) + e- → Fe2+(aq)': 0.771,
	'O2(g) + 2H+(aq) + 2e- → H2O2(aq)': 0.682,
	'I2(s) + 2e- → 2I-(aq)': 0.535,
	'Cu+(aq) + e- → Cu(s)': 0.521,
	'Cu2+(aq) + 2e- → Cu(s)': 0.342,
	'SO4^2-(aq) + 4H+(aq) + 2e- → SO2(g) + 2H2O(l)': 0.172,
	'Cu2+(aq) + e- → Cu+(aq)': 0.153,
	'Sn4+(aq) + 2e- → Sn2+(aq)': 0.154,
	'2H+(aq) + 2e- → H2(g)': 0.0000,
	'Fe3+(aq) + 3e- → Fe(s)': -0.037,
	'Pb2+(aq) + 2e- → Pb(s)': -0.126,
	'Sn2+(aq) + 2e- → Sn(s)': -0.138,
	'Ni2+(aq) + 2e- → Ni(s)': -0.257,
	'Co2+(aq) + 2e- → Co(s)': -0.277,
	'Cd2+(aq) + 2e- → Cd(s)': -0.403,
	'Fe2+(aq) + 2e- → Fe(s)': -0.447,
	'Cr3+(aq) + 3e- → Cr(s)': -0.744,
	'Zn2+(aq) + 2e- → Zn(s)': -0.7618,
	'Mn2+(aq) + 2e- → Mn(s)': -1.185,
	'Al3+(aq) + 3e- → Al(s)': -1.662,
	'Mg2+(aq) + 2e- → Mg(s)': -2.372,
	'Na+(aq) + e- → Na(s)': -2.713,
	'Ca2+(aq) + 2e- → Ca(s)': -2.868,
	'K+(aq) + e- → K(s)': -2.931,
	'Li+(aq) + e- → Li(s)': -3.040
};

// Common electrode reactions
const ELECTRODE_REACTIONS: Record<string, { anode: string; cathode: string; cellNotation: string }> = {
	'Daniel Cell': {
		anode: 'Zn(s) → Zn2+(aq) + 2e-',
		cathode: 'Cu2+(aq) + 2e- → Cu(s)',
		cellNotation: 'Zn(s) | Zn2+(aq) || Cu2+(aq) | Cu(s)'
	},
	'Leclanché Cell': {
		anode: 'Zn(s) → Zn2+(aq) + 2e-',
		cathode: '2MnO2(s) + 2NH4+(aq) + 2e- → Mn2O3(s) + 2NH3(aq) + H2O(l)',
		cellNotation: 'Zn(s) | Zn2+(aq) || NH4+(aq), MnO2(s) | C(s)'
	},
	'Lead-Acid Battery': {
		anode: 'Pb(s) + SO4^2-(aq) → PbSO4(s) + 2e-',
		cathode: 'PbO2(s) + SO4^2-(aq) + 4H+(aq) + 2e- → PbSO4(s) + 2H2O(l)',
		cellNotation: 'Pb(s) | PbSO4(s) | H2SO4(aq) || H2SO4(aq) | PbSO4(s) | PbO2(s) | Pt(s)'
	},
	'Alkaline Battery': {
		anode: 'Zn(s) + 2OH-(aq) → Zn(OH)2(s) + 2e-',
		cathode: '2MnO2(s) + H2O(l) + 2e- → Mn2O3(s) + 2OH-(aq)',
		cellNotation: 'Zn(s) | Zn(OH)2(s) | OH-(aq) || MnO2(s) | C(s)'
	},
	'Fuel Cell (H2/O2)': {
		anode: 'H2(g) → 2H+(aq) + 2e-',
		cathode: 'O2(g) + 4H+(aq) + 4e- → 2H2O(l)',
		cellNotation: 'Pt(s) | H2(g) | H+(aq) || OH-(aq) | O2(g) | Pt(s)'
	}
};

// Faraday constant (C/mol)
const F = 96485.33212;

// Gas constant (J/mol·K)
const R = 8.314462618;

/**
 * Calculate standard cell potential from half-reactions
 */
export function calculateCellPotential(
	anodeReaction: string,
	cathodeReaction: string
): ElectrochemistryResult {
	// Find reduction potentials
	const anodePotential = STANDARD_REDUCTION_POTENTIALS[anodeReaction] || 0;
	const cathodePotential = STANDARD_REDUCTION_POTENTIALS[cathodeReaction] || 0;
	
	// Anode is oxidation (reverse of reduction), so E°_anode = -E°_reduction
	// Cathode is reduction, so E°_cathode = E°_reduction
	// E°_cell = E°_cathode - E°_anode
	const cellPotential = cathodePotential - anodePotential;
	
	const spontaneous = cellPotential > 0;
	
	return {
		cellPotential,
		standardPotentials: {
			anode: anodePotential,
			cathode: cathodePotential
		},
		anode: anodeReaction,
		cathode: cathodeReaction,
		cellNotation: generateCellNotation(anodeReaction, cathodeReaction),
		spontaneous
	};
}

/**
 * Generate cell notation from half-reactions
 */
function generateCellNotation(anodeReaction: string, cathodeReaction: string): string {
	// Extract species from reactions
	const anodeSpecies = extractSpecies(anodeReaction).join(', ');
	const cathodeSpecies = extractSpecies(cathodeReaction).join(', ');
	
	return `Pt(s) | ${anodeSpecies} || ${cathodeSpecies} | Pt(s)`;
}

/**
 * Extract species from a reaction string
 */
function extractSpecies(reaction: string): string[] {
	const species: string[] = [];
	
	// Simple parsing - look for chemical formulas
	const formulaPattern = /([A-Z][a-z]*\d*|O2|H2|N2|Cl2|Br2|I2|F2|H2O|OH-|H+|e-|Pt|C)/g;
	const matches = reaction.match(formulaPattern) || [];
	
	// Filter out electrons and Pt
	return matches.filter(s => !['e-', 'e', 'Pt', 'C', 'H+', 'OH-'].includes(s));
}

/**
 * Calculate cell potential using Nernst equation
 */
export function calculateNernstPotential(
	standardPotential: number,
	n: number, // Number of electrons
	Q: number, // Reaction quotient
	temperature: number = 298.15 // K
): number {
	// Nernst equation: E = E° - (RT/nF) ln Q
	// At 25°C (298.15 K): E = E° - (0.0257/n) ln Q
	// Or: E = E° - (0.05916/n) log10 Q
	
	if (n === 0 || temperature === 0) return standardPotential;
	
	const term = (R * temperature) / (n * F);
	const nernstPotential = standardPotential - term * Math.log(Q);
	
	return nernstPotential;
}

/**
 * Calculate equilibrium constant from cell potential
 */
export function calculateKFromCellPotential(
	cellPotential: number,
	n: number,
	temperature: number = 298.15
): number {
	// ΔG° = -nFE°
	// ΔG° = -RT ln K
	// Therefore: ln K = nFE° / RT
	// K = exp(nFE° / RT)
	
	if (n === 0 || temperature === 0 || cellPotential === 0) return 1;
	
	const exponent = (n * F * cellPotential) / (R * temperature);
	return Math.exp(exponent);
}

/**
 * Calculate Gibbs free energy change from cell potential
 */
export function calculateDeltaGFromCellPotential(
	cellPotential: number,
	n: number
): number {
	// ΔG = -nFE
	// Returns ΔG in kJ/mol
	return -n * F * cellPotential / 1000;
}

/**
 * Calculate cell potential from ΔG
 */
export function calculateCellPotentialFromDeltaG(
	deltaG: number, // kJ/mol
	n: number
): number {
	// E = -ΔG / (nF)
	// Convert ΔG from kJ to J
	return -deltaG * 1000 / (n * F);
}

/**
 * Calculate Faraday's law (mass or volume from current and time)
 */
export function calculateFaradayLaw(
	current: number, // A
	time: number, // s
	molarMass: number, // g/mol
	n: number // Number of electrons
): { mass: number; moles: number } {
	// Q = I * t (Coulombs)
	// moles = Q / (n * F)
	// mass = moles * molarMass
	
	const charge = current * time;
	const moles = charge / (n * F);
	const mass = moles * molarMass;
	
	return { mass, moles };
}

/**
 * Calculate battery capacity (Ah or mAh)
 */
export function calculateBatteryCapacity(
	current: number, // A
	time: number // h
): number {
	return current * time;
}

/**
 * Calculate energy density
 */
export function calculateEnergyDensity(
	energy: number, // J
	mass: number // kg
): number {
	// Energy density in J/kg or Wh/kg
	// 1 Wh = 3600 J
	return energy / mass; // J/kg
}

/**
 * Calculate power density
 */
export function calculatePowerDensity(
	power: number, // W
	mass: number // kg
): number {
	return power / mass; // W/kg
}

/**
 * Get standard reduction potential
 */
export function getStandardReductionPotential(reaction: string): number {
	return STANDARD_REDUCTION_POTENTIALS[reaction] || 0;
}

/**
 * Get common electrode reactions
 */
export function getElectrodeReactions(): Record<string, { anode: string; cathode: string; cellNotation: string }> {
	return ELECTRODE_REACTIONS;
}

/**
 * Get Faraday constant
 */
export function getFaradayConstant(): number {
	return F;
}

/**
 * Determine if a reaction is spontaneous based on cell potential
 */
export function isSpontaneous(cellPotential: number): boolean {
	return cellPotential > 0;
}

/**
 * Balance a redox reaction
 */
export function balanceRedoxReaction(
	oxidation: string,
	reduction: string
): { balancedOxidation: string; balancedReduction: string; overall: string } {
	// This is a simplified approach
	// A complete implementation would require parsing and balancing half-reactions
	
	// For now, return the input with a note
	return {
		balancedOxidation: oxidation,
		balancedReduction: reduction,
		 overall: `${oxidation} | ${reduction}`
	};
}

/**
 * Calculate theoretical cell voltage for a given battery type
 */
export function getTheoreticalCellVoltage(batteryType: string): number {
	const voltages: Record<string, number> = {
		'Daniel Cell (Zn/Cu)': 1.10,
		'Leclanché Cell (Zn/MnO2)': 1.50,
		'Lead-Acid Battery': 2.05,
		'Alkaline Battery': 1.50,
		'Fuel Cell (H2/O2)': 1.229,
		'Lithium-ion': 3.70,
		'LiCoO2/Li': 3.70,
		'LiFePO4/Li': 3.25,
		'NiMH': 1.20,
		'NiCd': 1.20
	};
	
	return voltages[batteryType] || 0;
}

export default {
	calculateCellPotential,
	calculateNernstPotential,
	calculateKFromCellPotential,
	calculateDeltaGFromCellPotential,
	calculateCellPotentialFromDeltaG,
	calculateFaradayLaw,
	calculateBatteryCapacity,
	calculateEnergyDensity,
	calculatePowerDensity,
	getStandardReductionPotential,
	getElectrodeReactions,
	getFaradayConstant,
	isSpontaneous,
	balanceRedoxReaction,
	getTheoreticalCellVoltage,
	STANDARD_REDUCTION_POTENTIALS,
	ELECTRODE_REACTIONS,
	F,
	R
};
