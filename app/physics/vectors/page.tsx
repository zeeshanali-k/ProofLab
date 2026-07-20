'use client';

import { VectorVisualizer } from '../../../src/components/physics/VectorVisualizer';

export default function VectorsPage() {
	return (
		<main className="physics-page">
			<div className="page-header">
				<h1>➡️ Vector Visualizer</h1>
				<p className="page-description">Add vectors graphically using the head-to-tail method. Adjust components and see the resultant vector with magnitude and direction.</p>
			</div>
			<VectorVisualizer />
		</main>
	);
}
