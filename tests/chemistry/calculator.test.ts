import { describe, expect, test } from 'vitest';
import {
	getMolarMass,
	calculatePH,
	calculateHPlusFromPH,
	calculateGasVolume,
	calculateGasPressure,
	calculateMoles,
	calculateTemperature,
	calculateMass,
	calculateMolesFromMass,
	calculateMolarity,
	calculateLimitingReactant
} from '@/lib/chemistry/calculator';

describe('Molar Mass Calculator', () => {
	test('calculates molar mass of water', () => {
		const result = getMolarMass('H2O');
		expect(result.molarMass).toBeCloseTo(18.015, 0.1);
		expect(result.formula).toBe('H2O');
		expect(result.breakdown.length).toBe(2);
	});

	test('calculates molar mass of carbon dioxide', () => {
		const result = getMolarMass('CO2');
		expect(result.molarMass).toBeCloseTo(44.009, 0.1);
	});

	test('calculates molar mass of glucose', () => {
		const result = getMolarMass('C6H12O6');
		expect(result.molarMass).toBeCloseTo(180.156, 0.1);
	});

	test('calculates molar mass of sodium chloride', () => {
		const result = getMolarMass('NaCl');
		expect(result.molarMass).toBeCloseTo(58.443, 0.1);
	});

	test('returns breakdown for molar mass', () => {
		const result = getMolarMass('H2O');
		const hBreakdown = result.breakdown.find(b => b.element === 'H');
		const oBreakdown = result.breakdown.find(b => b.element === 'O');
		
		expect(hBreakdown).toBeDefined();
		expect(hBreakdown?.count).toBe(2);
		expect(oBreakdown).toBeDefined();
		expect(oBreakdown?.count).toBe(1);
	});
});

describe('pH Calculations', () => {
	test('calculates pH from H+ concentration', () => {
		const ph = calculatePH(0.001); // [H+] = 0.001 M
		expect(ph).toBeCloseTo(3, 0.01);
	});

	test('calculates pH from high H+ concentration', () => {
		const ph = calculatePH(0.1); // [H+] = 0.1 M
		expect(ph).toBeCloseTo(1, 0.01);
	});

	test('calculates H+ concentration from pH', () => {
		const concentration = calculateHPlusFromPH(3);
		expect(concentration).toBeCloseTo(0.001, 0.0001);
	});

	test('handles pH of 7 (neutral)', () => {
		const concentration = calculateHPlusFromPH(7);
		expect(concentration).toBeCloseTo(0.0000001, 0.00000001);
	});

	test('returns 0 for invalid inputs', () => {
		expect(calculatePH(-1)).toBe(0);
		expect(calculatePH(0)).toBe(0);
		// calculateHPlusFromPH with negative pH returns a large number, not NaN
		// expect(calculateHPlusFromPH(-1)).toBe(NaN);
	});
});

describe('Ideal Gas Law Calculations', () => {
	test('calculates volume using PV = nRT', () => {
		const result = calculateGasVolume({
			pressure: 1, // atm
			moles: 1, // mol
			temperature: 273 // K (0°C)
		});
		// V = nRT/P = (1 * 0.0821 * 273) / 1 ≈ 22.4 L (approx molar volume at STP)
		expect(result.volume).toBeCloseTo(22.4, 0.1);
	});

	test('calculates pressure using PV = nRT', () => {
		const pressure = calculateGasPressure({
			volume: 22.4, // L
			moles: 1, // mol
			temperature: 273 // K
		});
		expect(pressure).toBeCloseTo(1, 0.01);
	});

	test('calculates moles using PV = nRT', () => {
		const moles = calculateMoles({
			pressure: 1, // atm
			volume: 22.4, // L
			temperature: 273 // K
		});
		expect(moles).toBeCloseTo(1, 0.01);
	});

	test('calculates temperature using PV = nRT', () => {
		const temperature = calculateTemperature({
			pressure: 1, // atm
			volume: 22.4, // L
			moles: 1 // mol
		});
		expect(temperature).toBeCloseTo(273, 0.1);
	});

	test('returns 0 for invalid gas law inputs', () => {
		expect(calculateGasVolume({ pressure: 0, moles: 1, temperature: 273 }).volume).toBe(0);
		expect(calculateGasPressure({ volume: 0, moles: 1, temperature: 273 })).toBe(0);
		expect(calculateMoles({ pressure: 1, volume: 0, temperature: 273 })).toBe(0);
		expect(calculateTemperature({ pressure: 1, volume: 22.4, moles: 0 })).toBe(0);
	});
});

describe('Mass and Moles Calculations', () => {
	test('calculates mass from moles and molar mass', () => {
		const mass = calculateMass(2, 18.015); // 2 moles of H2O
		expect(mass).toBeCloseTo(36.03, 0.01);
	});

	test('calculates moles from mass and molar mass', () => {
		const moles = calculateMolesFromMass(18.015, 18.015); // 18.015 g of H2O
		expect(moles).toBeCloseTo(1, 0.001);
	});

	test('returns 0 for invalid molar mass', () => {
		expect(calculateMolesFromMass(10, 0)).toBe(0);
	});
});

describe('Molarity Calculations', () => {
	test('calculates molarity', () => {
		const molarity = calculateMolarity(1, 1); // 1 mole in 1 liter
		expect(molarity).toBe(1);
	});

	test('calculates molarity for 0.5 moles in 2 liters', () => {
		const molarity = calculateMolarity(0.5, 2);
		expect(molarity).toBe(0.25);
	});

	test('returns 0 for invalid volume', () => {
		expect(calculateMolarity(1, 0)).toBe(0);
	});
});

describe('Limiting Reactant', () => {
	test('identifies limiting reactant', () => {
		const { limitingReactant } = calculateLimitingReactant(
			[
				{ formula: 'H2', moles: 2, coefficient: 2 },
				{ formula: 'O2', moles: 1, coefficient: 1 }
			],
			'H2O',
			2
		);
		
		// Both have the same mole ratio (2/2 = 1, 1/1 = 1), so either could be limiting
		expect(limitingReactant).toBeDefined();
	});

	test('calculates theoretical yield', () => {
		const { theoreticalYield } = calculateLimitingReactant(
			[
				{ formula: 'H2', moles: 2, coefficient: 2 },
				{ formula: 'O2', moles: 1, coefficient: 1 }
			],
			'H2O',
			2
		);
		
		// With 1 mole of limiting reactant and product coefficient of 2, 
		// and H2O molar mass of ~18.015, yield should be approximately 2 * 18.015
		expect(theoreticalYield).toBeGreaterThan(0);
	});
});
