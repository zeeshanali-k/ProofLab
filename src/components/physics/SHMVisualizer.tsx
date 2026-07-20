'use client';

import { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import CopyButton from '../CopyButton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function SHMVisualizer() {
	const [mass, setMass] = useState(1);
	const [springConstant, setSpringConstant] = useState(10);
	const [amplitude, setAmplitude] = useState(1);
	const [time, setTime] = useState(0);
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number>(0);
	const pausedRef = useRef(false);
	const [paused, setPaused] = useState(false);

	const omega = Math.sqrt(springConstant / mass);
	const period = 2 * Math.PI / omega;

	useEffect(() => {
		const animate = () => {
			if (!pausedRef.current) {
				setTime(prev => prev + 0.016);
			}
			animRef.current = requestAnimationFrame(animate);
		};
		animRef.current = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(animRef.current);
	}, []);

	const togglePause = () => {
		pausedRef.current = !pausedRef.current;
		setPaused(pausedRef.current);
	};

	const displacement = amplitude * Math.cos(omega * time);
	const velocity = -amplitude * omega * Math.sin(omega * time);
	const acceleration = -amplitude * omega * omega * Math.cos(omega * time);

	const points = 100;
	const timeRange = 2 * period;
	const tData = Array.from({ length: points }, (_, i) => (i / points) * timeRange);
	const posData = tData.map(t => amplitude * Math.cos(omega * t));
	const velData = tData.map(t => -amplitude * omega * Math.sin(omega * t));
	const accData = tData.map(t => -amplitude * omega * omega * Math.cos(omega * t));

	const chartData = {
		labels: tData.map(t => t.toFixed(2)),
		datasets: [
			{ label: 'Position (m)', data: posData, borderColor: 'rgb(59, 130, 246)', tension: 0.4, fill: false },
			{ label: 'Velocity (m/s)', data: velData, borderColor: 'rgb(34, 197, 94)', tension: 0.4, fill: false },
			{ label: 'Acceleration (m/s²)', data: accData, borderColor: 'rgb(239, 68, 68)', tension: 0.4, fill: false }
		]
	};

	useEffect(() => {
		if (!canvasRef.current) return;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const w = canvas.width;
		const h = canvas.height;
		const cx = w / 2;
		const cy = h / 2;

		ctx.clearRect(0, 0, w, h);

		// Wall
		ctx.fillStyle = '#94a3b8';
		ctx.fillRect(20, cy - 40, 10, 80);

		// Spring
		const springStart = 30;
		const springEnd = cx - 30 + displacement * 50;
		const coils = 12;
		ctx.strokeStyle = '#64748b';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(springStart, cy);
		for (let i = 0; i < coils; i++) {
			const x = springStart + ((i + 0.5) / coils) * (springEnd - springStart);
			const offset = (i % 2 === 0) ? 18 : -18;
			ctx.lineTo(x, cy + offset);
		}
		ctx.lineTo(springEnd, cy);
		ctx.stroke();

		// Mass block
		const massSize = 40;
		ctx.fillStyle = '#2563eb';
		ctx.fillRect(springEnd, cy - massSize / 2, massSize, massSize);
		ctx.fillStyle = 'white';
		ctx.font = 'bold 12px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('m', springEnd + massSize / 2, cy + 4);

		// Equilibrium line
		ctx.strokeStyle = '#cbd5e1';
		ctx.setLineDash([4, 4]);
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(cx - 30, cy - 50);
		ctx.lineTo(cx - 30, cy + 50);
		ctx.stroke();
		ctx.setLineDash([]);

		ctx.fillStyle = '#94a3b8';
		ctx.font = '10px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('equilibrium', cx - 30, cy + 62);

		// Floor
		ctx.strokeStyle = '#94a3b8';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(20, cy + massSize / 2);
		ctx.lineTo(w - 20, cy + massSize / 2);
		ctx.stroke();
	}, [displacement]);

	return (
		<div className="physics-card">
			<h3 className="physics-card-title">🌀 Simple Harmonic Motion</h3>
			<p className="physics-card-desc">Mass-spring system: observe oscillation in real time</p>

			<div className="physics-input-grid physics-input-grid-3">
				<div className="physics-input-group">
					<label>Mass (kg)</label>
					<input type="range" min={0.1} max={5} step={0.1} value={mass}
						onChange={(e) => setMass(parseFloat(e.target.value))} className="physics-range" />
					<span className="physics-unit">{mass} kg</span>
				</div>
				<div className="physics-input-group">
					<label>Spring Constant (N/m)</label>
					<input type="range" min={1} max={50} value={springConstant}
						onChange={(e) => setSpringConstant(parseFloat(e.target.value))} className="physics-range" />
					<span className="physics-unit">{springConstant} N/m</span>
				</div>
				<div className="physics-input-group">
					<label>Amplitude (m)</label>
					<input type="range" min={0.1} max={2} step={0.1} value={amplitude}
						onChange={(e) => setAmplitude(parseFloat(e.target.value))} className="physics-range" />
					<span className="physics-unit">{amplitude} m</span>
				</div>
			</div>

			<canvas ref={canvasRef} width={500} height={150} className="physics-canvas physics-canvas-sm" />

			<div className="physics-chart-container">
				<Line data={chartData} options={{
					responsive: true, maintainAspectRatio: false,
					plugins: { legend: { position: 'top' as const } },
					scales: {
						x: { title: { display: true, text: 'Time (s)' }, ticks: { maxTicksLimit: 10 } },
						y: { title: { display: true, text: 'Value' } }
					}
				}} />
			</div>

			<div className="physics-metrics-grid">
				<div className="physics-metric physics-metric-blue">
					<div className="physics-metric-label">Displacement</div>
					<div className="physics-metric-value">{displacement.toFixed(3)} m</div>
				</div>
				<div className="physics-metric physics-metric-green">
					<div className="physics-metric-label">Velocity</div>
					<div className="physics-metric-value">{velocity.toFixed(3)} m/s</div>
				</div>
				<div className="physics-metric physics-metric-red">
					<div className="physics-metric-label">Acceleration</div>
					<div className="physics-metric-value">{acceleration.toFixed(3)} m/s²</div>
				</div>
			</div>

			<div className="physics-formula-note">
				Period: {period.toFixed(3)} s | Frequency: {(1 / period).toFixed(3)} Hz | ω = {omega.toFixed(3)} rad/s
				<button onClick={togglePause} className="physics-pause-btn">{paused ? '▶ Resume' : '⏸ Pause'}</button>
			</div>

			<CopyButton
				textToCopy={`SHM: m=${mass}kg, k=${springConstant}N/m, A=${amplitude}m, T=${period.toFixed(3)}s, x=${displacement.toFixed(3)}m`}
				className="physics-copy-btn"
			>
				Copy Results
			</CopyButton>
		</div>
	);
}

export default SHMVisualizer;
