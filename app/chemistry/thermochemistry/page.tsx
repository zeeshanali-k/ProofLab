'use client';
import { ThermochemistryCalculator } from '../../../src/components/chemistry/ThermochemistryCalculator';

export default function ThermochemistryPage() {
	return (
		<main className="chemistry-page">
			<div className="page-header">
				<h1>🔥 Thermochemistry Calculator</h1>
				<p>Calculate reaction enthalpy, bond energy, Gibbs free energy, and heat of combustion.</p>
			</div>
			<ThermochemistryCalculator />
		</main>
	);
}
