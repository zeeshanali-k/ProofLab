'use client';

import { useState, useEffect, useRef } from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import CopyButton from '../CopyButton';

export function ProjectileSimulator() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [params, setParams] = useState({ v0: 20, theta: 45, h: 0, g: 9.81 });
	const [trajectory, setTrajectory] = useState<{ x: number; y: number }[]>([]);
	const [metrics, setMetrics] = useState({ range: 0, maxHeight: 0, timeOfFlight: 0 });
	const [errors, setErrors] = useState<any[]>([]);

	useEffect(() => {
		try {
			const { v0, theta, h, g } = params;
			const thetaRad = theta * Math.PI / 180;
			const v0x = v0 * Math.cos(thetaRad);
			const v0y = v0 * Math.sin(thetaRad);

			const discriminant = v0y * v0y + 2 * g * h;
			if (discriminant < 0) {
				setErrors([{ field: 'general', message: 'Invalid parameters — projectile never lands', type: 'inconsistent' }]);
				return;
			}

			const tFlight = (v0y + Math.sqrt(discriminant)) / g;
			const range = v0x * tFlight;
			const maxHeight = h + (v0y * v0y) / (2 * g);

			setMetrics({ range, maxHeight, timeOfFlight: tFlight });
			setErrors([]);

			const points = 100;
			const trajectoryPoints: { x: number; y: number }[] = [];
			for (let i = 0; i <= points; i++) {
				const t = (i / points) * tFlight;
				const x = v0x * t;
				const y = h + v0y * t - 0.5 * g * t * t;
				if (y >= 0) trajectoryPoints.push({ x, y });
			}
			setTrajectory(trajectoryPoints);
		} catch (err: any) {
			setErrors([{ field: 'general', message: err.message, type: 'syntax' }]);
		}
	}, [params]);

	useEffect(() => {
		if (!canvasRef.current || trajectory.length === 0) return;

		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const w = canvas.width;
		const h = canvas.height;
		const maxX = Math.max(metrics.range * 1.1, 10);
		const maxY = Math.max(metrics.maxHeight * 1.2, 10);

		ctx.clearRect(0, 0, w, h);

		// Draw grid
		ctx.strokeStyle = '#e5e7eb';
		ctx.lineWidth = 0.5;
		for (let i = 0; i <= 10; i++) {
			const x = 40 + (i / 10) * (w - 60);
			const y = 20 + (i / 10) * (h - 50);
			ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, h - 30); ctx.stroke();
			ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(w - 20, y); ctx.stroke();
		}

		// Draw axes
		ctx.strokeStyle = '#94a3b8';
		ctx.lineWidth = 1.5;
		ctx.beginPath(); ctx.moveTo(40, h - 30); ctx.lineTo(w - 20, h - 30); ctx.stroke();
		ctx.beginPath(); ctx.moveTo(40, h - 30); ctx.lineTo(40, 20); ctx.stroke();

		// Draw trajectory
		ctx.strokeStyle = '#2563eb';
		ctx.lineWidth = 3;
		ctx.beginPath();
		trajectory.forEach((p, i) => {
			const x = 40 + (p.x / maxX) * (w - 60);
			const y = (h - 30) - (p.y / maxY) * (h - 50);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
		ctx.stroke();

		// Draw max height marker
		const peakIdx = trajectory.reduce((maxI, p, i, arr) => p.y > arr[maxI].y ? i : maxI, 0);
		const peak = trajectory[peakIdx];
		if (peak) {
			const px = 40 + (peak.x / maxX) * (w - 60);
			const py = (h - 30) - (peak.y / maxY) * (h - 50);
			ctx.fillStyle = '#16a34a';
			ctx.beginPath(); ctx.arc(px, py, 5, 0, Math.PI * 2); ctx.fill();
			ctx.fillStyle = '#16a34a';
			ctx.font = '11px sans-serif';
			ctx.fillText(`max: ${peak.y.toFixed(1)}m`, px + 8, py - 4);
		}

		// Axis labels
		ctx.fillStyle = '#64748b';
		ctx.font = '11px sans-serif';
		ctx.fillText('Distance (m)', w / 2 - 30, h - 8);
		ctx.save();
		ctx.translate(12, h / 2);
		ctx.rotate(-Math.PI / 2);
		ctx.fillText('Height (m)', -25, 0);
		ctx.restore();
	}, [trajectory, metrics]);

	return (
		<div className="physics-card">
			<h3 className="physics-card-title">Projectile Motion Simulator</h3>
			<p className="physics-card-desc">Launch a projectile and observe its trajectory</p>

			<div className="physics-input-grid physics-input-grid-4">
				<div className="physics-input-group">
					<label>Velocity</label>
					<input type="range" min={5} max={50} value={params.v0}
						onChange={(e) => setParams(p => ({ ...p, v0: parseFloat(e.target.value) }))}
						className="physics-range" />
					<span className="physics-unit">{params.v0} m/s</span>
				</div>
				<div className="physics-input-group">
					<label>Angle</label>
					<input type="range" min={5} max={85} value={params.theta}
						onChange={(e) => setParams(p => ({ ...p, theta: parseFloat(e.target.value) }))}
						className="physics-range" />
					<span className="physics-unit">{params.theta}°</span>
				</div>
				<div className="physics-input-group">
					<label>Height</label>
					<input type="range" min={0} max={20} value={params.h}
						onChange={(e) => setParams(p => ({ ...p, h: parseFloat(e.target.value) }))}
						className="physics-range" />
					<span className="physics-unit">{params.h} m</span>
				</div>
				<div className="physics-input-group">
					<label>Gravity</label>
					<input type="range" min={1} max={20} step={0.5} value={params.g}
						onChange={(e) => setParams(p => ({ ...p, g: parseFloat(e.target.value) }))}
						className="physics-range" />
					<span className="physics-unit">{params.g} m/s²</span>
				</div>
			</div>

			<canvas ref={canvasRef} width={600} height={350} className="physics-canvas" />

			<ErrorDisplay errors={errors} />

			{metrics.range > 0 && errors.length === 0 && (
				<>
					<div className="physics-metrics-grid">
						<div className="physics-metric physics-metric-blue">
							<div className="physics-metric-label">Range</div>
							<div className="physics-metric-value">{metrics.range.toFixed(2)} m</div>
						</div>
						<div className="physics-metric physics-metric-green">
							<div className="physics-metric-label">Max Height</div>
							<div className="physics-metric-value">{metrics.maxHeight.toFixed(2)} m</div>
						</div>
						<div className="physics-metric physics-metric-purple">
							<div className="physics-metric-label">Time of Flight</div>
							<div className="physics-metric-value">{metrics.timeOfFlight.toFixed(2)} s</div>
						</div>
					</div>
					<CopyButton
						textToCopy={`v₀=${params.v0} m/s, θ=${params.theta}°, h=${params.h}m → Range=${metrics.range.toFixed(2)}m, MaxH=${metrics.maxHeight.toFixed(2)}m, T=${metrics.timeOfFlight.toFixed(2)}s`}
						className="physics-copy-btn"
					>
						Copy Results
					</CopyButton>
				</>
			)}
		</div>
	);
}

export default ProjectileSimulator;
