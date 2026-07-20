import Link from 'next/link';

export default function BiologyDashboard() {
	const tools = [
		{ name: 'Anatomy Viewer', path: '/biology/anatomy', icon: '🧬', description: 'Interactive body map with organ overlay and system details' },
		{ name: 'Body Picker', path: '/biology/body-picker', icon: '🦴', description: 'Interactive body region selection (SVG-based)' },
		{ name: 'Organ Systems', path: '/biology/systems', icon: '🫀', description: 'Detailed exploration of all 9 human body systems' },
		{ name: 'Chromosome Viewer', path: '/biology/genetics', icon: '🔬', description: 'Interactive chromosome visualization with gene annotations' },
		{ name: 'Gene Inheritance', path: '/biology/genetics/bugs', icon: '🌱', description: 'Mendelian pea plant genetics simulator' },
		{ name: 'Phylogenetic Tree', path: '/biology/evolution', icon: '🌳', description: 'Evolutionary relationships (Newick format)' },
		{ name: 'Ecology Cycles', path: '/biology/ecology', icon: '🌍', description: 'Biogeochemical cycles explorer' },
	];

	return (
		<main className="bio-dashboard">
			<div className="dashboard-header">
				<h1>🧬 Biology Module</h1>
				<p className="dashboard-subtitle">Interactive biology tools for anatomy, genetics, evolution, and ecology</p>
			</div>

			<div className="tools-grid">
				{tools.map((tool) => (
					<Link key={tool.path} href={tool.path} className="tool-card">
						<div className="tool-icon">{tool.icon}</div>
						<h2 className="tool-name">{tool.name}</h2>
						<p className="tool-description">{tool.description}</p>
					</Link>
				))}
			</div>

			<div className="dashboard-footer">
				<Link href="/" className="back-to-prooflab">← Back to ProofLab</Link>
			</div>
		</main>
	);
}
