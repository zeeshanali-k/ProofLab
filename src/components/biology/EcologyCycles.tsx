'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { ECOLOGY_CYCLES } from '@/lib/biology/constants';
import { ErrorDisplay } from './ErrorDisplay';
import CopyButton from '../CopyButton';

interface NodePos { x: number; y: number; w: number; h: number; }

const CYCLE_LAYOUTS: Record<string, { nodes: Record<string, NodePos>; icon: string }> = {
	'Carbon Cycle': {
		icon: '🌿',
		nodes: {
			'Atmosphere':         { x: 300, y: 40,  w: 130, h: 50 },
			'Plants':             { x: 100, y: 160, w: 120, h: 50 },
			'Oceans':             { x: 500, y: 160, w: 120, h: 50 },
			'Terrestrial Biosphere': { x: 100, y: 300, w: 150, h: 50 },
			'Fossil Fuels':       { x: 500, y: 300, w: 130, h: 50 },
		}
	},
	'Nitrogen Cycle': {
		icon: '🧪',
		nodes: {
			'Atmosphere':         { x: 300, y: 40,  w: 130, h: 50 },
			'Soil Organic Matter': { x: 300, y: 300, w: 150, h: 50 },
			'Oceans':             { x: 530, y: 170, w: 120, h: 50 },
		}
	},
	'Water Cycle': {
		icon: '💧',
		nodes: {
			'Oceans':             { x: 500, y: 300, w: 120, h: 50 },
			'Ice Caps/Glaciers':  { x: 100, y: 40,  w: 150, h: 50 },
			'Groundwater':        { x: 100, y: 300, w: 130, h: 50 },
			'Atmosphere':         { x: 300, y: 160, w: 130, h: 50 },
		}
	},
	'Phosphorus Cycle': {
		icon: '🪨',
		nodes: {
			"Earth's Crust":      { x: 100, y: 40,  w: 130, h: 50 },
			'Soil':               { x: 300, y: 160, w: 110, h: 50 },
			'Oceans':             { x: 530, y: 160, w: 120, h: 50 },
		}
	},
};

const CYCLE_COLORS: Record<string, { primary: string; accent: string; bg: string; light: string }> = {
	'Carbon Cycle':        { primary: '#374151', accent: '#6b7280', bg: '#f9fafb', light: '#f3f4f6' },
	'Nitrogen Cycle':      { primary: '#5b21b6', accent: '#7c3aed', bg: '#faf5ff', light: '#f5f3ff' },
	'Water Cycle':         { primary: '#1d4ed8', accent: '#2563eb', bg: '#eff6ff', light: '#dbeafe' },
	'Phosphorus Cycle':    { primary: '#92400e', accent: '#d97706', bg: '#fffbeb', light: '#fef3c7' },
};

function resolveNodeName(name: string, layout: Record<string, NodePos>): string | null {
	if (layout[name]) return name;
	for (const key of Object.keys(layout)) {
		if (name.includes(key) || key.includes(name)) return key;
		const keyWords = key.split(/\s+/);
		for (const w of keyWords) {
			if (w.length > 3 && name.includes(w)) return key;
		}
	}
	return null;
}

function getEdgePoint(node: NodePos, targetX: number, targetY: number): { x: number; y: number } {
	const cx = node.x + node.w / 2;
	const cy = node.y + node.h / 2;
	const dx = targetX - cx;
	const dy = targetY - cy;
	const angle = Math.atan2(dy, dx);
	const hw = node.w / 2;
	const hh = node.h / 2;
	const tanA = Math.abs(Math.tan(angle));
	let ex: number, ey: number;
	if (tanA * hw <= hh) {
		ex = dx > 0 ? hw : -hw;
		ey = ex * Math.tan(angle);
	} else {
		ey = dy > 0 ? hh : -hh;
		ex = ey / Math.tan(angle);
	}
	return { x: cx + ex, y: cy + ey };
}

function CycleDiagram({ cycleName, reservoirs, fluxes }: {
	cycleName: string;
	reservoirs: { name: string; amount: string }[];
	fluxes: { from: string; to: string; rate: string }[];
}) {
	const svgRef = useRef<SVGSVGElement>(null);
	const [zoom, setZoom] = useState(1);
	const [pan, setPan] = useState({ x: 0, y: 0 });
	const [dragging, setDragging] = useState(false);
	const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
	const [hoveredFlux, setHoveredFlux] = useState<number | null>(null);
	const [hoveredNode, setHoveredNode] = useState<string | null>(null);

	const layout = CYCLE_LAYOUTS[cycleName];
	const colors = CYCLE_COLORS[cycleName] || CYCLE_COLORS['Carbon Cycle'];
	if (!layout) return null;

	const markerId = `arrow-${cycleName.replace(/\s/g, '')}`;

	const handleWheel = useCallback((e: React.WheelEvent) => {
		e.preventDefault();
		setZoom(z => Math.max(0.5, Math.min(3, z - e.deltaY * 0.001)));
	}, []);

	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		if (e.button === 0) {
			setDragging(true);
			setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
		}
	}, [pan]);

	const handleMouseMove = useCallback((e: React.MouseEvent) => {
		if (dragging) {
			setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
		}
	}, [dragging, dragStart]);

	const handleMouseUp = useCallback(() => {
		setDragging(false);
	}, []);

	useEffect(() => {
		setZoom(1);
		setPan({ x: 0, y: 0 });
	}, [cycleName]);

	return (
		<div className="bio-cycle-canvas">
			<div className="bio-cycle-toolbar">
				<span className="bio-cycle-icon">{layout.icon} {cycleName}</span>
				<div className="bio-cycle-zoom">
					<button onClick={() => setZoom(z => Math.max(0.5, z - 0.2))} className="bio-zoom-btn">−</button>
					<span className="bio-zoom-label">{Math.round(zoom * 100)}%</span>
					<button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="bio-zoom-btn">+</button>
					<button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="bio-zoom-btn bio-zoom-reset">Reset</button>
				</div>
			</div>

			<div
				className="bio-cycle-svg-container"
				onWheel={handleWheel}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				style={{ cursor: dragging ? 'grabbing' : 'grab' }}
			>
				<svg
					ref={svgRef}
					viewBox="0 0 700 400"
					className="bio-cycle-svg"
					style={{
						transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
						transformOrigin: 'center center',
					}}
				>
					<defs>
						<marker id={markerId} markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
							<polygon points="0 0, 10 4, 0 8" fill={colors.accent} opacity="0.8" />
						</marker>
						<marker id={`${markerId}-hover`} markerWidth="12" markerHeight="9" refX="11" refY="4.5" orient="auto">
							<polygon points="0 0, 12 4.5, 0 9" fill={colors.primary} />
						</marker>
						<filter id="node-shadow">
							<feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
						</filter>
					</defs>

					{/* Flux arrows (drawn first, behind nodes) */}
					{fluxes.map((f, i) => {
						const fromKey = resolveNodeName(f.from, layout.nodes);
						const toKey = resolveNodeName(f.to, layout.nodes);
						if (!fromKey || !toKey) return null;

						const fromNode = layout.nodes[fromKey];
						const toNode = layout.nodes[toKey];
						const fromCx = fromNode.x + fromNode.w / 2;
						const fromCy = fromNode.y + fromNode.h / 2;
						const toCx = toNode.x + toNode.w / 2;
						const toCy = toNode.y + toNode.h / 2;

						const start = getEdgePoint(fromNode, toCx, toCy);
						const end = getEdgePoint(toNode, fromCx, fromCy);

						const mx = (start.x + end.x) / 2;
						const my = (start.y + end.y) / 2;
						const dx = end.x - start.x;
						const dy = end.y - start.y;
						const len = Math.sqrt(dx * dx + dy * dy);
						const nx = -dy / len;
						const ny = dx / len;
						const curve = Math.min(len * 0.2, 30);
						const cpx = mx + nx * curve;
						const cpy = my + ny * curve;

						const isHovered = hoveredFlux === i;

						return (
							<g key={`flux-${i}`}
								onMouseEnter={() => setHoveredFlux(i)}
								onMouseLeave={() => setHoveredFlux(null)}
								style={{ cursor: 'pointer' }}
							>
								<path
									d={`M ${start.x} ${start.y} Q ${cpx} ${cpy} ${end.x} ${end.y}`}
									fill="none"
									stroke={isHovered ? colors.primary : colors.accent}
									strokeWidth={isHovered ? 3 : 2}
									opacity={isHovered ? 1 : 0.5}
									markerEnd={`url(#${isHovered ? `${markerId}-hover` : markerId})`}
									style={{ transition: 'all 0.2s' }}
								/>
								<rect
									x={cpx - 35} y={cpy - 10}
									width="70" height="18" rx="4"
									fill="white" stroke={colors.accent} strokeWidth="0.5"
									opacity={isHovered ? 1 : 0.85}
								/>
								<text x={cpx} y={cpy + 3} textAnchor="middle"
									fontSize="8" fill={colors.primary} fontWeight={isHovered ? '600' : '400'}>
									{f.rate}
								</text>
							</g>
						);
					})}

					{/* Reservoir nodes */}
					{reservoirs.map((r, i) => {
						const nodeKey = resolveNodeName(r.name, layout.nodes);
						if (!nodeKey) return null;
						const node = layout.nodes[nodeKey];
						const isHovered = hoveredNode === nodeKey;

						return (
							<g key={`node-${i}`}
								onMouseEnter={() => setHoveredNode(nodeKey)}
								onMouseLeave={() => setHoveredNode(null)}
							>
								<rect
									x={node.x} y={node.y}
									width={node.w} height={node.h}
									rx="12"
									fill={isHovered ? colors.light : 'white'}
									stroke={isHovered ? colors.primary : colors.accent}
									strokeWidth={isHovered ? 2.5 : 1.5}
									filter="url(#node-shadow)"
									style={{ transition: 'all 0.2s' }}
								/>
								<text x={node.x + node.w / 2} y={node.y + node.h / 2 - 5}
									textAnchor="middle" fontSize="11" fontWeight="600"
									fill={colors.primary}>
									{r.name.length > 18 ? r.name.slice(0, 16) + '…' : r.name}
								</text>
								<text x={node.x + node.w / 2} y={node.y + node.h / 2 + 11}
									textAnchor="middle" fontSize="9" fill={colors.accent}>
									{r.amount}
								</text>
							</g>
						);
					})}
				</svg>
			</div>

			<div className="bio-cycle-hint">Scroll to zoom • Drag to pan • Hover arrows for details</div>
		</div>
	);
}

export function EcologyCycles() {
	const [selectedCycle, setSelectedCycle] = useState(0);
	const cycle = ECOLOGY_CYCLES[selectedCycle];

	return (
		<div className="bio-card">
			<h3 className="bio-card-title">🌍 Biogeochemical Cycles</h3>
			<p className="bio-card-desc">Explore how elements move through Earth&apos;s systems</p>

			<div className="bio-cycle-tabs">
				{ECOLOGY_CYCLES.map((c, i) => (
					<button key={i} onClick={() => setSelectedCycle(i)}
						className={`bio-btn ${selectedCycle === i ? 'active' : ''}`}>
						{c.name}
					</button>
				))}
			</div>

			<CycleDiagram cycleName={cycle.name} reservoirs={cycle.reservoirs} fluxes={cycle.fluxes} />

			<div className="bio-cycle-content">
				<h4 className="bio-cycle-name">{cycle.name}</h4>
				<p className="bio-cycle-desc">{cycle.description}</p>

				<div className="bio-cycle-section">
					<h5>Reservoirs</h5>
					<div className="bio-reservoirs-grid">
						{cycle.reservoirs.map((r, i) => (
							<div key={i} className="bio-reservoir-card">
								<div className="bio-reservoir-name">{r.name}</div>
								<div className="bio-reservoir-amount">{r.amount}</div>
							</div>
						))}
					</div>
				</div>

				<div className="bio-cycle-section">
					<h5>Fluxes</h5>
					<div className="bio-fluxes-list">
						{cycle.fluxes.map((f, i) => (
							<div key={i} className="bio-flux-item">
								<span className="bio-flux-from">{f.from}</span>
								<span className="bio-flux-arrow">→</span>
								<span className="bio-flux-to">{f.to}</span>
								<span className="bio-flux-rate">{f.rate}</span>
							</div>
						))}
					</div>
				</div>

				<div className="bio-human-impact">
					<h5>🌍 Human Impact</h5>
					<p>{cycle.humanImpact}</p>
				</div>
			</div>

			<ErrorDisplay errors={[]} />

			<CopyButton
				textToCopy={`${cycle.name}\n${cycle.description}\n\nReservoirs:\n${cycle.reservoirs.map(r => `  ${r.name}: ${r.amount}`).join('\n')}\n\nFluxes:\n${cycle.fluxes.map(f => `  ${f.from} → ${f.to}: ${f.rate}`).join('\n')}\n\nHuman Impact: ${cycle.humanImpact}`}
				className="bio-copy-btn"
			>
				Copy Cycle Data
			</CopyButton>
		</div>
	);
}

export default EcologyCycles;
