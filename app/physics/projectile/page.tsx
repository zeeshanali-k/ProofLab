'use client';

import { ProjectileSimulator } from '../../../src/components/physics/ProjectileSimulator';

export default function ProjectilePage() {
	return (
		<main className="physics-page">
			<div className="page-header">
				<h1>🎯 Projectile Motion</h1>
				<p className="page-description">Launch a projectile by adjusting velocity, angle, initial height, and gravity. Watch the parabolic trajectory and see range, max height, and time of flight.</p>
			</div>
			<ProjectileSimulator />
		</main>
	);
}
