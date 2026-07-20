'use client';

import { useState } from 'react';
import { ErrorDisplay } from './ErrorDisplay';

interface Organ {
	id: string;
	name: string;
	cx: number;
	cy: number;
	rx: number;
	ry: number;
	color: string;
	system: string;
	description: string;
}

const ORGANS: Organ[] = [
	{ id: 'brain', name: 'Brain', cx: 200, cy: 52, rx: 22, ry: 18, color: '#a855f7', system: 'Nervous', description: 'Control center of the body. ~86 billion neurons process sensory information, coordinate movement, and enable cognition.' },
	{ id: 'heart', name: 'Heart', cx: 210, cy: 148, rx: 14, ry: 12, color: '#ef4444', system: 'Circulatory', description: 'Muscular organ that pumps blood through the circulatory system. Beats ~100,000 times per day.' },
	{ id: 'left-lung', name: 'Left Lung', cx: 180, cy: 148, rx: 18, ry: 22, color: '#3b82f6', system: 'Respiratory', description: 'Gas exchange organ. Oxygen enters the blood, carbon dioxide is expelled. Slightly smaller than the right lung.' },
	{ id: 'right-lung', name: 'Right Lung', cx: 225, cy: 148, rx: 18, ry: 22, color: '#3b82f6', system: 'Respiratory', description: 'Gas exchange organ. Has 3 lobes (vs 2 in the left lung). Processes ~11,000 liters of air daily.' },
	{ id: 'liver', name: 'Liver', cx: 225, cy: 195, rx: 20, ry: 14, color: '#22c55e', system: 'Digestive', description: 'Largest internal organ (~1.5 kg). Detoxifies blood, produces bile, stores glycogen, and synthesizes proteins.' },
	{ id: 'stomach', name: 'Stomach', cx: 185, cy: 200, rx: 16, ry: 14, color: '#eab308', system: 'Digestive', description: 'Muscular sac that breaks down food with hydrochloric acid and enzymes. Capacity ~1 liter.' },
	{ id: 'left-kidney', name: 'Left Kidney', cx: 175, cy: 225, rx: 10, ry: 14, color: '#f97316', system: 'Urinary', description: 'Filters ~180 liters of blood daily. Removes waste, regulates electrolytes, and produces urine.' },
	{ id: 'right-kidney', name: 'Right Kidney', cx: 225, cy: 225, rx: 10, ry: 14, color: '#f97316', system: 'Urinary', description: 'Filters blood and maintains fluid balance. Each kidney contains ~1 million nephrons.' },
	{ id: 'intestines', name: 'Intestines', cx: 200, cy: 255, rx: 24, ry: 18, color: '#a16207', system: 'Digestive', description: 'Small intestine (~6m) absorbs nutrients. Large intestine (~1.5m) absorbs water and forms waste.' },
	{ id: 'bladder', name: 'Bladder', cx: 200, cy: 280, rx: 12, ry: 10, color: '#06b6d4', system: 'Urinary', description: 'Stores urine produced by the kidneys. Can hold 400-600 mL. Controlled by sphincter muscles.' },
];

const SYSTEM_COLORS: Record<string, string> = {
	Nervous: '#a855f7',
	Circulatory: '#ef4444',
	Respiratory: '#3b82f6',
	Digestive: '#22c55e',
	Urinary: '#f97316',
};

export function OrganHighlighter() {
	const [selectedOrgan, setSelectedOrgan] = useState<Organ | null>(null);
	const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
	const [filterSystem, setFilterSystem] = useState<string | null>(null);

	const systems = [...new Set(ORGANS.map(o => o.system))];
	const filteredOrgans = filterSystem ? ORGANS.filter(o => o.system === filterSystem) : ORGANS;

	return (
		<div className="bio-card">
			<h3 className="bio-card-title">🧫 Organ Highlighter</h3>
			<p className="bio-card-desc">Click any organ to see details. Filter by body system.</p>

			<div className="bio-controls">
				<div className="bio-control-group">
					<label>Filter by System</label>
					<div className="bio-btn-group">
						<button onClick={() => setFilterSystem(null)}
							className={`bio-btn ${!filterSystem ? 'active' : ''}`}>All</button>
						{systems.map(sys => (
							<button key={sys} onClick={() => setFilterSystem(filterSystem === sys ? null : sys)}
								className={`bio-btn ${filterSystem === sys ? 'active' : ''}`}
								style={filterSystem === sys ? { background: SYSTEM_COLORS[sys], borderColor: SYSTEM_COLORS[sys] } : {}}>
								{sys}
							</button>
						))}
					</div>
				</div>
			</div>

			<div className="bio-anatomy-layout">
				<div className="bio-anatomy-svg-wrap">
					<svg viewBox="0 0 400 340" className="bio-anatomy-svg">
						{/* Body outline */}
						<ellipse cx="200" cy="55" rx="35" ry="40" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="185" y="93" width="30" height="24" rx="8" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="145" y="115" width="110" height="80" rx="12" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="150" y="193" width="100" height="60" rx="10" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
						<rect x="155" y="251" width="90" height="50" rx="8" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />

						{/* Organs */}
						{filteredOrgans.map(organ => {
							const isSelected = selectedOrgan?.id === organ.id;
							const isHovered = hoveredOrgan === organ.id;
							return (
								<g key={organ.id}
									onClick={() => setSelectedOrgan(isSelected ? null : organ)}
									onMouseEnter={() => setHoveredOrgan(organ.id)}
									onMouseLeave={() => setHoveredOrgan(null)}
									style={{ cursor: 'pointer' }}
								>
									<ellipse
										cx={organ.cx} cy={organ.cy}
										rx={isSelected ? organ.rx + 2 : organ.rx}
										ry={isSelected ? organ.ry + 2 : organ.ry}
										fill={isSelected ? organ.color : isHovered ? `${organ.color}cc` : `${organ.color}88`}
										stroke={isSelected ? '#1f2937' : isHovered ? organ.color : 'transparent'}
										strokeWidth={isSelected ? 3 : isHovered ? 2 : 0}
										style={{ transition: 'all 0.2s' }}
									/>
									<text x={organ.cx} y={organ.cy + 4}
										textAnchor="middle" fontSize="8" fontWeight="600"
										fill="white" style={{ pointerEvents: 'none' }}>
										{organ.name.length > 10 ? organ.name.slice(0, 8) + '…' : organ.name}
									</text>
								</g>
							);
						})}
					</svg>
				</div>

				<div className="bio-anatomy-info">
					{selectedOrgan ? (
						<div className="bio-info-card" style={{ borderLeftColor: selectedOrgan.color }}>
							<h4 style={{ color: selectedOrgan.color }}>{selectedOrgan.name}</h4>
							<p>{selectedOrgan.description}</p>
							<div className="bio-info-tag" style={{ background: `${selectedOrgan.color}15`, color: selectedOrgan.color }}>
								System: {selectedOrgan.system}
							</div>
						</div>
					) : (
						<div className="bio-info-card bio-info-placeholder">
							<p>👆 Click an organ to see its description and function</p>
						</div>
					)}

					<div className="bio-systems-list">
						<h4>Organs ({filteredOrgans.length})</h4>
						{filteredOrgans.map(organ => (
							<div key={organ.id}
								className={`bio-system-item ${selectedOrgan?.id === organ.id ? 'bio-system-item-active' : ''}`}
								style={{
									borderLeftColor: organ.color,
									background: selectedOrgan?.id === organ.id ? `${organ.color}08` : 'white'
								}}
								onClick={() => setSelectedOrgan(selectedOrgan?.id === organ.id ? null : organ)}
							>
								<span className="bio-system-dot" style={{ background: organ.color }} />
								<div>
									<div className="bio-system-name">{organ.name}</div>
									<div className="bio-system-desc">{organ.system} system</div>
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

export default OrganHighlighter;
