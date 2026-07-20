'use client';
import { GeneInheritanceSimulator } from '../../../../src/components/biology/BugSimulator';

export default function GeneInheritancePage() {
	return (
		<main className="bio-page">
			<div className="page-header">
				<h1>🌱 Gene Inheritance Simulator</h1>
				<p className="page-description">Set parent genotypes and cross-pollinate to observe Mendelian inheritance patterns in offspring.</p>
			</div>
			<GeneInheritanceSimulator />
		</main>
	);
}
