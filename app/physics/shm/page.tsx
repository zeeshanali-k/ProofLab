'use client';

import { SHMVisualizer } from '../../../src/components/physics/SHMVisualizer';

export default function SHMPage() {
	return (
		<main className="physics-page">
			<div className="page-header">
				<h1>🌀 Simple Harmonic Motion</h1>
				<p className="page-description">Animated mass-spring system. Adjust mass, spring constant, and amplitude to observe oscillation, period, and frequency.</p>
			</div>
			<SHMVisualizer />
		</main>
	);
}
