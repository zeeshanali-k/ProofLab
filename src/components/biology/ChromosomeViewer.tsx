'use client';

import { useState } from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import CopyButton from '../CopyButton';

interface ChromosomeData {
	id: string;
	name: string;
	length: number;
	bands: { pos: number; width: number; stain: string }[];
	genes?: { name: string; position: number; color: string }[];
}

const HUMAN_CHROMOSOMES: ChromosomeData[] = [
	{ id: '1', name: 'Chr 1', length: 249, bands: generateBands(249, 12), genes: [{ name: 'TP53', position: 7.6, color: '#ef4444' }] },
	{ id: '2', name: 'Chr 2', length: 243, bands: generateBands(243, 11) },
	{ id: '3', name: 'Chr 3', length: 198, bands: generateBands(198, 10) },
	{ id: '4', name: 'Chr 4', length: 191, bands: generateBands(191, 9) },
	{ id: '5', name: 'Chr 5', length: 182, bands: generateBands(182, 9) },
	{ id: '6', name: 'Chr 6', length: 171, bands: generateBands(171, 8) },
	{ id: '7', name: 'Chr 7', length: 159, bands: generateBands(159, 8) },
	{ id: '8', name: 'Chr 8', length: 145, bands: generateBands(145, 7) },
	{ id: '9', name: 'Chr 9', length: 138, bands: generateBands(138, 7) },
	{ id: '10', name: 'Chr 10', length: 134, bands: generateBands(134, 7) },
	{ id: '11', name: 'Chr 11', length: 135, bands: generateBands(135, 7) },
	{ id: '12', name: 'Chr 12', length: 133, bands: generateBands(133, 7) },
	{ id: '13', name: 'Chr 13', length: 114, bands: generateBands(114, 5) },
	{ id: '14', name: 'Chr 14', length: 107, bands: generateBands(107, 5) },
	{ id: '15', name: 'Chr 15', length: 102, bands: generateBands(102, 5) },
	{ id: '16', name: 'Chr 16', length: 90, bands: generateBands(90, 5) },
	{ id: '17', name: 'Chr 17', length: 83, bands: generateBands(83, 6), genes: [{ name: 'BRCA1', position: 43, color: '#ef4444' }] },
	{ id: '18', name: 'Chr 18', length: 80, bands: generateBands(80, 5) },
	{ id: '19', name: 'Chr 19', length: 59, bands: generateBands(59, 4) },
	{ id: '20', name: 'Chr 20', length: 64, bands: generateBands(64, 4) },
	{ id: '21', name: 'Chr 21', length: 47, bands: generateBands(47, 3) },
	{ id: '22', name: 'Chr 22', length: 51, bands: generateBands(51, 3) },
	{ id: 'X', name: 'Chr X', length: 156, bands: generateBands(156, 8) },
	{ id: 'Y', name: 'Chr Y', length: 57, bands: generateBands(57, 3) },
];

function generateBands(length: number, count: number): { pos: number; width: number; stain: string }[] {
	const bands: { pos: number; width: number; stain: string }[] = [];
	const stains = ['#1a1a2e', '#3d3d5c', '#6b6b8d', '#a0a0b8', '#d4d4e0', '#e8e8f0'];
	const segLen = length / count;
	for (let i = 0; i < count; i++) {
		bands.push({
			pos: i * segLen,
			width: segLen * 0.9,
			stain: stains[i % stains.length],
		});
	}
	return bands;
}

const GENE_ANNOTATIONS = [
	{ name: 'BRCA1', chr: '17', position: 43, color: '#ef4444', description: 'Breast cancer type 1 susceptibility gene' },
	{ name: 'TP53', chr: '17', position: 7.6, color: '#ef4444', description: 'Tumor protein p53 — "guardian of the genome"' },
	{ name: 'CFTR', chr: '7', position: 117, color: '#3b82f6', description: 'Cystic fibrosis transmembrane conductance regulator' },
	{ name: 'HBB', chr: '11', position: 5.2, color: '#22c55e', description: 'Beta-globin gene — mutations cause sickle cell disease' },
	{ name: 'EGFR', chr: '7', position: 55, color: '#f97316', description: 'Epidermal growth factor receptor' },
];

function ChromosomeSVG({ chromosomes, selectedChr, highlightedGene }: {
	chromosomes: ChromosomeData[];
	selectedChr: string | null;
	highlightedGene: string | null;
}) {
	const maxLen = Math.max(...chromosomes.map(c => c.length));
	const colWidth = 28;
	const gap = 4;
	const topPad = 30;
	const scale = 220 / maxLen;

	return (
		<svg viewBox={`0 0 ${chromosomes.length * (colWidth + gap) + 20} 300`} className="bio-chromosome-svg">
			{chromosomes.map((chr, ci) => {
				const x = ci * (colWidth + gap) + 10;
				const chrHeight = chr.length * scale;
				const y = topPad + (maxLen * scale - chrHeight) / 2;
				const isSelected = selectedChr === chr.id;
				const centromerePos = chr.length * 0.4;

				return (
					<g key={chr.id}>
						{/* Chromosome label */}
						<text x={x + colWidth / 2} y={topPad - 8} textAnchor="middle"
							fontSize="8" fontWeight="600"
							fill={isSelected ? '#6366f1' : '#6b7280'}>
							{chr.id}
						</text>

						{/* Chromosome body */}
						<rect x={x} y={y} width={colWidth} height={chrHeight}
							rx={colWidth / 2} ry={colWidth / 2}
							fill={isSelected ? '#eef2ff' : '#f8fafc'}
							stroke={isSelected ? '#6366f1' : '#cbd5e1'}
							strokeWidth={isSelected ? 2 : 1}
						/>

						{/* Bands */}
						{chr.bands.map((band, bi) => {
							const bandY = y + band.pos * scale;
							const bandH = band.width * scale;
							const clipTop = bandY < y ? y - bandY : 0;
							const clipH = Math.min(bandH - clipTop, y + chrHeight - bandY - clipTop);
							if (clipH <= 0) return null;
							return (
								<rect key={bi}
									x={x + 2} y={bandY + clipTop}
									width={colWidth - 4} height={clipH}
									fill={band.stain} opacity="0.3"
									rx="1"
								/>
							);
						})}

						{/* Centromere pinch */}
						<ellipse cx={x + colWidth / 2} cy={y + centromerePos * scale}
							rx={colWidth / 2 + 1} ry={3}
							fill="white" stroke={isSelected ? '#6366f1' : '#cbd5e1'} strokeWidth="1"
						/>

						{/* Gene annotations */}
						{chr.genes?.map((gene, gi) => {
							const geneY = y + gene.position * scale;
							const isHighlighted = highlightedGene === gene.name;
							return (
								<g key={gi}>
									<line x1={x - 2} y1={geneY} x2={x + colWidth + 2} y2={geneY}
										stroke={gene.color} strokeWidth={isHighlighted ? 2.5 : 1.5}
										opacity={isHighlighted ? 1 : 0.6}
									/>
									{isHighlighted && (
										<text x={x + colWidth + 4} y={geneY + 3}
											fontSize="7" fill={gene.color} fontWeight="600">
											{gene.name}
										</text>
									)}
								</g>
							);
						})}
					</g>
				);
			})}
		</svg>
	);
}

export function ChromosomeViewer() {
	const [selectedChr, setSelectedChr] = useState<string | null>(null);
	const [highlightedGene, setHighlightedGene] = useState<string | null>(null);

	const selectedData = HUMAN_CHROMOSOMES.find(c => c.id === selectedChr);
	const geneData = GENE_ANNOTATIONS.find(g => g.name === highlightedGene);

	return (
		<div className="bio-card">
			<h3 className="bio-card-title">🧬 Chromosome Viewer</h3>
			<p className="bio-card-desc">Human karyotype with banding patterns and gene annotations. Click a chromosome for details.</p>

			<div className="bio-controls">
				<div className="bio-control-group">
					<label>Highlight Gene</label>
					<div className="bio-btn-group">
						<button onClick={() => setHighlightedGene(null)}
							className={`bio-btn ${!highlightedGene ? 'active' : ''}`}>None</button>
						{GENE_ANNOTATIONS.map(g => (
							<button key={g.name} onClick={() => {
								setHighlightedGene(highlightedGene === g.name ? null : g.name);
								setSelectedChr(g.chr);
							}}
								className={`bio-btn ${highlightedGene === g.name ? 'active' : ''}`}
								style={highlightedGene === g.name ? { background: g.color, borderColor: g.color } : {}}>
								{g.name}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="bio-chromosome-canvas">
				<ChromosomeSVG
					chromosomes={HUMAN_CHROMOSOMES}
					selectedChr={selectedChr}
					highlightedGene={highlightedGene}
				/>
			</div>

			<div className="bio-chromosome-detail">
				{selectedData ? (
					<div className="bio-info-card" style={{ borderLeftColor: '#6366f1' }}>
						<h4>Chromosome {selectedData.id}</h4>
						<p>Length: ~{selectedData.length} million base pairs • {selectedData.bands.length} visible bands</p>
						{selectedData.genes && selectedData.genes.length > 0 && (
							<div className="bio-info-tag">
								Notable genes: {selectedData.genes.map(g => g.name).join(', ')}
							</div>
						)}
					</div>
				) : geneData ? (
					<div className="bio-info-card" style={{ borderLeftColor: geneData.color }}>
						<h4 style={{ color: geneData.color }}>{geneData.name}</h4>
						<p>{geneData.description}</p>
						<div className="bio-info-tag">Location: Chromosome {geneData.chr}, position {geneData.position} Mb</div>
					</div>
				) : (
					<div className="bio-info-card bio-info-placeholder">
						<p>👆 Click a chromosome or highlight a gene to see details</p>
					</div>
				)}
			</div>

			<div className="bio-chromosome-legend">
				<div className="bio-legend-item">
					<svg width="20" height="12"><rect x="0" y="0" width="20" height="12" rx="3" fill="#1a1a2e" opacity="0.3" /></svg>
					<span>Dark band = gene-rich (G-positive)</span>
				</div>
				<div className="bio-legend-item">
					<svg width="20" height="12"><rect x="0" y="0" width="20" height="12" rx="3" fill="#d4d4e0" opacity="0.5" /></svg>
					<span>Light band = gene-poor</span>
				</div>
				<div className="bio-legend-item">
					<svg width="20" height="12"><ellipse cx="10" cy="6" rx="10" ry="3" fill="white" stroke="#cbd5e1" /></svg>
					<span>Centromere</span>
				</div>
			</div>

			<ErrorDisplay errors={[]} />

			<CopyButton
				textToCopy={`Human Karyotype: 46 chromosomes (23 pairs)\nTotal: ~3.1 billion base pairs\n${GENE_ANNOTATIONS.map(g => `${g.name}: Chr ${g.chr}, pos ${g.position}Mb — ${g.description}`).join('\n')}`}
				className="bio-copy-btn"
			>
				Copy Karyotype Data
			</CopyButton>
		</div>
	);
}

export default ChromosomeViewer;
