import Link from 'next/link';

export default function ChemistryDashboard() {
	const tools = [
		// Core Tools
		{ name: 'Equation Balancer', path: '/chemistry/balance', icon: '⚖️', description: 'Balance chemical equations with step-by-step solutions' },
		{ name: 'Molar Mass Calculator', path: '/chemistry/calculator', icon: '📊', description: 'Calculate molar mass and element composition' },
		{ name: '3D Molecule Viewer', path: '/chemistry/viewer', icon: '🔬', description: 'View molecules in 3D with interactive controls' },
		
		// Advanced Calculators
		{ name: 'Stoichiometry Calculator', path: '/chemistry/stoichiometry', icon: '🧮', description: 'Molar mass, limiting reactant, theoretical yield calculations' },
		{ name: 'Solution Chemistry', path: '/chemistry/solution', icon: '💧', description: 'Molarity, dilution, pH, and concentration calculations' },
		{ name: 'Thermochemistry', path: '/chemistry/thermochemistry', icon: '🔥', description: 'Enthalpy, bond energy, Gibbs free energy calculations' },
		{ name: 'Equilibrium Constants', path: '/chemistry/equilibrium', icon: '⚖️', description: 'Q/K calculations, weak acids/bases, buffers, solubility' },
		{ name: 'Electrochemistry', path: '/chemistry/electrochemistry', icon: '⚡', description: 'Cell potential, Nernst equation, Faraday\'s law calculations' },
		{ name: 'Molecular Geometry', path: '/chemistry/geometry', icon: '🔺', description: 'VSEPR theory, molecular shapes, hybridization, polarity prediction' },
	];
	
	return (
		<main className="chemistry-dashboard">
			<div className="dashboard-header">
				<h1>🧪 Chemistry Module</h1>
				<p className="dashboard-subtitle">Interactive chemistry tools for students and educators</p>
			</div>
			
			<div className="tools-grid">
				{tools.map((tool) => (
					<Link
						key={tool.path}
						href={tool.path}
						className="tool-card"
					>
						<div className="tool-icon">{tool.icon}</div>
						<h2 className="tool-name">{tool.name}</h2>
						<p className="tool-description">{tool.description}</p>
					</Link>
				))}
			</div>
			
			<div className="dashboard-footer">
				<Link href="/dashboard" className="back-to-prooflab">
					← Back to ProofLab
				</Link>
			</div>
		</main>
	);
}
