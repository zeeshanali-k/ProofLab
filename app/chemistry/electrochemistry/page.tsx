'use client';
import { ElectrochemistryCalculator } from '../../../src/components/chemistry/ElectrochemistryCalculator';

export default function ElectrochemistryPage() {
	return (
		<main className="chemistry-page">
			<div className="page-header">
				<h1>⚡ Electrochemistry Calculator</h1>
				<p>Calculate cell potential, Nernst equation, Faraday's law, and battery voltages.</p>
			</div>
			<ElectrochemistryCalculator />
		</main>
	);
}
