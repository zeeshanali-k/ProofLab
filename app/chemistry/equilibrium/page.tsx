'use client';
import { EquilibriumCalculator } from '../../../src/components/chemistry/EquilibriumCalculator';

export default function EquilibriumPage() {
	return (
		<main className="chemistry-page">
			<div className="page-header">
				<h1>⚖️ Equilibrium Constants Calculator</h1>
				<p>Calculate Q/K, weak acid/base pH, buffers, solubility, and Le Chatelier's principle.</p>
			</div>
			<EquilibriumCalculator />
		</main>
	);
}
