'use client';

import { CircuitBuilder } from '../../../src/components/physics/CircuitBuilder';

export default function CircuitsPage() {
	return (
		<main className="physics-page">
			<div className="page-header">
				<h1>🔌 Circuit Simulator</h1>
				<p className="page-description">Build series and parallel circuits. Add resistors, set battery voltage, and calculate total resistance, current, and power using Ohm's law.</p>
			</div>
			<CircuitBuilder />
		</main>
	);
}
