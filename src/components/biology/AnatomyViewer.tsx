'use client';

import { useState } from 'react';
import { BODY_SYSTEMS, ORGANS } from '@/lib/biology/constants';
import { ErrorDisplay } from './ErrorDisplay';

const BODY_REGIONS = [
	{ id: 'head', label: 'Head', cx: 200, cy: 55, rx: 35, ry: 40 },
	{ id: 'neck', label: 'Neck', cx: 200, cy: 105, rx: 15, ry: 12 },
	{ id: 'chest', label: 'Chest', cx: 200, cy: 155, rx: 55, ry: 40 },
	{ id: 'abdomen', label: 'Abdomen', cx: 200, cy: 220, rx: 50, ry: 35 },
	{ id: 'pelvis', label: 'Pelvis', cx: 200, cy: 270, rx: 45, ry: 25 },
	{ id: 'left-arm', label: 'Left Arm', cx: 120, cy: 165, rx: 18, ry: 55 },
	{ id: 'right-arm', label: 'Right Arm', cx: 280, cy: 165, rx: 18, ry: 55 },
	{ id: 'left-leg', label: 'Left Leg', cx: 175, cy: 355, rx: 22, ry: 65 },
	{ id: 'right-leg', label: 'Right Leg', cx: 225, cy: 355, rx: 22, ry: 65 },
];

const ORGAN_POSITIONS: Record<string, { cx: number; cy: number; r: number; color: string }> = {
	brain: { cx: 200, cy: 50, r: 18, color: '#a855f7' },
	heart: { cx: 210, cy: 145, r: 14, color: '#ef4444' },
	lungs: { cx: 185, cy: 155, r: 16, color: '#3b82f6' },
	liver: { cx: 220, cy: 200, r: 14, color: '#22c55e' },
	stomach: { cx: 185, cy: 215, r: 12, color: '#eab308' },
	kidneys: { cx: 200, cy: 235, r: 10, color: '#f97316' },
	intestines: { cx: 200, cy: 255, r: 16, color: '#a16207' },
	spine: { cx: 200, cy: 185, r: 6, color: '#fbbf24' },
};

export function AnatomyViewer() {
	const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
	const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);
	const [showOrgans, setShowOrgans] = useState(true);
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);

	const selectedOrganData = ORGANS.find(o => o.id === selectedOrgan);
	const selectedRegionData = BODY_REGIONS.find(r => r.id === selectedRegion);

	return (
		<div className="bio-card">
			<h3 className="bio-card-title">🧬 Interactive Anatomy Viewer</h3>
			<p className="bio-card-desc">Click body regions to explore anatomy. Toggle organ overlay to see major organs.</p>

			<div className="bio-controls">
				<button onClick={() => setShowOrgans(!showOrgans)} className={`bio-btn ${showOrgans ? 'active' : ''}`}>
					{showOrgans ? '🫀 Hide' : '🫀 Show'} Organs
				</button>
			</div>

			<div className="bio-anatomy-layout">
				<div className="bio-anatomy-svg-wrap">
					<svg viewBox="0 0 400 440" className="bio-anatomy-svg">
						<ellipse cx="200" cy="55" rx="35" ry="40" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="185" y="93" width="30" height="24" rx="8" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="145" y="115" width="110" height="80" rx="12" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="150" y="193" width="100" height="60" rx="10" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="155" y="251" width="90" height="35" rx="8" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="102" y="120" width="36" height="110" rx="14" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="262" y="120" width="36" height="110" rx="14" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="155" y="284" width="40" height="130" rx="14" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="205" y="284" width="40" height="130" rx="14" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />

						{BODY_REGIONS.map(region => (
							<ellipse key={region.id}
								cx={region.cx} cy={region.cy} rx={region.rx} ry={region.ry}
								fill={selectedRegion === region.id ? 'rgba(99,102,241,0.25)' : hoveredItem === region.id ? 'rgba(99,102,241,0.12)' : 'transparent'}
								stroke={selectedRegion === region.id ? '#6366f1' : 'transparent'}
								strokeWidth="2" strokeDasharray="4 2"
								style={{ cursor: 'pointer' }}
								onClick={() => { setSelectedRegion(selectedRegion === region.id ? null : region.id); setSelectedOrgan(null); }}
								onMouseEnter={() => setHoveredItem(region.id)}
								onMouseLeave={() => setHoveredItem(null)}
							/>
						))}
						{BODY_REGIONS.map(region => (
							<text key={`l-${region.id}`} x={region.cx} y={region.cy + 4}
								textAnchor="middle" fontSize="9" fill="#6b7280" fontWeight="500"
								style={{ pointerEvents: 'none' }}>{region.label}</text>
						))}

						{showOrgans && Object.entries(ORGAN_POSITIONS).map(([id, pos]) => (
							<g key={id}>
								<circle cx={pos.cx} cy={pos.cy} r={pos.r}
									fill={selectedOrgan === id ? pos.color : `${pos.color}99`}
									stroke={selectedOrgan === id ? '#1f2937' : pos.color}
									strokeWidth={selectedOrgan === id ? 2.5 : 1.5}
									style={{ cursor: 'pointer', transition: 'all 0.2s' }}
									onClick={() => setSelectedOrgan(selectedOrgan === id ? null : id)}
									onMouseEnter={() => setHoveredItem(`organ-${id}`)}
									onMouseLeave={() => setHoveredItem(null)}
								/>
								<text x={pos.cx} y={pos.cy + 3} textAnchor="middle" fontSize="7"
									fill="white" fontWeight="bold" style={{ pointerEvents: 'none' }}>
									{id.slice(0, 3).toUpperCase()}
								</text>
							</g>
						))}
					</svg>
				</div>

				<div className="bio-anatomy-info">
					{selectedOrganData ? (
						<div className="bio-info-card" style={{ borderLeftColor: ORGAN_POSITIONS[selectedOrgan!]?.color }}>
							<h4>{selectedOrganData.name}</h4>
							<p>{selectedOrganData.description}</p>
							<div className="bio-info-tag">System: {selectedOrganData.system}</div>
						</div>
					) : selectedRegionData ? (
						<div className="bio-info-card">
							<h4>{selectedRegionData.label}</h4>
							<p>Click an organ in this region for details.</p>
						</div>
					) : (
						<div className="bio-info-card bio-info-placeholder">
							<p>👆 Click a body region or organ to learn more</p>
						</div>
					)}

					<div className="bio-systems-list">
						<h4>Body Systems</h4>
						{BODY_SYSTEMS.map(sys => (
							<div key={sys.id} className="bio-system-item" style={{ borderLeftColor: sys.color }}>
								<span className="bio-system-dot" style={{ background: sys.color }} />
								<div>
									<div className="bio-system-name">{sys.name}</div>
									<div className="bio-system-desc">{sys.description}</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<ErrorDisplay errors={[]} />
		</div>
	);
}

export default AnatomyViewer;
