'use client';
import { SolutionCalculator } from '../../../src/components/chemistry/SolutionCalculator';

export default function SolutionPage() {
	return (
		<main className="chemistry-page">
			<div className="page-header">
				<h1>💧 Solution Chemistry Calculator</h1>
				<p>Calculate molarity, dilution, pH, and concentration conversions for solutions.</p>
			</div>
			<SolutionCalculator />
		</main>
	);
}
