'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FormulaVisualizer } from '../../src/components/physics/FormulaVisualizer';
import { PHYSICS_EQUATIONS } from '../../lib/physics/equations';

export default function PhysicsDashboard() {
	const [selectedEq, setSelectedEq] = useState(PHYSICS_EQUATIONS[0]);

	const tools = [
		{ name: 'Kinematics', path: '/physics/kinematics', icon: '📊', description: '1D motion with position, velocity & acceleration graphs' },
		{ name: 'Projectile Motion', path: '/physics/projectile', icon: '🎯', description: '2D trajectory simulator with canvas visualization' },
		{ name: 'Energy Explorer', path: '/physics/energy', icon: '⚡', description: 'Kinetic, potential & total energy bar charts' },
		{ name: 'Vector Visualizer', path: '/physics/vectors', icon: '➡️', description: 'Head-to-tail vector addition on a coordinate plane' },
	];

	const optionalTools = [
		{ name: 'SHM Visualizer', path: '/physics/shm', icon: '🌀', description: 'Animated mass-spring system with real-time graphs' },
		{ name: 'Circuit Simulator', path: '/physics/circuits', icon: '🔌', description: 'Series & parallel circuit builder with Ohm\'s law' },
	];

	return (
		<main className="physics-dashboard">
			<div className="dashboard-header">
				<h1>🔬 Physics Module</h1>
				<p className="dashboard-subtitle">Interactive physics simulations and calculators</p>
			</div>

			<div className="physics-equations-section">
				<h2 className="section-title">📐 Formula Visualizer</h2>
				<p className="section-desc">Select an equation and adjust the sliders to see results in real time</p>

				<div className="physics-equation-tabs">
					{PHYSICS_EQUATIONS.map((eq) => (
						<button
							key={eq.id}
							onClick={() => setSelectedEq(eq)}
							className={`physics-eq-tab ${selectedEq.id === eq.id ? 'active' : ''}`}
						>
							{eq.name}
						</button>
					))}
				</div>

				<FormulaVisualizer equation={selectedEq} />
			</div>

			<h2 className="section-title" style={{ marginTop: 48 }}>Core Simulators</h2>
			<div className="tools-grid">
				{tools.map((tool) => (
					<Link key={tool.path} href={tool.path} className="tool-card">
						<div className="tool-icon">{tool.icon}</div>
						<h2 className="tool-name">{tool.name}</h2>
						<p className="tool-description">{tool.description}</p>
					</Link>
				))}
			</div>

			<h2 className="section-title section-title-optional">Additional Tools</h2>
			<div className="tools-grid tools-grid-optional">
				{optionalTools.map((tool) => (
					<Link key={tool.path} href={tool.path} className="tool-card tool-card-optional">
						<div className="tool-icon">{tool.icon}</div>
						<h2 className="tool-name">{tool.name}</h2>
						<p className="tool-description">{tool.description}</p>
					</Link>
				))}
			</div>

			<div className="feature-highlights">
				<h2>🎯 Key Features</h2>
				<div className="highlights-grid">
					<div className="highlight-card">
						<div className="highlight-icon">📐</div>
						<h3>Interactive Equations</h3>
						<p>Adjust sliders to see how changing variables affects results in real time</p>
					</div>
					<div className="highlight-card">
						<div className="highlight-icon">📈</div>
						<h3>Live Graphs</h3>
						<p>Position, velocity, and acceleration plotted as you adjust parameters</p>
					</div>
					<div className="highlight-card">
						<div className="highlight-icon">🎨</div>
						<h3>Visual Simulations</h3>
						<p>Canvas-based projectile trajectories, vector diagrams, and spring animations</p>
					</div>
				</div>
			</div>

			<div className="dashboard-footer">
				<Link href="/dashboard" className="back-to-prooflab">← Back to ProofLab</Link>
			</div>
		</main>
	);
}
