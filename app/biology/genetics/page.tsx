'use client';
import { ChromosomeViewer } from '../../../src/components/biology/ChromosomeViewer';

export default function GeneticsPage() {
	return (
		<main className="bio-page">
			<div className="page-header">
				<h1>🧬 Chromosome Viewer</h1>
				<p className="page-description">Human karyotype with banding patterns and gene annotations. Click chromosomes or highlight genes.</p>
			</div>
			<ChromosomeViewer />
		</main>
	);
}
