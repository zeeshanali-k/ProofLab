import type { CircuitResult } from './types';

export function calculateSeriesResistance(resistances: number[]): number {
	return resistances.reduce((sum, r) => sum + r, 0);
}

export function calculateParallelResistance(resistances: number[]): number {
	const reciprocals = resistances.reduce((sum, r) => sum + 1 / (r || 0.001), 0);
	return reciprocals > 0 ? 1 / reciprocals : 0;
}

export function calculateCircuit(
	resistances: number[],
	voltage: number,
	mode: 'series' | 'parallel'
): CircuitResult {
	const totalResistance = mode === 'series'
		? calculateSeriesResistance(resistances)
		: calculateParallelResistance(resistances);

	const totalCurrent = totalResistance > 0 ? voltage / totalResistance : 0;
	const power = voltage * totalCurrent;

	const voltageDrops = resistances.map((r, i) => {
		let vDrop: number;
		if (mode === 'series') {
			vDrop = totalCurrent * r;
		} else {
			vDrop = voltage;
		}
		return { component: `R${i + 1}`, voltage: vDrop };
	});

	return { totalResistance, totalCurrent, voltageDrops, power };
}

export function ohmsLaw(voltage: number, resistance: number): number {
	if (resistance === 0) return Infinity;
	return voltage / resistance;
}

export function electricalPower(voltage: number, current: number): number {
	return voltage * current;
}

export function electricalPowerFromIR(current: number, resistance: number): number {
	return current * current * resistance;
}

export function electricalPowerFromVR(voltage: number, resistance: number): number {
	if (resistance === 0) return Infinity;
	return (voltage * voltage) / resistance;
}
