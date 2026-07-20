'use client';

import type { SystemInfo } from '@/lib/biology/systemContent';

export function SystemInfoPanel({ system }: { system: SystemInfo }) {
	return (
		<div className="bio-system-panel">
			<div className="bio-system-header" style={{ borderColor: system.color }}>
				<span className="bio-system-header-icon">{system.icon}</span>
				<div>
					<h2 className="bio-system-header-name">{system.name}</h2>
					<p className="bio-system-header-desc">{system.description}</p>
				</div>
			</div>

			<section className="bio-system-section">
				<h3>🔬 Key Functions</h3>
				<ul className="bio-system-list">
					{system.functions.map((fn, i) => (
						<li key={i}>{fn}</li>
					))}
				</ul>
			</section>

			<section className="bio-system-section">
				<h3>🫀 Main Organs</h3>
				<div className="bio-organs-grid">
					{system.mainOrgans.map((organ, i) => (
						<div key={i} className="bio-organ-card" style={{ borderTopColor: system.color }}>
							<div className="bio-organ-name">{organ.name}</div>
							<div className="bio-organ-detail">{organ.description}</div>
							<div className="bio-organ-meta">
								<span className="bio-organ-location">📍 {organ.location}</span>
								<span className="bio-organ-fn">⚙️ {organ.fn}</span>
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="bio-system-section">
				<h3>🔍 Key Structures</h3>
				<div className="bio-structures-list">
					{system.keyStructures.map((s, i) => (
						<div key={i} className="bio-structure-item">
							<span className="bio-structure-name">{s.name}</span>
							<span className="bio-structure-type">{s.type}</span>
							<span className="bio-structure-desc">{s.description}</span>
						</div>
					))}
				</div>
			</section>

			<section className="bio-system-section">
				<h3>⚠️ Common Conditions</h3>
				{system.commonConditions.map((c, i) => (
					<div key={i} className="bio-condition-card">
						<div className="bio-condition-name">{c.name}</div>
						<div className="bio-condition-desc">{c.description}</div>
						<div className="bio-condition-symptoms">
							<strong>Symptoms:</strong> {c.symptoms.join(', ')}
						</div>
					</div>
				))}
			</section>

			<div className="bio-fun-fact" style={{ borderColor: system.color }}>
				<span className="bio-fun-fact-icon">💡</span>
				<span>{system.funFact}</span>
			</div>
		</div>
	);
}

export default SystemInfoPanel;
