'use client';

import { useState } from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import CopyButton from '../CopyButton';

interface Trait {
	id: string;
	name: string;
	dominant: string;
	recessive: string;
	dominantLabel: string;
	recessiveLabel: string;
}

const PEA_TRAITS: Trait[] = [
	{ id: 'seed_color', name: 'Seed Color', dominant: 'Y', recessive: 'y', dominantLabel: 'Yellow', recessiveLabel: 'Green' },
	{ id: 'seed_shape', name: 'Seed Shape', dominant: 'R', recessive: 'r', dominantLabel: 'Round', recessiveLabel: 'Wrinkled' },
	{ id: 'plant_height', name: 'Plant Height', dominant: 'T', recessive: 't', dominantLabel: 'Tall', recessiveLabel: 'Short' },
	{ id: 'flower_color', name: 'Flower Color', dominant: 'P', recessive: 'p', dominantLabel: 'Purple', recessiveLabel: 'White' },
];

type Genotype = { allele1: string; allele2: string };
type PeaPlant = { id: string; name: string; traits: Record<string, Genotype> };

function getPhenotype(trait: Trait, g: Genotype): string {
	const sorted = [g.allele1, g.allele2].sort((a, b) => (a === a.toUpperCase() ? 0 : 1) - (b === b.toUpperCase() ? 0 : 1));
	return sorted[0] === sorted[0].toUpperCase() ? trait.dominantLabel : trait.recessiveLabel;
}

function PeaSeedSVG({ seedColor, seedShape }: { seedColor: string; seedShape: string }) {
	const fill = seedColor === 'Yellow' ? '#eab308' : '#22c55e';
	const stroke = seedColor === 'Yellow' ? '#a16207' : '#15803d';
	return (
		<svg width="40" height="40" viewBox="0 0 50 50">
			{seedShape === 'Round' ? (
				<ellipse cx="25" cy="25" rx="18" ry="16" fill={fill} stroke={stroke} strokeWidth="2" />
			) : (
				<path d="M10,25 Q15,12 25,10 Q35,12 40,20 Q42,28 38,35 Q32,42 25,40 Q15,38 10,30 Z" fill={fill} stroke={stroke} strokeWidth="2" />
			)}
			<ellipse cx="22" cy="20" rx="5" ry="3" fill="rgba(255,255,255,0.3)" />
		</svg>
	);
}

function PeaPlantSVG({ traits }: { traits: Record<string, Genotype> }) {
	const height = getPhenotype(PEA_TRAITS[2], traits[PEA_TRAITS[2].id]);
	const flowerColor = getPhenotype(PEA_TRAITS[3], traits[PEA_TRAITS[3].id]);
	const seedColor = getPhenotype(PEA_TRAITS[0], traits[PEA_TRAITS[0].id]);
	const seedShape = getPhenotype(PEA_TRAITS[1], traits[PEA_TRAITS[1].id]);

	const h = height === 'Tall' ? 100 : 50;
	const flowerFill = flowerColor === 'Purple' ? '#a855f7' : '#f3f4f6';
	const flowerStroke = flowerColor === 'Purple' ? '#7e22ce' : '#d1d5db';
	const seedFill = seedColor === 'Yellow' ? '#eab308' : '#22c55e';
	const seedStroke = seedColor === 'Yellow' ? '#a16207' : '#15803d';

	return (
		<svg width="90" height="160" viewBox="0 0 90 160">
			{/* Stem */}
			<rect x="43" y={140 - h} width="4" height={h} rx="2" fill="#16a34a" />

			{/* Leaves */}
			<ellipse cx="30" cy={140 - h + 20} rx="12" ry="6" fill="#22c55e" opacity="0.7" />
			<ellipse cx="60" cy={140 - h + 35} rx="12" ry="6" fill="#22c55e" opacity="0.7" />

			{/* Flowers at top */}
			{[0, 1, 2].map(i => (
				<g key={i} transform={`translate(${45 + (i - 1) * 14}, ${140 - h - 5 + i * 3})`}>
					<ellipse cx="0" cy="-4" rx="5" ry="7" fill={flowerFill} stroke={flowerStroke} strokeWidth="1" />
					<ellipse cx="-5" cy="0" rx="5" ry="6" fill={flowerFill} stroke={flowerStroke} strokeWidth="1" />
					<ellipse cx="5" cy="0" rx="5" ry="6" fill={flowerFill} stroke={flowerStroke} strokeWidth="1" />
					<circle cx="0" cy="0" r="3" fill="#fbbf24" />
				</g>
			))}

			{/* Seed pods on stem — shows seed color & shape */}
			{[0, 1].map(i => {
				const podY = 140 - h + 45 + i * 25;
				return (
					<g key={`pod-${i}`}>
						{/* Pod outline */}
						<ellipse cx="65" cy={podY} rx="12" ry="8"
							fill="none" stroke="#16a34a" strokeWidth="1.5" opacity="0.5" />
						{/* Seeds inside pod */}
						{seedShape === 'Round' ? (
							<>
								<ellipse cx="60" cy={podY - 1} rx="4" ry="3.5" fill={seedFill} stroke={seedStroke} strokeWidth="1" />
								<ellipse cx="69" cy={podY + 1} rx="4" ry="3.5" fill={seedFill} stroke={seedStroke} strokeWidth="1" />
							</>
						) : (
							<>
								<path d={`M${56},${podY} Q${58},${podY - 4} ${62},${podY - 3} Q${64},${podY + 2} ${60},${podY + 3} Z`}
									fill={seedFill} stroke={seedStroke} strokeWidth="0.8" />
								<path d={`M${65},${podY - 1} Q${68},${podY - 5} ${72},${podY - 2} Q${73},${podY + 3} ${68},${podY + 2} Z`}
									fill={seedFill} stroke={seedStroke} strokeWidth="0.8" />
							</>
						)}
					</g>
				);
			})}

			{/* Ground line */}
			<line x1="10" y1="142" x2="80" y2="142" stroke="#d4d4d8" strokeWidth="1" strokeDasharray="3 2" />
		</svg>
	);
}

export function GeneInheritanceSimulator() {
	const makePlant = (name: string): PeaPlant => ({
		id: name, name,
		traits: Object.fromEntries(PEA_TRAITS.map(t => [t.id, { allele1: t.dominant, allele2: t.recessive }]))
	});

	const [parent1, setParent1] = useState<PeaPlant>(makePlant('Parent 1'));
	const [parent2, setParent2] = useState<PeaPlant>(makePlant('Parent 2'));
	const [offspring, setOffspring] = useState<PeaPlant[]>([]);
	const [errors, setErrors] = useState<any[]>([]);

	const breed = () => {
		const children: PeaPlant[] = [];
		for (let i = 0; i < 8; i++) {
			const traits: Record<string, Genotype> = {};
			for (const t of PEA_TRAITS) {
				const a1 = Math.random() < 0.5 ? parent1.traits[t.id].allele1 : parent1.traits[t.id].allele2;
				const a2 = Math.random() < 0.5 ? parent2.traits[t.id].allele1 : parent2.traits[t.id].allele2;
				traits[t.id] = { allele1: a1, allele2: a2 };
			}
			children.push({ id: `o${i}`, name: `#${i + 1}`, traits });
		}
		setOffspring(children);
		setErrors([]);
	};

	const renderParentControls = (plant: PeaPlant, setPlant: (p: PeaPlant) => void, label: string) => (
		<div className="bio-parent-card">
			<h4 className="bio-parent-title">{label}</h4>
			<div className="bio-parent-visual">
				<PeaPlantSVG traits={plant.traits} />
			</div>
			{PEA_TRAITS.map(trait => (
				<div key={trait.id} className="bio-trait-row">
					<span className="bio-trait-name">{trait.name}</span>
					<select
						value={`${plant.traits[trait.id].allele1}${plant.traits[trait.id].allele2}`}
						onChange={(e) => {
							const v = e.target.value;
							setPlant({ ...plant, traits: { ...plant.traits, [trait.id]: { allele1: v[0], allele2: v[1] } } });
						}}
						className="bio-select"
					>
						<option value={`${trait.dominant}${trait.dominant}`}>{`${trait.dominant}${trait.dominant}`} — {trait.dominantLabel}</option>
						<option value={`${trait.dominant}${trait.recessive}`}>{`${trait.dominant}${trait.recessive}`} — {trait.dominantLabel}</option>
						<option value={`${trait.recessive}${trait.recessive}`}>{`${trait.recessive}${trait.recessive}`} — {trait.recessiveLabel}</option>
					</select>
				</div>
			))}
		</div>
	);

	return (
		<div className="bio-card">
			<h3 className="bio-card-title">🌱 Gene Inheritance Simulator</h3>
			<p className="bio-card-desc">Cross pea plants and observe Mendelian inheritance with visual trait variation</p>

			<div className="bio-parents-grid">
				{renderParentControls(parent1, setParent1, 'Parent 1')}
				{renderParentControls(parent2, setParent2, 'Parent 2')}
			</div>

			<button onClick={breed} className="bio-breed-btn">🌸 Cross-Pollinate!</button>

			<ErrorDisplay errors={errors} />

			{offspring.length > 0 && (
				<div className="bio-offspring-section">
					<h4 className="bio-offspring-title">Offspring ({offspring.length})</h4>
					<div className="bio-offspring-grid">
						{offspring.map((plant) => {
							const seedColor = getPhenotype(PEA_TRAITS[0], plant.traits[PEA_TRAITS[0].id]);
							const seedShape = getPhenotype(PEA_TRAITS[1], plant.traits[PEA_TRAITS[1].id]);
							return (
								<div key={plant.id} className="bio-offspring-card">
									<div className="bio-offspring-name">{plant.name}</div>
									<div className="bio-pea-visual-row">
										<PeaPlantSVG traits={plant.traits} />
									</div>
									<div className="bio-offspring-seeds">
										<PeaSeedSVG seedColor={seedColor} seedShape={seedShape} />
									</div>
									<div className="bio-offspring-genotype">
										{PEA_TRAITS.map(t => {
											const ph = getPhenotype(t, plant.traits[t.id]);
											return <div key={t.id}>{t.name}: {plant.traits[t.id].allele1}{plant.traits[t.id].allele2} → <strong>{ph}</strong></div>;
										})}
									</div>
								</div>
							);
						})}
					</div>
					<CopyButton
						textToCopy={offspring.map(p => `${p.name}: ${PEA_TRAITS.map(t => `${t.id}=${p.traits[t.id].allele1}${p.traits[t.id].allele2}`).join(', ')}`).join('\n')}
						className="bio-copy-btn"
					>
						Copy Results
					</CopyButton>
				</div>
			)}

			<div className="bio-info">
				<strong>Traits (Mendel&apos;s originals):</strong> Seed Color (Y/y), Seed Shape (R/r), Plant Height (T/t), Flower Color (P/p)
			</div>
		</div>
	);
}

export default GeneInheritanceSimulator;
