import type { PunnettSquareResult } from './types';

export function generatePunnettSquare(allele1a: string, allele1b: string, allele2a: string, allele2b: string): PunnettSquareResult {
	const gametes1 = [allele1a, allele1b];
	const gametes2 = [allele2a, allele2b];
	const offspring: { genotype: string; phenotype: string; probability: number }[] = [];
	const genotypic: Record<string, number> = {};
	const phenotypic: Record<string, number> = {};

	for (const g1 of gametes1) {
		for (const g2 of gametes2) {
			const sorted = [g1, g2].sort((a, b) => {
				const aUpper = a === a.toUpperCase() ? 0 : 1;
				const bUpper = b === b.toUpperCase() ? 0 : 1;
				return aUpper - bUpper;
			});
			const genotype = sorted.join('');
			const phenotype = sorted[0] === sorted[0].toUpperCase() ? 'Dominant' : 'Recessive';

			offspring.push({ genotype, phenotype, probability: 0.25 });
			genotypic[genotype] = (genotypic[genotype] || 0) + 1;
			phenotypic[phenotype] = (phenotypic[phenotype] || 0) + 1;
		}
	}

	return {
		parent1: `${allele1a}${allele1b}`,
		parent2: `${allele2a}${allele2b}`,
		offspring,
		ratios: { genotypic, phenotypic }
	};
}

export function getPhenotype(genotype: string, dominantAllele: string, recessiveAllele: string): string {
	if (genotype.includes(dominantAllele)) {
		return 'Dominant';
	}
	return 'Recessive';
}

export function getGenotypeRatio(offspring: { genotype: string }[]): Record<string, number> {
	const ratio: Record<string, number> = {};
	for (const o of offspring) {
		ratio[o.genotype] = (ratio[o.genotype] || 0) + 1;
	}
	return ratio;
}

export function getPhenotypeRatio(offspring: { phenotype: string }[]): Record<string, number> {
	const ratio: Record<string, number> = {};
	for (const o of offspring) {
		ratio[o.phenotype] = (ratio[o.phenotype] || 0) + 1;
	}
	return ratio;
}
