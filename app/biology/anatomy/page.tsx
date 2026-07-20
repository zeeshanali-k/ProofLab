'use client';
import { AnatomyViewer } from '../../../src/components/biology/AnatomyViewer';

export default function AnatomyPage() {
	return (
		<main className="bio-page">
			<div className="page-header">
				<h1>🧬 Interactive Anatomy Viewer</h1>
				<p className="page-description">Click body regions to explore anatomy. Toggle organ overlay to see major organs and their descriptions.</p>
			</div>
			<AnatomyViewer />
		</main>
	);
}
