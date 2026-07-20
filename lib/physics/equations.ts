import type { PhysicsEquation } from './types';

export const PHYSICS_EQUATIONS: PhysicsEquation[] = [
	{
		id: 'newton_second',
		name: "Newton's Second Law",
		latex: 'F = ma',
		variables: [
			{ symbol: 'F', name: 'Force', unit: 'N', min: 0, max: 100, default: 10 },
			{ symbol: 'm', name: 'Mass', unit: 'kg', min: 0.1, max: 50, default: 2 },
			{ symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: 0, max: 20, default: 5 },
		],
		solveFor: (target, known) => {
			if (target === 'F') return known.m * known.a;
			if (target === 'm') return known.a !== 0 ? known.F / known.a : null;
			if (target === 'a') return known.m !== 0 ? known.F / known.m : null;
			return null;
		},
		validate: (inputs) => {
			const errors: any[] = [];
			if (inputs.m <= 0) errors.push({ field: 'm', message: 'Mass must be positive', type: 'out_of_range' });
			return { isValid: errors.length === 0, errors };
		}
	},
	{
		id: 'kinematics_v',
		name: 'Velocity Equation',
		latex: 'v = u + at',
		variables: [
			{ symbol: 'v', name: 'Final Velocity', unit: 'm/s', default: 20 },
			{ symbol: 'u', name: 'Initial Velocity', unit: 'm/s', default: 5 },
			{ symbol: 'a', name: 'Acceleration', unit: 'm/s²', default: 2 },
			{ symbol: 't', name: 'Time', unit: 's', min: 0, default: 5 },
		],
		solveFor: (target, known) => {
			if (target === 'v') return known.u + known.a * known.t;
			if (target === 'u') return known.v - known.a * known.t;
			if (target === 'a') return known.t !== 0 ? (known.v - known.u) / known.t : null;
			if (target === 't') return known.a !== 0 ? (known.v - known.u) / known.a : null;
			return null;
		},
		validate: (inputs) => {
			const errors: any[] = [];
			if (inputs.t < 0) errors.push({ field: 't', message: 'Time cannot be negative', type: 'out_of_range' });
			return { isValid: errors.length === 0, errors };
		}
	},
	{
		id: 'kinematics_s',
		name: 'Displacement Equation',
		latex: 's = ut + \\frac{1}{2}at^2',
		variables: [
			{ symbol: 's', name: 'Displacement', unit: 'm', default: 50 },
			{ symbol: 'u', name: 'Initial Velocity', unit: 'm/s', default: 0 },
			{ symbol: 'a', name: 'Acceleration', unit: 'm/s²', default: 2 },
			{ symbol: 't', name: 'Time', unit: 's', min: 0, default: 5 },
		],
		solveFor: (target, known) => {
			if (target === 's') return known.u * known.t + 0.5 * known.a * known.t * known.t;
			return null;
		},
		validate: (inputs) => {
			const errors: any[] = [];
			if (inputs.t < 0) errors.push({ field: 't', message: 'Time cannot be negative', type: 'out_of_range' });
			return { isValid: errors.length === 0, errors };
		}
	},
	{
		id: 'energy_ke',
		name: 'Kinetic Energy',
		latex: 'KE = \\frac{1}{2}mv^2',
		variables: [
			{ symbol: 'KE', name: 'Kinetic Energy', unit: 'J', default: 100 },
			{ symbol: 'm', name: 'Mass', unit: 'kg', min: 0.1, default: 2 },
			{ symbol: 'v', name: 'Velocity', unit: 'm/s', min: 0, default: 10 },
		],
		solveFor: (target, known) => {
			if (target === 'KE') return 0.5 * known.m * known.v * known.v;
			if (target === 'm') return known.v !== 0 ? (2 * known.KE) / (known.v * known.v) : null;
			if (target === 'v') return known.m !== 0 ? Math.sqrt((2 * known.KE) / known.m) : null;
			return null;
		},
		validate: (inputs) => {
			const errors: any[] = [];
			if (inputs.m <= 0) errors.push({ field: 'm', message: 'Mass must be positive', type: 'out_of_range' });
			return { isValid: errors.length === 0, errors };
		}
	},
	{
		id: 'energy_pe',
		name: 'Potential Energy',
		latex: 'PE = mgh',
		variables: [
			{ symbol: 'PE', name: 'Potential Energy', unit: 'J', default: 100 },
			{ symbol: 'm', name: 'Mass', unit: 'kg', min: 0.1, default: 2 },
			{ symbol: 'g', name: 'Gravity', unit: 'm/s²', default: 9.81 },
			{ symbol: 'h', name: 'Height', unit: 'm', min: 0, default: 5 },
		],
		solveFor: (target, known) => {
			if (target === 'PE') return known.m * known.g * known.h;
			if (target === 'm') return (known.g * known.h) !== 0 ? known.PE / (known.g * known.h) : null;
			if (target === 'h') return (known.m * known.g) !== 0 ? known.PE / (known.m * known.g) : null;
			return null;
		},
		validate: (inputs) => {
			const errors: any[] = [];
			if (inputs.m <= 0) errors.push({ field: 'm', message: 'Mass must be positive', type: 'out_of_range' });
			if (inputs.h < 0) errors.push({ field: 'h', message: 'Height cannot be negative', type: 'out_of_range' });
			return { isValid: errors.length === 0, errors };
		}
	},
	{
		id: 'gravity',
		name: "Newton's Law of Gravitation",
		latex: 'F = G\\frac{m_1 m_2}{r^2}',
		variables: [
			{ symbol: 'F', name: 'Force', unit: 'N', default: 10 },
			{ symbol: 'm1', name: 'Mass 1', unit: 'kg', min: 0.1, default: 100 },
			{ symbol: 'm2', name: 'Mass 2', unit: 'kg', min: 0.1, default: 100 },
			{ symbol: 'r', name: 'Distance', unit: 'm', min: 0.1, default: 5 },
		],
		solveFor: (target, known) => {
			const G = 6.67430e-11;
			if (target === 'F') return known.r !== 0 ? G * known.m1 * known.m2 / (known.r * known.r) : null;
			return null;
		},
		validate: (inputs) => {
			const errors: any[] = [];
			if (inputs.r <= 0) errors.push({ field: 'r', message: 'Distance must be positive', type: 'out_of_range' });
			return { isValid: errors.length === 0, errors };
		}
	}
];
