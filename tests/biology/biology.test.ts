import { describe, expect, test } from 'vitest';
import { BUG_TRAITS, BUG_PHENOTYPES, ECOLOGY_CYCLES, BODY_SYSTEMS, ORGANS, SAMPLE_NEWICK, SAMPLE_FASTA } from '@/lib/biology/constants';
import { generatePunnettSquare, getPhenotype, getGenotypeRatio, getPhenotypeRatio } from '@/lib/biology/genetics';
import { getCycleByName, getTotalReservoirCount, getTotalFluxCount } from '@/lib/biology/ecology';

describe('Genetics - Constants', () => {
	test('BUG_TRAITS has correct structure', () => {
		expect(BUG_TRAITS).toBeDefined();
		expect(BUG_TRAITS.length).toBe(4);
		expect(BUG_TRAITS[0]).toHaveProperty('id');
		expect(BUG_TRAITS[0]).toHaveProperty('dominantAllele');
		expect(BUG_TRAITS[0]).toHaveProperty('recessiveAllele');
	});

	test('BUG_PHENOTYPES covers all traits', () => {
		for (const trait of BUG_TRAITS) {
			expect(BUG_PHENOTYPES[trait.id]).toBeDefined();
		}
	});

	test('BODY_SYSTEMS has 8 systems', () => {
		expect(BODY_SYSTEMS.length).toBe(8);
	});

	test('ORGANS has entries', () => {
		expect(ORGANS.length).toBeGreaterThan(0);
		expect(ORGANS[0]).toHaveProperty('id');
		expect(ORGANS[0]).toHaveProperty('system');
	});
});

describe('Genetics - Punnett Square', () => {
	test('heterozygous cross produces correct ratio', () => {
		const result = generatePunnettSquare('A', 'a', 'A', 'a');
		expect(result.offspring.length).toBe(4);
		const ratio = getGenotypeRatio(result.offspring);
		expect(ratio['AA']).toBe(1);
		expect(ratio['Aa']).toBe(2);
		expect(ratio['aa']).toBe(1);
	});

	test('homozygous dominant x recessive', () => {
		const result = generatePunnettSquare('A', 'A', 'a', 'a');
		expect(result.offspring.length).toBe(4);
		for (const o of result.offspring) {
			expect(o.genotype).toBe('Aa');
		}
	});

	test('phenotype ratio for heterozygous cross', () => {
		const result = generatePunnettSquare('A', 'a', 'A', 'a');
		const phenRatio = getPhenotypeRatio(result.offspring);
		expect(phenRatio['Dominant']).toBe(3);
		expect(phenRatio['Recessive']).toBe(1);
	});
});

describe('Genetics - Phenotype', () => {
	test('dominant allele present returns Dominant', () => {
		expect(getPhenotype('Aa', 'A', 'a')).toBe('Dominant');
		expect(getPhenotype('AA', 'A', 'a')).toBe('Dominant');
	});

	test('no dominant allele returns Recessive', () => {
		expect(getPhenotype('aa', 'A', 'a')).toBe('Recessive');
	});
});

describe('Ecology - Constants', () => {
	test('ECOLOGY_CYCLES has 4 cycles', () => {
		expect(ECOLOGY_CYCLES.length).toBe(4);
	});

	test('each cycle has required fields', () => {
		for (const cycle of ECOLOGY_CYCLES) {
			expect(cycle.name).toBeTruthy();
			expect(cycle.description).toBeTruthy();
			expect(cycle.reservoirs.length).toBeGreaterThan(0);
			expect(cycle.fluxes.length).toBeGreaterThan(0);
			expect(cycle.humanImpact).toBeTruthy();
		}
	});

	test('Carbon Cycle is first', () => {
		expect(ECOLOGY_CYCLES[0].name).toBe('Carbon Cycle');
	});
});

describe('Ecology - Functions', () => {
	test('getCycleByName finds cycle', () => {
		const cycle = getCycleByName(ECOLOGY_CYCLES, 'carbon cycle');
		expect(cycle).toBeDefined();
		expect(cycle!.name).toBe('Carbon Cycle');
	});

	test('getCycleByName returns undefined for unknown', () => {
		const cycle = getCycleByName(ECOLOGY_CYCLES, 'oxygen cycle');
		expect(cycle).toBeUndefined();
	});

	test('getTotalReservoirCount', () => {
		const count = getTotalReservoirCount(ECOLOGY_CYCLES[0]);
		expect(count).toBeGreaterThan(0);
	});

	test('getTotalFluxCount', () => {
		const count = getTotalFluxCount(ECOLOGY_CYCLES[0]);
		expect(count).toBeGreaterThan(0);
	});
});

describe('Sample Data', () => {
	test('SAMPLE_NEWICK is valid Newick format', () => {
		expect(SAMPLE_NEWICK).toContain('Homo_sapiens');
		expect(SAMPLE_NEWICK).toContain('Pan_troglodytes');
		expect(SAMPLE_NEWICK.endsWith(';')).toBe(true);
	});

	test('SAMPLE_FASTA has sequences', () => {
		expect(SAMPLE_FASTA).toContain('>Homo_sapiens');
		expect(SAMPLE_FASTA).toContain('>Pan_troglodytes');
		expect(SAMPLE_FASTA).toContain('>Mus_musculus');
	});
});
