import type { EnergyResult } from './types';

export function calculateEnergy(
	mass: number,
	velocity: number,
	height: number,
	g: number = 9.81
): EnergyResult {
	const kinetic = 0.5 * mass * velocity * velocity;
	const potential = mass * g * height;

	return {
		kinetic,
		potential,
		total: kinetic + potential
	};
}
