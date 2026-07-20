export interface Trait {
	id: string;
	name: string;
	dominantAllele: string;
	recessiveAllele: string;
	description: string;
}

export interface Organism {
	id: string;
	name: string;
	traits: Record<string, { allele1: string; allele2: string }>;
}

export interface Offspring {
	id: string;
	traits: Record<string, { allele1: string; allele2: string; phenotype: string }>;
}

export interface CycleData {
	name: string;
	description: string;
	reservoirs: { name: string; amount: string }[];
	fluxes: { from: string; to: string; rate: string }[];
	humanImpact: string;
}

export interface BodyPart {
	id: string;
	name: string;
	system: string;
	description: string;
}

export interface PhylogeneticNode {
	name: string;
	children?: PhylogeneticNode[];
	branchLength?: number;
}

export interface PunnettSquareResult {
	parent1: string;
	parent2: string;
	offspring: { genotype: string; phenotype: string; probability: number }[];
	ratios: { genotypic: Record<string, number>; phenotypic: Record<string, number> };
}
