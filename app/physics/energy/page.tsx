'use client';

import { EnergyExplorer } from '../../../src/components/physics/EnergyExplorer';

export default function EnergyPage() {
	return (
		<main className="physics-page">
			<div className="page-header">
				<h1>⚡ Energy Explorer</h1>
				<p className="page-description">Visualize kinetic energy (½mv²), potential energy (mgh), and total mechanical energy. See how energy transforms between forms.</p>
			</div>
			<EnergyExplorer />
		</main>
	);
}
