'use client';
import dynamic from 'next/dynamic';
const PhylogeneticTree = dynamic(() => import('../../../src/components/biology/PhylogeneticTree'), { ssr: false });

export default function EvolutionPage() {
	return (
		<main className="bio-page">
			<div className="page-header">
				<h1>🌳 Phylogenetic Tree</h1>
				<p className="page-description">Visualize evolutionary relationships using Newick format trees with sequence alignment.</p>
			</div>
			<PhylogeneticTree />
		</main>
	);
}
