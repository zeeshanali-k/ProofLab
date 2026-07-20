'use client';
import { StoichiometryCalculator } from '../../../src/components/chemistry/StoichiometryCalculator';

export default function StoichiometryPage() {
	return (
		<main className="chemistry-page">
			<div className="page-header">
				<h1>🧮 Stoichiometry Calculator</h1>
				<p>Perform stoichiometric calculations: molar mass, limiting reactant, theoretical yield, and more.</p>
			</div>
			<StoichiometryCalculator />
		</main>
	);
}
