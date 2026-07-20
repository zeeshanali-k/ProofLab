import type { MolarityResult, DilutionResult, SolutionMixingResult } from './types';

// Avogadro's number
const AVOGADRO = 6.02214076e23;

/**
 * Calculate molarity (M = moles / liters)
 */
export function calculateMolarity(
	moles: number,
	volumeLiters: number
): MolarityResult {
	if (volumeLiters === 0) {
		return {
			molarity: 0,
			moles: 0,
			volumeLiters: 0,
			formula: ''
		};
	}
	
	const molarity = moles / volumeLiters;
	
	return {
		molarity,
		moles,
		volumeLiters,
		formula: ''
	};
}

/**
 * Calculate molarity from mass and volume
 */
export function calculateMolarityFromMass(
	formula: string,
	massGrams: number,
	volumeLiters: number,
	molarMass: number
): MolarityResult {
	if (volumeLiters === 0 || molarMass === 0) {
		return {
			molarity: 0,
			moles: 0,
			volumeLiters: 0,
			formula
		};
	}
	
	const moles = massGrams / molarMass;
	const molarity = moles / volumeLiters;
	
	return {
		molarity,
		moles,
		volumeLiters,
		formula
	};
}

/**
 * Calculate moles from molarity and volume (M * V = moles)
 */
export function calculateMoles(
	molarity: number,
	volumeLiters: number
): number {
	return molarity * volumeLiters;
}

/**
 * Calculate volume from moles and molarity (V = moles / M)
 */
export function calculateVolume(
	moles: number,
	molarity: number
): number {
	if (molarity === 0) return 0;
	return moles / molarity;
}

/**
 * Calculate mass from molarity, volume, and molar mass
 */
export function calculateMass(
	molarity: number,
	volumeLiters: number,
	molarMass: number
): number {
	return molarity * volumeLiters * molarMass;
}

/**
 * Dilution calculator: M1 * V1 = M2 * V2
 */
export function calculateDilution(
	initialMolarity: number,
	initialVolume: number,
	finalMolarity: number
): DilutionResult {
	if (finalMolarity === 0 || initialMolarity === 0) {
		return {
			initialMolarity,
			initialVolume,
			finalVolume: 0,
			finalMolarity,
			volumeToAdd: 0
		};
	}
	
	// M1 * V1 = M2 * V2 => V2 = (M1 * V1) / M2
	const finalVolume = (initialMolarity * initialVolume) / finalMolarity;
	const volumeToAdd = finalVolume - initialVolume;
	
	return {
		initialMolarity,
		initialVolume,
		finalVolume,
		finalMolarity,
		volumeToAdd
	};
}

/**
 * Calculate final concentration after mixing two solutions
 */
export function calculateSolutionMixing(
	molarity1: number,
	volume1: number,
	molarity2: number,
	volume2: number
): SolutionMixingResult {
	const moles1 = molarity1 * volume1;
	const moles2 = molarity2 * volume2;
	const totalMoles = moles1 + moles2;
	const finalVolume = volume1 + volume2;
	const finalMolarity = finalVolume > 0 ? totalMoles / finalVolume : 0;
	
	return {
		moles1,
		moles2,
		totalMoles,
		finalMolarity,
		finalVolume
	};
}

/**
 * Calculate concentration from mass percent to molarity
 */
export function calculateMassPercentToMolarity(
	massPercent: number,
	density: number,
	molarMass: number
): number {
	// massPercent is % by mass (e.g., 5% = 5)
	// density is g/mL
	// Convert to g/L
	const massPerLiter = (massPercent / 100) * density * 1000;
	const molesPerLiter = massPerLiter / molarMass;
	return molesPerLiter;
}

/**
 * Calculate molality (m = moles / kg of solvent)
 */
export function calculateMolality(
	moles: number,
	massSolventKg: number
): number {
	if (massSolventKg === 0) return 0;
	return moles / massSolventKg;
}

/**
 * Calculate mole fraction
 */
export function calculateMoleFraction(
	molesComponent: number,
	totalMoles: number
): number {
	if (totalMoles === 0) return 0;
	return molesComponent / totalMoles;
}

/**
 * Calculate ppm (parts per million)
 */
export function calculatePPM(
	massSolute: number,
	massSolution: number
): number {
	if (massSolution === 0) return 0;
	return (massSolute / massSolution) * 1e6;
}

/**
 * Calculate ppb (parts per billion)
 */
export function calculatePPB(
	massSolute: number,
	massSolution: number
): number {
	if (massSolution === 0) return 0;
	return (massSolute / massSolution) * 1e9;
}

/**
 * Convert between concentration units
 */
export function convertConcentration(
	value: number,
	fromUnit: string,
	toUnit: string,
	molarMass?: number,
	density?: number
): number {
	// Normalize units
	const from = fromUnit.toLowerCase();
	const to = toUnit.toLowerCase();
	
	// If same unit, return value
	if (from === to) return value;
	
	// Convert to mol/L first, then to target unit
	let molPerLiter = value;
	
	// Convert from other units to mol/L
	switch (from) {
		case 'm': // Molarity (already mol/L)
			break;
		case 'mm': // Millimolar
			molPerLiter = value / 1000;
			break;
		case 'μm': // Micromolar
			molPerLiter = value / 1e6;
			break;
		case 'nm': // Nanomolar
			molPerLiter = value / 1e9;
			break;
		case 'g/l': // g/L
			if (!molarMass) throw new Error('Molar mass required for g/L conversion');
			molPerLiter = value / molarMass;
			break;
		case 'mg/l': // mg/L
			if (!molarMass) throw new Error('Molar mass required for mg/L conversion');
			molPerLiter = (value / 1000) / molarMass;
			break;
		case 'μg/ml': // μg/mL
			if (!molarMass) throw new Error('Molar mass required for μg/mL conversion');
			molPerLiter = (value * 1000) / molarMass;
			break;
		case 'mg/ml': // mg/mL = g/L
			if (!molarMass) throw new Error('Molar mass required for mg/mL conversion');
			molPerLiter = (value * 1000) / molarMass;
			break;
		case '%': // Percent by mass (assuming density of water = 1 g/mL)
			if (!molarMass || !density) throw new Error('Molar mass and density required for % conversion');
			molPerLiter = ((value / 100) * density * 1000) / molarMass;
			break;
		case 'ppm': // Parts per million
			if (!molarMass) throw new Error('Molar mass required for ppm conversion');
			molPerLiter = (value / 1e6) / molarMass;
			break;
		case 'ppb': // Parts per billion
			if (!molarMass) throw new Error('Molar mass required for ppb conversion');
			molPerLiter = (value / 1e9) / molarMass;
			break;
		default:
			throw new Error(`Unknown unit: ${fromUnit}`);
	}
	
	// Convert from mol/L to target unit
	switch (to) {
		case 'm':
			return molPerLiter;
		case 'mm':
			return molPerLiter * 1000;
		case 'μm':
			return molPerLiter * 1e6;
		case 'nm':
			return molPerLiter * 1e9;
		case 'g/l':
			if (!molarMass) throw new Error('Molar mass required for g/L conversion');
			return molPerLiter * molarMass;
		case 'mg/l':
			if (!molarMass) throw new Error('Molar mass required for mg/L conversion');
			return molPerLiter * molarMass * 1000;
		case 'μg/ml':
			if (!molarMass) throw new Error('Molar mass required for μg/mL conversion');
			return molPerLiter * molarMass / 1000;
		case 'mg/ml':
			if (!molarMass) throw new Error('Molar mass required for mg/mL conversion');
			return molPerLiter * molarMass / 1000;
		case '%':
			if (!molarMass || !density) throw new Error('Molar mass and density required for % conversion');
			return (molPerLiter * molarMass / (density * 1000)) * 100;
		case 'ppm':
			if (!molarMass) throw new Error('Molar mass required for ppm conversion');
			return (molPerLiter * molarMass) * 1e6;
		case 'ppb':
			if (!molarMass) throw new Error('Molar mass required for ppb conversion');
			return (molPerLiter * molarMass) * 1e9;
		default:
			throw new Error(`Unknown unit: ${toUnit}`);
	}
}

/**
 * Calculate pH from [H+]
 */
export function calculatePH(hPlusConcentration: number): number {
	if (hPlusConcentration <= 0) return 14; // Default to basic
	return -Math.log10(hPlusConcentration);
}

/**
 * Calculate [H+] from pH
 */
export function calculateHPlusFromPH(pH: number): number {
	return Math.pow(10, -pH);
}

/**
 * Calculate pOH from [OH-]
 */
export function calculatePOH(ohMinusConcentration: number): number {
	if (ohMinusConcentration <= 0) return 0;
	return -Math.log10(ohMinusConcentration);
}

/**
 * Calculate [OH-] from pOH
 */
export function calculateOHMinusFromPOH(pOH: number): number {
	return Math.pow(10, -pOH);
}

/**
 * Calculate Kw (ion product of water) at 25°C
 */
export function getKw(temperature: number = 25): number {
	// Simplified: Kw ≈ 1.0 × 10^-14 at 25°C
	// More accurate: Kw varies with temperature
	const kwValues: Record<number, number> = {
		0: 0.11e-14,
		10: 0.29e-14,
		20: 0.68e-14,
		25: 1.00e-14,
		30: 1.47e-14,
		35: 2.08e-14,
		40: 2.92e-14,
		50: 5.48e-14
	};
	
	return kwValues[Math.round(temperature)] || 1.0e-14;
}

/**
 * Calculate solubility from Ksp
 */
export function calculateSolubility(
	Ksp: number,
	cationCharge: number,
	anionCharge: number
): number {
	// For a salt like AgCl: Ag+ + Cl- ⇌ AgCl(s)
	// Ksp = [Ag+][Cl-] = s^2, where s is solubility
	// For general case: Ksp = (s * cationCharge)^cationCount * (s * anionCharge)^anionCount
	// Simplified: assume 1:1 ratio
	return Math.sqrt(Ksp);
}

/**
 * Calculate degree of ionization (alpha) from Ka and concentration
 */
export function calculateAlpha(
	Ka: number,
	concentration: number
): number {
	// For weak acid: HA ⇌ H+ + A-
	// Ka = [H+][A-] / [HA]
	// If alpha = degree of ionization, then:
	// [H+] = [A-] = alpha * C
	// [HA] = (1 - alpha) * C
	// Ka = (alpha * C)^2 / ((1 - alpha) * C) = alpha^2 * C / (1 - alpha)
	// For weak acids (alpha << 1): Ka ≈ alpha^2 * C
	// Therefore: alpha ≈ sqrt(Ka / C)
	if (Ka === 0 || concentration === 0) return 0;
	return Math.sqrt(Ka / concentration);
}

export default {
	calculateMolarity,
	calculateMolarityFromMass,
	calculateMoles,
	calculateVolume,
	calculateMass,
	calculateDilution,
	calculateSolutionMixing,
	calculateMassPercentToMolarity,
	calculateMolality,
	calculateMoleFraction,
	calculatePPM,
	calculatePPB,
	convertConcentration,
	calculatePH,
	calculateHPlusFromPH,
	calculatePOH,
	calculateOHMinusFromPOH,
	getKw,
	calculateSolubility,
	calculateAlpha,
	AVOGADRO
};
