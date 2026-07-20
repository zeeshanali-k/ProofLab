import type { EquilibriumResult } from './types';

// Common equilibrium constants at 25°C
export const EQUILIBRIUM_CONSTANTS: Record<string, number> = {
	// Water autoionization
	'Kw': 1.0e-14,
	
	// Acid dissociation constants (Ka)
	'HF': 6.3e-4,
	'HCl': 1e10, // Strong acid
	'HBr': 1e10, // Strong acid
	'HI': 1e10, // Strong acid
	'HNO3': 1e10, // Strong acid
	'H2SO4': 1e10, // Strong acid (first dissociation)
	'HSO4-': 1.2e-2, // Second dissociation
	'CH3COOH': 1.8e-5, // Acetic acid
	'HCOOH': 1.8e-4, // Formic acid
	'HC2H3O2': 1.8e-5, // Acetic acid
	'HCN': 4.9e-10, // Hydrocyanic acid
	'H2CO3': 4.2e-7, // Carbonic acid (first)
	'HCO3-': 5.6e-11, // Carbonic acid (second)
	'H3PO4': 7.5e-3, // Phosphoric acid (first)
	'H2PO4-': 6.2e-8, // Phosphoric acid (second)
	'HPO4^2-': 2.2e-13, // Phosphoric acid (third)
	'NH4+': 5.6e-10, // Ammonium ion
	'H2S': 9.6e-8, // Hydrogen sulfide (first)
	'HS-': 1.3e-14, // Hydrogen sulfide (second)
	
	// Base dissociation constants (Kb)
	'NH3': 1.8e-5, // Ammonia
	'CH3NH2': 4.4e-4, // Methylamine
	'(CH3)2NH': 5.4e-4, // Dimethylamine
	'(CH3)3N': 7.4e-5, // Trimethylamine
	'C5H5N': 1.7e-9, // Pyridine
	
	// Solubility product constants (Ksp)
	'AgCl': 1.8e-10,
	'AgBr': 5.0e-13,
	'AgI': 8.3e-17,
	'Ag2S': 6.3e-50,
	'Ag2CO3': 8.1e-12,
	'Ag2CrO4': 1.1e-12,
	'Ag3PO4': 8.9e-17,
	'BaSO4': 1.1e-10,
	'BaCO3': 5.1e-9,
	'BaCrO4': 1.2e-10,
	'BaF2': 1.0e-6,
	'CaCO3': 3.3e-9,
	'CaF2': 3.9e-11,
	'Ca(OH)2': 5.5e-6,
	'CaSO4': 4.9e-5,
	'Cu(OH)2': 2.2e-20,
	'CuS': 6.3e-36,
	'Fe(OH)2': 4.9e-17,
	'Fe(OH)3': 2.8e-39,
	'FeS': 6.3e-18,
	'PbCl2': 1.7e-5,
	'PbCO3': 7.4e-14,
	'PbCrO4': 2.8e-13,
	'PbI2': 9.8e-9,
	'PbSO4': 1.8e-8,
	'MgCO3': 6.8e-6,
	'Mg(OH)2': 5.6e-12,
	'MgF2': 6.4e-9,
	'Mn(OH)2': 1.6e-13,
	'Ni(OH)2': 5.5e-16,
	'SrCO3': 5.6e-10,
	'SrSO4': 3.2e-7,
	'Zn(OH)2': 3.0e-17,
	'ZnS': 2.5e-22,
	
	// Formation constants (Kf) for complexes
	'[Ag(CN)2]-': 1e21,
	'[Ag(S2O3)]-': 2.9e13,
	'[Ag(NH3)2]+': 1.7e7,
	'[Cu(NH3)4]2+': 5.0e13,
	'[Fe(CN)6]4-': 1e35,
	'[Fe(CN)6]3-': 1e41,
	'[Zn(OH)4]2-': 3.6e15,
	'[Zn(NH3)4]2+': 3.6e9,
	'[Co(NH3)6]3+': 1.3e35,
	'[Ni(CN)4]2-': 1e22,
	
	// Gas phase equilibrium constants
	'H2 + I2 ⇌ 2HI': 54.5,
	'N2 + 3H2 ⇌ 2NH3': 0.040, // At 400°C, 200 atm
	'2SO2 + O2 ⇌ 2SO3': 4.0e24, // At 25°C
	'CH3OH ⇌ CO + 2H2': 2.0e-4, // At 25°C
	'CO + H2O ⇌ CO2 + H2': 1.0e5, // Water-gas shift at 25°C
	
	// Common ion pairs
	'HAc/Ac-': 1.8e-5, // Acetic acid
	'NH4+/NH3': 5.6e-10,
	'H2O/H+/OH-': 1.0e-14
};

// Common Ka values for weak acids
export const WEAK_ACIDS: Record<string, number> = {
	'Formic Acid (HCOOH)': 1.8e-4,
	'Acetic Acid (CH3COOH)': 1.8e-5,
	'Propionic Acid (C2H5COOH)': 1.3e-5,
	'Butyric Acid (C3H7COOH)': 1.5e-5,
	'Benzoic Acid (C6H5COOH)': 6.3e-5,
	'Carbonic Acid (H2CO3) - Ka1': 4.2e-7,
	'Carbonic Acid (H2CO3) - Ka2': 5.6e-11,
	'Hydrofluoric Acid (HF)': 6.3e-4,
	'Hydrogen Sulfide (H2S) - Ka1': 9.6e-8,
	'Hydrogen Sulfide (H2S) - Ka2': 1.3e-14,
	'Phosphoric Acid (H3PO4) - Ka1': 7.5e-3,
	'Phosphoric Acid (H3PO4) - Ka2': 6.2e-8,
	'Phosphoric Acid (H3PO4) - Ka3': 2.2e-13,
	'Hypochlorous Acid (HClO)': 3.0e-8,
	'Chlorous Acid (HClO2)': 1.1e-2,
	'Chloric Acid (HClO3)': 1e10,
	'Perchloric Acid (HClO4)': 1e10,
	'Nitrous Acid (HNO2)': 4.5e-4,
	'Sulfurous Acid (H2SO3) - Ka1': 1.4e-2,
	'Sulfurous Acid (H2SO3) - Ka2': 6.3e-8
};

// Common Kb values for weak bases
export const WEAK_BASES: Record<string, number> = {
	'Ammonia (NH3)': 1.8e-5,
	'Methylamine (CH3NH2)': 4.4e-4,
	'Dimethylamine ((CH3)2NH)': 5.4e-4,
	'Trimethylamine ((CH3)3N)': 7.4e-5,
	'Ethylamine (C2H5NH2)': 5.6e-4,
	'Diethylamine ((C2H5)2NH)': 6.9e-4,
	'Triethylamine ((C2H5)3N)': 5.6e-4,
	'Pyridine (C5H5N)': 1.7e-9,
	'Aniline (C6H5NH2)': 3.8e-10,
	'Hydroxylamine (NH2OH)': 1.1e-8
};

/**
 * Calculate equilibrium constant from reaction quotient
 */
export function calculateEquilibriumConstant(
	reaction: string,
	concentrations: Record<string, number>,
	Kc?: number
): number {
	// If Kc is provided, return it
	if (Kc !== undefined) return Kc;
	
	// Otherwise, try to find in database
	const foundK = EQUILIBRIUM_CONSTANTS[reaction] || 
				  EQUILIBRIUM_CONSTANTS[reaction.replace(/\s+/g, ' ')] ||
				  EQUILIBRIUM_CONSTANTS[reaction.replace(/⇌/g, '<->')] ||
				  0;
	
	return foundK;
}

/**
 * Calculate reaction quotient Q from concentrations
 */
export function calculateReactionQuotient(
	reactants: Array<{ species: string; coefficient: number }>,
	products: Array<{ species: string; coefficient: number }>,
	concentrations: Record<string, number>
): number {
	let Q = 1;
	
	// Q = [products]^coefficients / [reactants]^coefficients
	for (const product of products) {
		const concentration = concentrations[product.species] || 0;
		if (concentration > 0) {
			Q *= Math.pow(concentration, product.coefficient);
		} else {
			// If concentration is 0 or not provided, assume very small
			Q *= Math.pow(1e-10, product.coefficient);
		}
	}
	
	for (const reactant of reactants) {
		const concentration = concentrations[reactant.species] || 0;
		if (concentration > 0) {
			Q /= Math.pow(concentration, reactant.coefficient);
		} else {
			// If concentration is 0 or not provided, assume very small
			Q /= Math.pow(1e-10, reactant.coefficient);
		}
	}
	
	return Q;
}

/**
 * Determine reaction direction from Q and K
 */
export function determineReactionDirection(Q: number, K: number): 'forward' | 'reverse' | 'at equilibrium' {
	if (Math.abs(Q - K) < 1e-10 * Math.max(Math.abs(Q), Math.abs(K))) {
		return 'at equilibrium';
	}
	return Q < K ? 'forward' : 'reverse';
}

/**
 * Calculate equilibrium concentrations using ICE table
 */
export function calculateEquilibriumConcentrations(
	reactants: Array<{ species: string; coefficient: number; initial: number }>,
	products: Array<{ species: string; coefficient: number; initial: number }>,
	Kc: number,
	volume?: number
): {
	Q: number;
	direction: 'forward' | 'reverse' | 'at equilibrium';
	concentrations: Record<string, number>;
	change: number
} {
	// ICE table method
	// I = Initial concentrations
	// C = Change (-x for reactants, +x for products based on stoichiometry)
	// E = Equilibrium concentrations
	
	const concentrations: Record<string, number> = {};
	
	// Initial Q
	const initialReactants = reactants.map(r => ({ ...r }));
	const initialProducts = products.map(p => ({ ...p }));
	
	const Q = calculateReactionQuotient(
		initialReactants,
		initialProducts,
		{ ...Object.fromEntries(initialReactants.map(r => [r.species, r.initial])),
		  ...Object.fromEntries(initialProducts.map(pr => [pr.species, pr.initial])) }
	);
	
	const direction = determineReactionDirection(Q, Kc);
	
	// For simple case with single variable x
	// This is a simplified approach - real solutions require solving equations
	let change = 0;
	
	if (direction === 'forward' && Kc > 0) {
		// Reaction proceeds forward
		// Find limiting reactant based on stoichiometry
		const limitingReactant = findLimitingReactantForEquilibrium(initialReactants);
		if (limitingReactant) {
			const maxChange = limitingReactant.initial / limitingReactant.coefficient;
			// Estimate x using approximation for small changes
			// Q + dQ ≈ K => x ≈ (K - Q) / sum of coefficients
			const sumCoefficients = [...reactants, ...products]
				.map(s => s.coefficient)
				.reduce((a, b) => a + b, 0);
			change = Math.min(maxChange, (Kc - Q) / sumCoefficients);
		}
	} else if (direction === 'reverse' && Kc > 0) {
		// Reaction proceeds in reverse
		const limitingProduct = findLimitingProductForEquilibrium(initialProducts);
		if (limitingProduct) {
			const maxChange = limitingProduct.initial / limitingProduct.coefficient;
			change = -Math.min(maxChange, (Q - Kc) / ([...reactants, ...products]
				.map(s => s.coefficient)
				.reduce((a, b) => a + b, 0)));
		}
	}
	
	// Calculate equilibrium concentrations
	for (const reactant of initialReactants) {
		concentrations[reactant.species] = reactant.initial - change * reactant.coefficient;
	}
	for (const product of initialProducts) {
		concentrations[product.species] = product.initial + change * product.coefficient;
	}
	
	return { Q, direction, concentrations, change };
}

/**
 * Find limiting reactant for equilibrium calculation
 */
function findLimitingReactantForEquilibrium(
	reactants: Array<{ species: string; coefficient: number; initial: number }>
): { species: string; coefficient: number; initial: number } | null {
	let limiting = null;
	let minRatio = Infinity;
	
	for (const reactant of reactants) {
		if (reactant.initial > 0) {
			const ratio = reactant.initial / reactant.coefficient;
			if (ratio < minRatio) {
				minRatio = ratio;
				limiting = reactant;
			}
		}
	}
	
	return limiting;
}

/**
 * Find limiting product for reverse reaction
 */
function findLimitingProductForEquilibrium(
	products: Array<{ species: string; coefficient: number; initial: number }>
): { species: string; coefficient: number; initial: number } | null {
	let limiting = null;
	let minRatio = Infinity;
	
	for (const product of products) {
		if (product.initial > 0) {
			const ratio = product.initial / product.coefficient;
			if (ratio < minRatio) {
				minRatio = ratio;
				limiting = product;
			}
		}
	}
	
	return limiting;
}

/**
 * Calculate pH from Ka and concentration for weak acid
 */
export function calculateWeakAcidPH(
	Ka: number,
	concentration: number,
	initialPH?: number
): { pH: number; hPlus: number; alpha: number } {
	// For weak acid: HA ⇌ H+ + A-
	// Ka = [H+][A-] / [HA]
	// If x = [H+] = [A-], then [HA] = C - x
	// Ka = x^2 / (C - x)
	// x^2 + Ka*x - Ka*C = 0
	// Using quadratic formula: x = [-Ka + sqrt(Ka^2 + 4*Ka*C)] / 2
	
	if (Ka === 0 || concentration === 0) {
		return { pH: 7, hPlus: 1e-7, alpha: 0 };
	}
	
	const discriminant = Ka * Ka + 4 * Ka * concentration;
	const hPlus = (-Ka + Math.sqrt(discriminant)) / 2;
	const pH = -Math.log10(hPlus);
	const alpha = hPlus / concentration; // Degree of ionization
	
	return { pH, hPlus, alpha };
}

/**
 * Calculate pH from Kb and concentration for weak base
 */
export function calculateWeakBasePH(
	Kb: number,
	concentration: number
): { pOH: number; pH: number; ohMinus: number; alpha: number } {
	// For weak base: B + H2O ⇌ BH+ + OH-
	// Kb = [BH+][OH-] / [B]
	// Similar to weak acid calculation
	
	if (Kb === 0 || concentration === 0) {
		return { pOH: 7, pH: 7, ohMinus: 1e-7, alpha: 0 };
	}
	
	const discriminant = Kb * Kb + 4 * Kb * concentration;
	const ohMinus = (-Kb + Math.sqrt(discriminant)) / 2;
	const pOH = -Math.log10(ohMinus);
	const pH = 14 - pOH;
	const alpha = ohMinus / concentration;
	
	return { pOH, pH, ohMinus, alpha };
}

/**
 * Calculate buffer pH using Henderson-Hasselbalch equation
 */
export function calculateBufferPH(
	pKa: number,
	ratio: number // [A-]/[HA]
): number {
	// Henderson-Hasselbalch: pH = pKa + log([A-]/[HA])
	return pKa + Math.log10(ratio);
}

/**
 * Calculate buffer capacity
 */
export function calculateBufferCapacity(
	concentrationAcid: number,
	concentrationBase: number
): number {
	// Buffer capacity ≈ total concentration of buffer components
	return concentrationAcid + concentrationBase;
}

/**
 * Calculate common ion effect on solubility
 */
export function calculateCommonIonEffect(
	Ksp: number,
	commonIonConcentration: number,
	cationCount: number = 1,
	anionCount: number = 1
): { solubility: number; withoutCommonIon: number } {
	// For a salt: A_aB_b(s) ⇌ a A^m+ + b B^n-
	// Ksp = [A]^a [B]^b
	// With common ion, if [B] = C_common, then:
	// Ksp = [A]^a (C_common + b*s)^b
	// For 1:1 salt: Ksp = s * (C_common + s)
	// s^2 + C_common * s - Ksp = 0
	// s = [-C_common + sqrt(C_common^2 + 4*Ksp)] / 2
	
	const withoutCommonIon = Math.pow(Ksp, 1 / (cationCount + anionCount));
	
	const discriminant = commonIonConcentration * commonIonConcentration + 4 * Ksp;
	const solubility = (-commonIonConcentration + Math.sqrt(discriminant)) / 2;
	
	return { solubility, withoutCommonIon };
}

/**
 * Calculate Le Chatelier's principle effect
 */
export function analyzeLeChatelier(
	reaction: string,
	change: string
): string {
	// Simple analysis based on reaction type
	const analysis: Record<string, Record<string, string>> = {
		'N2 + 3H2 ⇌ 2NH3': {
			'add N2': 'Shifts right (more NH3)',
			'add H2': 'Shifts right (more NH3)',
			'add NH3': 'Shifts left (less NH3)',
			'remove N2': 'Shifts left (less NH3)',
			'remove H2': 'Shifts left (less NH3)',
			'remove NH3': 'Shifts right (more NH3)',
			'increase pressure': 'Shifts right (fewer gas molecules)',
			'decrease pressure': 'Shifts left (more gas molecules)',
			'increase temperature': 'Shifts left (endothermic in reverse)',
			'decrease temperature': 'Shifts right (exothermic forward)'
		},
		'H2 + I2 ⇌ 2HI': {
			'add H2': 'Shifts right (more HI)',
			'add I2': 'Shifts right (more HI)',
			'add HI': 'Shifts left (less HI)',
			'increase pressure': 'No shift (same number of gas molecules)',
			'increase temperature': 'Shifts right (endothermic forward)'
		},
		'2SO2 + O2 ⇌ 2SO3': {
			'add SO2': 'Shifts right (more SO3)',
			'add O2': 'Shifts right (more SO3)',
			'add SO3': 'Shifts left (less SO3)',
			'increase pressure': 'Shifts right (fewer gas molecules)',
			'increase temperature': 'Shifts left (exothermic in reverse)'
		}
	};
	
	return analysis[reaction]?.[change] || 'No significant shift predicted';
}

/**
 * Get equilibrium constant from database
 */
export function getEquilibriumConstant(reaction: string): number {
	return EQUILIBRIUM_CONSTANTS[reaction] || 0;
}

/**
 * Get Ka for weak acid
 */
export function getKa(acid: string): number {
	return WEAK_ACIDS[acid] || 0;
}

/**
 * Get Kb for weak base
 */
export function getKb(base: string): number {
	return WEAK_BASES[base] || 0;
}

export default {
	calculateEquilibriumConstant,
	calculateReactionQuotient,
	determineReactionDirection,
	calculateEquilibriumConcentrations,
	calculateWeakAcidPH,
	calculateWeakBasePH,
	calculateBufferPH,
	calculateBufferCapacity,
	calculateCommonIonEffect,
	analyzeLeChatelier,
	getEquilibriumConstant,
	getKa,
	getKb,
	EQUILIBRIUM_CONSTANTS,
	WEAK_ACIDS,
	WEAK_BASES
};
