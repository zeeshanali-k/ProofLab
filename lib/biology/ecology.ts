import type { CycleData } from './types';

export function getCycleByName(cycles: CycleData[], name: string): CycleData | undefined {
	return cycles.find(c => c.name.toLowerCase() === name.toLowerCase());
}

export function getTotalReservoirCount(cycle: CycleData): number {
	return cycle.reservoirs.length;
}

export function getTotalFluxCount(cycle: CycleData): number {
	return cycle.fluxes.length;
}

export function getHumanImpactSummary(cycle: CycleData): string {
	return cycle.humanImpact;
}
