import { Formula } from '@chemistry/formula';
import type { MolarMassResult, GasLawParams, GasLawResult, OxidationStateResult } from './types';

// Atomic weights for molar mass calculations
const ATOMIC_WEIGHTS: Record<string, number> = {
	H: 1.008, He: 4.0026, Li: 6.94, Be: 9.0122, B: 10.81, C: 12.011,
	N: 14.007, O: 15.999, F: 18.998, Ne: 20.180, Na: 22.990, Mg: 24.305,
	Al: 26.982, Si: 28.085, P: 30.974, S: 32.06, Cl: 35.45, Ar: 39.948,
	K: 39.098, Ca: 40.078, Sc: 44.956, Ti: 47.867, V: 50.942, Cr: 51.996,
	Mn: 54.938, Fe: 55.845, Co: 58.933, Ni: 58.693, Cu: 63.546, Zn: 65.38,
	Br: 79.904, Ag: 107.87, I: 126.90, Au: 196.97, Pb: 207.2
};

// Ideal gas constant: R = 0.0821 L·atm·K⁻¹·mol⁻¹
const IDEAL_GAS_CONSTANT = 0.0821;

/**
 * Calculates molar mass of a chemical formula
 */
export function getMolarMass(formula: string): MolarMassResult {
	try {
		const parsed = Formula.parse(formula);
		const molarMass = Formula.convertToWeight(parsed);
		
		// Build breakdown
		const breakdown = Object.entries(parsed).map(([element, count]) => {
			const weight = ATOMIC_WEIGHTS[element] || 0;
			return {
				element,
				count,
				mass: weight * count
			};
		});
		
		return {
			formula,
			molarMass,
			breakdown
		};
	} catch (error) {
		// Fallback calculation
		return calculateMolarMassFallback(formula);
	}
}

/**
 * Fallback molar mass calculation for simple formulas
 */
function calculateMolarMassFallback(formula: string): MolarMassResult {
	const elements: Record<string, number> = {};
	let molarMass = 0;
	
	// Parse formula
	const elementPattern = /([A-Z][a-z]?)(\d*)/g;
	let match;
	
	while ((match = elementPattern.exec(formula)) !== null) {
		const element = match[1];
		const count = match[2] ? parseInt(match[2], 10) : 1;
		
		elements[element] = (elements[element] || 0) + count;
		const weight = ATOMIC_WEIGHTS[element] || 0;
		molarMass += weight * count;
	}
	
	const breakdown = Object.entries(elements).map(([element, count]) => {
		const weight = ATOMIC_WEIGHTS[element] || 0;
		return { element, count, mass: weight * count };
	});
	
	return {
		formula,
		molarMass,
		breakdown
	};
}

/**
 * Calculates oxidation states for elements in a compound
 * Note: This is a simplified implementation
 */
export function getOxidationStates(formula: string): OxidationStateResult {
	// Common oxidation states (simplified)
	const commonOxidationStates: Record<string, Record<string, number>> = {
		// Common elements and their typical oxidation states
		O: { F: -1, H: -1, 'default': -2 },
		H: { O: +1, F: +1, 'metal': -1, 'default': +1 },
		F: { 'default': -1 },
		Cl: { O: +1, F: +1, 'default': -1 },
		Br: { O: +1, F: +1, 'default': -1 },
		I: { O: +1, F: +1, 'default': -1 },
		Na: { 'default': +1 },
		K: { 'default': +1 },
		Ca: { 'default': +2 },
		Mg: { 'default': +2 },
		Al: { 'default': +3 },
		Fe: { O: +2, 'default': +3 },
		Cu: { O: +2, 'default': +2 },
		Zn: { 'default': +2 },
		Ag: { 'default': +1 }
	};
	
	// For simplicity, return a placeholder
	// A full implementation would require more complex analysis
	return {
		formula,
		oxidationStates: {}
	};
}

/**
 * Calculates volume using the ideal gas law: PV = nRT
 * 
 * @param params - Object containing pressure (atm), moles, and temperature (K)
 * @returns GasLawResult containing the calculated volume in liters
 */
export function calculateGasVolume(params: GasLawParams): GasLawResult {
	// PV = nRT => V = nRT / P
	const { pressure, moles, temperature } = params;
	
	if (pressure <= 0 || moles < 0 || temperature <= 0) {
		return { volume: 0 };
	}
	
	const volume = (moles * IDEAL_GAS_CONSTANT * temperature) / pressure;
	
	return { volume };
}

/**
 * Calculates pressure using the ideal gas law: PV = nRT
 * 
 * @param params - Object containing volume (L), moles, and temperature (K)
 * @returns Pressure in atm
 */
export function calculateGasPressure(params: { volume: number; moles: number; temperature: number }): number {
	const { volume, moles, temperature } = params;
	
	if (volume <= 0 || moles < 0 || temperature <= 0) {
		return 0;
	}
	
	// P = nRT / V
	const pressure = (moles * IDEAL_GAS_CONSTANT * temperature) / volume;
	
	return pressure;
}

/**
 * Calculates moles using the ideal gas law: PV = nRT
 * 
 * @param params - Object containing pressure (atm), volume (L), and temperature (K)
 * @returns Moles of gas
 */
export function calculateMoles(params: { pressure: number; volume: number; temperature: number }): number {
	const { pressure, volume, temperature } = params;
	
	if (pressure <= 0 || volume <= 0 || temperature <= 0) {
		return 0;
	}
	
	// n = PV / RT
	const moles = (pressure * volume) / (IDEAL_GAS_CONSTANT * temperature);
	
	return moles;
}

/**
 * Calculates temperature using the ideal gas law: PV = nRT
 * 
 * @param params - Object containing pressure (atm), volume (L), and moles
 * @returns Temperature in Kelvin
 */
export function calculateTemperature(params: { pressure: number; volume: number; moles: number }): number {
	const { pressure, volume, moles } = params;
	
	if (pressure <= 0 || volume <= 0 || moles <= 0) {
		return 0;
	}
	
	// T = PV / nR
	const temperature = (pressure * volume) / (moles * IDEAL_GAS_CONSTANT);
	
	return temperature;
}

/**
 * Calculates pH from hydrogen ion concentration
 * 
 * @param concentration - H+ concentration in mol/L
 * @returns pH value
 */
export function calculatePH(concentration: number): number {
	if (concentration <= 0) {
		return 0;
	}
	return -Math.log10(concentration);
}

/**
 * Calculates H+ concentration from pH
 * 
 * @param ph - pH value
 * @returns H+ concentration in mol/L
 */
export function calculateHPlusFromPH(ph: number): number {
	return Math.pow(10, -ph);
}

/**
 * Calculates molarity (concentration)
 * 
 * @param moles - Number of moles
 * @param liters - Volume in liters
 * @returns Molarity in mol/L
 */
export function calculateMolarity(moles: number, liters: number): number {
	if (liters <= 0) {
		return 0;
	}
	return moles / liters;
}

/**
 * Calculates mass from moles and molar mass
 * 
 * @param moles - Number of moles
 * @param molarMass - Molar mass in g/mol
 * @returns Mass in grams
 */
export function calculateMass(moles: number, molarMass: number): number {
	return moles * molarMass;
}

/**
 * Calculates moles from mass and molar mass
 * 
 * @param mass - Mass in grams
 * @param molarMass - Molar mass in g/mol
 * @returns Number of moles
 */
export function calculateMolesFromMass(mass: number, molarMass: number): number {
	if (molarMass <= 0) {
		return 0;
	}
	return mass / molarMass;
}

/**
 * Calculates limiting reactant and theoretical yield
 * 
 * @param reactants - Array of objects with formula, moles, and molar mass
 * @param productFormula - Formula of the product
 * @param productCoefficient - Coefficient of the product in the balanced equation
 * @returns Object with limiting reactant and theoretical yield
 */
export function calculateLimitingReactant(
	reactants: Array<{ formula: string; moles: number; coefficient: number }>,
	productFormula: string,
	productCoefficient: number
): { limitingReactant: string; theoreticalYield: number } {
	// For simplicity, find the reactant with the smallest mole ratio
	let minRatio = Infinity;
	let limitingReactant = '';
	
	reactants.forEach(r => {
		const ratio = r.moles / r.coefficient;
		if (ratio < minRatio) {
			minRatio = ratio;
			limitingReactant = r.formula;
		}
	});
	
	// Calculate theoretical yield
	const productMolarMass = getMolarMass(productFormula).molarMass;
	const theoreticalYield = minRatio * productCoefficient * productMolarMass;
	
	return { limitingReactant, theoreticalYield };
}
