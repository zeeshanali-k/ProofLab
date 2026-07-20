import type { ThermochemistryResult } from './types';

// Standard enthalpies of formation (ΔH°f) in kJ/mol at 25°C
// Source: NIST Chemistry WebBook and standard thermodynamic tables
export const STANDARD_ENTHALPIES: Record<string, number> = {
	// Elements (in standard state)
	'H2(g)': 0,
	'O2(g)': 0,
	'N2(g)': 0,
	'Cl2(g)': 0,
	'Br2(l)': 0,
	'I2(s)': 0,
	'C(s, graphite)': 0,
	'C(s, diamond)': 1.895,
	'S8(s, alpha)': 0,
	'P4(s, white)': 0,
	
	// Diatomic molecules
	'H(g)': 217.998,
	'O(g)': 249.18,
	'N(g)': 472.704,
	'Cl(g)': 121.679,
	'Br(g)': 111.898,
	'I(g)': 106.838,
	
	// Water and related
	'H2O(l)': -285.830,
	'H2O(g)': -241.826,
	'H2O2(l)': -187.78,
	'H2O2(g)': -136.106,
	
	// Carbon oxides
	'CO(g)': -110.525,
	'CO2(g)': -393.509,
	'CO2(aq)': -413.8,
	
	// Nitrogen compounds
	'NO(g)': 90.25,
	'NO2(g)': 33.18,
	'N2O(g)': 82.05,
	'N2O4(g)': 9.16,
	'NH3(g)': -45.948,
	'NH3(aq)': -80.29,
	'HNO3(l)': -174.10,
	'HNO3(aq)': -207.36,
	'NO3-(aq)': -207.36,
	'NH4+(aq)': -132.51,
	
	// Sulfur compounds
	'SO2(g)': -296.84,
	'SO3(g)': -395.72,
	'SO3(l)': -441.09,
	'H2S(g)': -20.6,
	'H2SO4(l)': -814.0,
	'SO4^2-(aq)': -909.27,
	
	// Carbon compounds
	'CH4(g)': -74.81,
	'CH3OH(l)': -238.86,
	'CH3OH(g)': -200.66,
	'C2H2(g)': 226.73,
	'C2H4(g)': 52.467,
	'C2H5OH(l)': -277.69,
	'C2H6(g)': -84.679,
	'C3H8(g)': -103.85,
	'C4H10(g)': -126.15,
	'C6H6(l)': 49.042,
	'C6H6(g)': 82.93,
	'C6H12O6(s)': -1273.3,
	'CH3COOH(l)': -484.5,
	'CH3COO-(aq)': -486.01,
	
	// Hydrocarbons
	'C3H6(g)': 20.41,
	'C4H8(g)': -0.126,
	'C6H12(l)': -154.8,
	
	// Halogen compounds
	'HCl(g)': -92.307,
	'HCl(aq)': -167.159,
	'HF(g)': -273.30,
	'HF(aq)': -332.63,
	'HBr(g)': -36.48,
	'HI(g)': 26.48,
	'Cl-(aq)': -167.159,
	'F-(aq)': -332.63,
	'Br-(aq)': -121.55,
	'I-(aq)': -55.19,
	
	// Salts
	'NaCl(s)': -411.153,
	'NaCl(aq)': -407.27,
	'Na+(aq)': -240.12,
	'KCl(s)': -436.747,
	'K+(aq)': -252.38,
	'CaCl2(s)': -795.59,
	'Ca2+(aq)': -542.83,
	'MgCl2(s)': -641.32,
	'Mg2+(aq)': -466.85,
	'NaOH(s)': -425.93,
	'NaOH(aq)': -469.15,
	'KOH(s)': -424.764,
	'KOH(aq)': -481.17,
	'Ca(OH)2(s)': -986.09,
	'Ca(OH)2(aq)': -1002.82,
	
	// Carbonates and bicarbonates
	'Na2CO3(s)': -1130.68,
	'Na2CO3(aq)': -1133.39,
	'K2CO3(s)': -1150.18,
	'K2CO3(aq)': -1149.95,
	'CaCO3(s, calcite)': -1206.92,
	'CaCO3(s, aragonite)': -1207.36,
	'CO3^2-(aq)': -677.14,
	'HCO3-(aq)': -692.0,
	
	// Nitrates
	'NaNO3(s)': -467.85,
	'NaNO3(aq)': -447.47,
	'KNO3(s)': -494.63,
	'KNO3(aq)': -484.13,
	'Ca(NO3)2(s)': -938.37,
	
	// Sulfates
	'Na2SO4(s)': -1387.08,
	'Na2SO4(aq)': -1389.49,
	'K2SO4(s)': -1437.77,
	'K2SO4(aq)': -1447.79,
	'CaSO4(s)': -1434.52,
	'MgSO4(s)': -1284.9,
	
	// Organic compounds
	'C2H5OH(g)': -235.10,
	'CH3COOH(g)': -432.8,
	'HCOOH(l)': -424.76,
	'HCOO-(aq)': -425.55,
	'C12H22O11(s)': -2226.1,
	
	// Gases
	'He(g)': 0,
	'Ne(g)': 0,
	'Ar(g)': 0,
	'Kr(g)': 0,
	'Xe(g)': 0
};

// Standard bond energies in kJ/mol
export const BOND_ENERGIES: Record<string, number> = {
	// Single bonds
	'H-H': 436,
	'H-F': 567,
	'H-Cl': 431,
	'H-Br': 366,
	'H-I': 299,
	'H-O': 463,
	'H-S': 339,
	'H-N': 391,
	'H-C': 413,
	
	'C-C': 347,
	'C-N': 305,
	'C-O': 358,
	'C-S': 272,
	'C-F': 485,
	'C-Cl': 339,
	'C-Br': 276,
	'C-I': 240,
	
	'N-N': 163,
	'N-O': 201,
	'N-F': 272,
	'N-Cl': 200,
	'N-Br': 243,
	
	'O-O': 146,
	'O-F': 185,
	'O-Cl': 203,
	'O-Br': 234,
	
	'F-F': 158,
	'Cl-Cl': 242,
	'Br-Br': 193,
	'I-I': 151,
	
	'S-S': 266,
	'S-F': 327,
	'S-Cl': 253,
	
	'Si-Si': 226,
	'Si-C': 360,
	'Si-O': 466,
	'Si-Cl': 401,
	
	'P-P': 200,
	'P-O': 360,
	'P-Cl': 331,
	
	// Double bonds
	'C=C': 614,
	'C=O': 745,
	'C=N': 615,
	'C=S': 577,
	'N=N': 418,
	'N=O': 607,
	'O=O': 498,
	'S=O': 532,
	
	// Triple bonds
	'C≡C': 839,
	'C≡N': 891,
	'N≡N': 945
};

// Gas constant in various units
const R = {
	J_per_mol_K: 8.314462618,
	kJ_per_mol_K: 0.008314462618,
	L_atm_per_mol_K: 0.08205746,
	L_bar_per_mol_K: 0.083144626,
	cal_per_mol_K: 1.9872036,
	m3_Pa_per_mol_K: 8.314462618
};

/**
 * Calculate standard reaction enthalpy from standard enthalpies of formation
 */
export function calculateReactionEnthalpy(
	reactants: Array<{ formula: string; coefficient: number }>,
	products: Array<{ formula: string; coefficient: number }>
): { reactionEnthalpy: number; formationEnthalpies: Record<string, number> } {
	let reactionEnthalpy = 0;
	const formationEnthalpies: Record<string, number> = {};

	// ΔH°_rxn = Σ(ν × ΔH°f products) − Σ(ν × ΔH°f reactants)
	for (const product of products) {
		const enthalpy = STANDARD_ENTHALPIES[product.formula] || 0;
		formationEnthalpies[product.formula] = enthalpy;
		reactionEnthalpy += enthalpy * product.coefficient;
	}

	for (const reactant of reactants) {
		const enthalpy = STANDARD_ENTHALPIES[reactant.formula] || 0;
		formationEnthalpies[reactant.formula] = enthalpy;
		reactionEnthalpy -= enthalpy * reactant.coefficient;
	}
	
	return { reactionEnthalpy, formationEnthalpies };
}

/**
 * Calculate reaction enthalpy from bond energies
 */
export function calculateReactionEnthalpyFromBonds(
	bondsBroken: string[],
	bondsFormed: string[]
): { reactionEnthalpy: number; bondEnergies: Record<string, number> } {
	let reactionEnthalpy = 0;
	const bondEnergies: Record<string, number> = {};
	
	// Energy required to break bonds (endothermic, +)
	for (const bond of bondsBroken) {
		const energy = BOND_ENERGIES[bond] || 0;
		bondEnergies[bond] = energy;
		reactionEnthalpy += energy;
	}
	
	// Energy released when forming bonds (exothermic, -)
	for (const bond of bondsFormed) {
		const energy = BOND_ENERGIES[bond] || 0;
		bondEnergies[bond] = energy;
		reactionEnthalpy -= energy;
	}
	
	return { reactionEnthalpy, bondEnergies };
}

/**
 * Calculate heat of combustion
 */
export function calculateHeatOfCombustion(
	fuelFormula: string,
	moles: number = 1
): number {
	// For hydrocarbons: CxHy + (x + y/4) O2 -> x CO2 + (y/2) H2O
	// Heat of combustion can be calculated from standard enthalpies
	
	// This is a simplified approach - in practice, we'd need the balanced equation
	const fuelEnthalpy = STANDARD_ENTHALPIES[fuelFormula] || 0;
	const co2Enthalpy = STANDARD_ENTHALPIES['CO2(g)'] || 0;
	const h2oEnthalpy = STANDARD_ENTHALPIES['H2O(l)'] || 0;
	
	// Parse formula to get number of C and H atoms
	const { C: carbonCount = 0, H: hydrogenCount = 0 } = parseFormula(fuelFormula);
	
	// Balanced combustion equation: CxHy + (x + y/4) O2 -> x CO2 + (y/2) H2O
	const heatOfCombustion = (
		carbonCount * co2Enthalpy + 
		(hydrogenCount / 2) * h2oEnthalpy - 
		fuelEnthalpy
	);
	
	return heatOfCombustion * moles;
}

/**
 * Parse chemical formula to get element counts
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
 * Calculate Gibbs free energy change (ΔG = ΔH - TΔS)
 */
export function calculateGibbsFreeEnergy(
	reactionEnthalpy: number,
	temperature: number = 298.15, // K
	reactionEntropy: number
): number {
	// ΔG = ΔH - TΔS
	// T in Kelvin, ΔS in kJ/mol·K
	return reactionEnthalpy - temperature * reactionEntropy / 1000; // Convert J to kJ
}

/**
 * Calculate entropy change from standard entropies
 */
export function calculateReactionEntropy(
	reactants: Array<{ formula: string; coefficient: number }>,
	products: Array<{ formula: string; coefficient: number }>,
	entropies: Record<string, number>
): number {
	let reactionEntropy = 0;
	
	// Calculate total entropy of products
	for (const product of products) {
		const entropy = entropies[product.formula] || 0;
		reactionEntropy -= entropy * product.coefficient;
	}
	
	// Calculate total entropy of reactants
	for (const reactant of reactants) {
		const entropy = entropies[reactant.formula] || 0;
		reactionEntropy += entropy * reactant.coefficient;
	}
	
	return reactionEntropy; // J/mol·K
}

/**
 * Calculate equilibrium constant from ΔG° (ΔG° = -RT ln K)
 */
export function calculateEquilibriumConstantFromDeltaG(
	deltaG: number, // kJ/mol
	temperature: number = 298.15 // K
): number {
	// ΔG° = -RT ln K
	// ln K = -ΔG° / RT
	// K = exp(-ΔG° / RT)
	
	const R_J = 8.314; // J/mol·K
	const deltaG_J = deltaG * 1000; // Convert kJ to J
	
	if (deltaG_J === 0) return 1; // K = 1 at equilibrium
	
	const lnK = -deltaG_J / (R_J * temperature);
	return Math.exp(lnK);
}

/**
 * Calculate ΔG° from equilibrium constant
 */
export function calculateDeltaGFromEquilibriumConstant(
	K: number,
	temperature: number = 298.15 // K
): number {
	// ΔG° = -RT ln K
	const R_J = 8.314; // J/mol·K
	
	if (K === 0) return Infinity; // Not spontaneous
	if (K === 1) return 0; // At equilibrium
	
	const lnK = Math.log(Math.abs(K));
	const deltaG_J = -R_J * temperature * lnK;
	
	return deltaG_J / 1000; // Convert J to kJ
}

/**
 * Calculate heat capacity change
 */
export function calculateHeatCapacityChange(
	reactants: Array<{ formula: string; coefficient: number }>,
	products: Array<{ formula: string; coefficient: number }>,
	heatCapacities: Record<string, number>
): number {
	let deltaCp = 0;
	
	// Calculate total heat capacity of products
	for (const product of products) {
		const cp = heatCapacities[product.formula] || 0;
		deltaCp -= cp * product.coefficient;
	}
	
	// Calculate total heat capacity of reactants
	for (const reactant of reactants) {
		const cp = heatCapacities[reactant.formula] || 0;
		deltaCp += cp * reactant.coefficient;
	}
	
	return deltaCp; // J/mol·K
}

/**
 * Calculate temperature dependence of ΔH (Kirchhoff's Law)
 */
export function calculateEnthalpyAtTemperature(
	deltaH298: number, // kJ/mol at 298 K
	deltaCp: number, // J/mol·K
	T1: number = 298.15, // K
	T2: number // K
): number {
	// ΔH(T2) = ΔH(T1) + ΔCp * (T2 - T1) / 1000 (convert J to kJ)
	return deltaH298 + (deltaCp * (T2 - T1)) / 1000;
}

/**
 * Calculate adiabatic flame temperature
 */
export function calculateAdiabaticFlameTemperature(
	reactants: Array<{ formula: string; moles: number }>,
	products: Array<{ formula: string; moles: number }>,
	initialTemperature: number = 298.15 // K
): number {
	// This is a simplified approach
	// In reality, this requires solving energy balance equations
	// and knowing heat capacities as functions of temperature
	
	// For demonstration, return a placeholder
	return 2000; // K (typical flame temperature)
}

/**
 * Get standard enthalpy of formation for a compound
 */
export function getStandardEnthalpy(formula: string): number {
	return STANDARD_ENTHALPIES[formula] || 0;
}

/**
 * Get bond energy for a bond
 */
export function getBondEnergy(bond: string): number {
	return BOND_ENERGIES[bond] || 0;
}

/**
 * Get gas constant in specified units
 */
export function getGasConstant(units?: string): number {
	switch (units?.toLowerCase()) {
		case 'j/(mol·k)':
		case 'j/mol/k':
			return R.J_per_mol_K;
		case 'kj/(mol·k)':
		case 'kj/mol/k':
			return R.kJ_per_mol_K;
		case 'l·atm/(mol·k)':
		case 'l atm/mol/k':
			return R.L_atm_per_mol_K;
		case 'l·bar/(mol·k)':
		case 'l bar/mol/k':
			return R.L_bar_per_mol_K;
		case 'cal/(mol·k)':
		case 'cal/mol/k':
			return R.cal_per_mol_K;
		case 'm3·pa/(mol·k)':
		case 'm3 pa/mol/k':
			return R.m3_Pa_per_mol_K;
		default:
			return R.kJ_per_mol_K;
	}
}

/**
 * Calculate work done (W = PΔV for constant pressure)
 */
export function calculateWork(
	pressure: number, // atm
	volumeChange: number // L
): number {
	// W = -PΔV (in L·atm)
	// Convert to kJ: 1 L·atm = 101.325 J = 0.101325 kJ
	return -pressure * volumeChange * 0.101325; // kJ
}

/**
 * Calculate heat at constant pressure (q = ΔH)
 */
export function calculateHeatAtConstantPressure(
	deltaH: number, // kJ
	moles: number
): number {
	return deltaH * moles; // kJ
}

/**
 * Calculate heat at constant volume (q = ΔU = ΔH - PΔV)
 */
export function calculateHeatAtConstantVolume(
	deltaH: number, // kJ
	molesGas: number,
	temperature: number = 298.15 // K
): number {
	// ΔU = ΔH - Δn_gas * R * T
	// where Δn_gas is change in moles of gas
	// R = 8.314 J/mol·K = 0.008314 kJ/mol·K
	const R = 0.008314; // kJ/mol·K
	return deltaH - molesGas * R * temperature;
}

export default {
	calculateReactionEnthalpy,
	calculateReactionEnthalpyFromBonds,
	calculateHeatOfCombustion,
	calculateGibbsFreeEnergy,
	calculateReactionEntropy,
	calculateEquilibriumConstantFromDeltaG,
	calculateDeltaGFromEquilibriumConstant,
	calculateHeatCapacityChange,
	calculateEnthalpyAtTemperature,
	calculateAdiabaticFlameTemperature,
	calculateWork,
	calculateHeatAtConstantPressure,
	calculateHeatAtConstantVolume,
	getStandardEnthalpy,
	getBondEnergy,
	getGasConstant,
	STANDARD_ENTHALPIES,
	BOND_ENERGIES,
	R
};
