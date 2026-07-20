'use client';
import { EcologyCycles } from '../../../src/components/biology/EcologyCycles';

export default function EcologyPage() {
	return (
		<main className="bio-page">
			<div className="page-header">
				<h1>🌍 Biogeochemical Cycles</h1>
				<p className="page-description">Explore how carbon, nitrogen, water, and phosphorus move through Earth&apos;s systems.</p>
			</div>
			<EcologyCycles />
		</main>
	);
}
