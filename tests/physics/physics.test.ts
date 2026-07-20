import { describe, expect, test } from 'vitest';
import { validateEquation } from '@/lib/physics/validator';
import { solveKinematics } from '@/lib/physics/kinematics';
import { calculateEnergy } from '@/lib/physics/energy';
import { createVector, addVectors, subtractVectors, scaleVector, dotProduct } from '@/lib/physics/vectors';
import { PHYSICS_EQUATIONS } from '@/lib/physics/equations';

describe('Physics Validator', () => {
	test('detects missing variables', () => {
		const errors = validateEquation('F = m * a', { m: 5 });
		expect(errors.some(e => e.field === 'a')).toBe(true);
	});

	test('accepts valid inputs', () => {
		const errors = validateEquation('F = m * a', { F: 50, m: 5, a: 10 });
		expect(errors.length).toBe(0);
	});

	test('detects division by zero', () => {
		const errors = validateEquation('v = d / t', { d: 10, t: 0 });
		expect(errors.some(e => e.type === 'out_of_range')).toBe(true);
	});
});

describe('Kinematics Solver', () => {
	test('solves for displacement', () => {
		const result = solveKinematics({ u: 0, a: 2, t: 5 });
		expect(result.displacement).toBeCloseTo(25, 2);
	});

	test('solves for final velocity', () => {
		const result = solveKinematics({ u: 10, a: 3, t: 4 });
		expect(result.finalVelocity).toBeCloseTo(22, 2);
	});

	test('handles zero acceleration', () => {
		const result = solveKinematics({ u: 5, a: 0, t: 10 });
		expect(result.displacement).toBeCloseTo(50, 2);
		expect(result.finalVelocity).toBeCloseTo(5, 2);
	});

	test('generates graph data', () => {
		const result = solveKinematics({ u: 0, a: 2, t: 5 });
		expect(result.graphs.position.t.length).toBe(50);
		expect(result.graphs.velocity.values.length).toBe(50);
		expect(result.graphs.acceleration.values.length).toBe(50);
	});
});

describe('Energy Calculator', () => {
	test('calculates KE and PE correctly', () => {
		const result = calculateEnergy(2, 10, 5);
		expect(result.kinetic).toBe(100);
		expect(result.potential).toBeCloseTo(98.1, 1);
		expect(result.total).toBeCloseTo(198.1, 1);
	});

	test('zero velocity gives zero KE', () => {
		const result = calculateEnergy(5, 0, 10);
		expect(result.kinetic).toBe(0);
		expect(result.potential).toBeCloseTo(490.5, 1);
	});

	test('zero height gives zero PE', () => {
		const result = calculateEnergy(3, 8, 0);
		expect(result.potential).toBe(0);
		expect(result.kinetic).toBe(96);
	});

	test('custom gravity', () => {
		const result = calculateEnergy(1, 0, 10, 3.7);
		expect(result.potential).toBeCloseTo(37, 1);
	});
});

describe('Vector Operations', () => {
	test('creates vector with correct magnitude and angle', () => {
		const v = createVector(3, 4);
		expect(v.magnitude).toBeCloseTo(5, 5);
		expect(v.angle).toBeCloseTo(53.13, 1);
	});

	test('adds vectors correctly', () => {
		const v1 = createVector(3, 4);
		const v2 = createVector(2, 1);
		const sum = addVectors([v1, v2]);
		expect(sum.x).toBe(5);
		expect(sum.y).toBe(5);
		expect(sum.magnitude).toBeCloseTo(7.07, 1);
	});

	test('subtracts vectors', () => {
		const v1 = createVector(5, 3);
		const v2 = createVector(2, 1);
		const diff = subtractVectors(v1, v2);
		expect(diff.x).toBe(3);
		expect(diff.y).toBe(2);
	});

	test('scales vector', () => {
		const v = createVector(2, 3);
		const scaled = scaleVector(v, 2);
		expect(scaled.x).toBe(4);
		expect(scaled.y).toBe(6);
	});

	test('dot product', () => {
		const v1 = createVector(1, 2);
		const v2 = createVector(3, 4);
		expect(dotProduct(v1, v2)).toBe(11);
	});

	test('zero vector', () => {
		const v = createVector(0, 0);
		expect(v.magnitude).toBe(0);
	});
});

describe('Physics Equations', () => {
	test('Newton second law solves correctly', () => {
		const eq = PHYSICS_EQUATIONS.find(e => e.id === 'newton_second');
		expect(eq).toBeDefined();
		expect(eq!.solveFor('F', { m: 5, a: 10 })).toBe(50);
		expect(eq!.solveFor('m', { F: 50, a: 10 })).toBe(5);
		expect(eq!.solveFor('a', { F: 50, m: 10 })).toBe(5);
	});

	test('kinematics velocity equation', () => {
		const eq = PHYSICS_EQUATIONS.find(e => e.id === 'kinematics_v');
		expect(eq).toBeDefined();
		expect(eq!.solveFor('v', { u: 5, a: 2, t: 3 })).toBe(11);
	});

	test('energy KE equation', () => {
		const eq = PHYSICS_EQUATIONS.find(e => e.id === 'energy_ke');
		expect(eq).toBeDefined();
		expect(eq!.solveFor('KE', { m: 4, v: 3 })).toBe(18);
	});

	test('energy PE equation', () => {
		const eq = PHYSICS_EQUATIONS.find(e => e.id === 'energy_pe');
		expect(eq).toBeDefined();
		expect(eq!.solveFor('PE', { m: 2, g: 9.81, h: 5 })).toBeCloseTo(98.1, 1);
	});

	test('validation catches invalid mass', () => {
		const eq = PHYSICS_EQUATIONS.find(e => e.id === 'newton_second');
		const result = eq!.validate({ F: 10, m: -1, a: 5 });
		expect(result.isValid).toBe(false);
		expect(result.errors.length).toBeGreaterThan(0);
	});
});
