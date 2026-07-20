'use client';
import { GeometryVisualizer } from '../../../src/components/chemistry/GeometryVisualizer';

export default function GeometryPage() {
	return (
		<main className="chemistry-page">
			<div className="page-header">
				<h1>🔺 Molecular Geometry Visualizer</h1>
				<p>Predict molecular geometry, hybridization, polarity, and bond angles using VSEPR theory.</p>
			</div>
			<GeometryVisualizer />
		</main>
	);
}
