'use client';

import { KinematicsSimulator } from '../../../src/components/physics/KinematicsSimulator';

export default function KinematicsPage() {
	return (
		<main className="physics-page">
			<div className="page-header">
				<h1>📊 Kinematics Simulator</h1>
				<p className="page-description">Explore 1D motion — adjust initial velocity, acceleration, and time to see position, velocity, and acceleration graphs update in real time.</p>
			</div>
			<KinematicsSimulator />
		</main>
	);
}
