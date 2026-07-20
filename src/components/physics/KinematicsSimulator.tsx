'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
} from 'chart.js';
import { solveKinematics } from '@/lib/physics/kinematics';
import { ErrorDisplay } from './ErrorDisplay';
import CopyButton from '../CopyButton';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function KinematicsSimulator() {
	const [u, setU] = useState(0);
	const [a, setA] = useState(2);
	const [t, setT] = useState(5);
	const [result, setResult] = useState<any>(null);
	const [errors, setErrors] = useState<any[]>([]);

	useEffect(() => {
		try {
			if (t < 0) {
				setErrors([{ field: 't', message: 'Time cannot be negative', type: 'out_of_range' }]);
				setResult(null);
				return;
			}
			const solved = solveKinematics({ u, a, t });
			setResult(solved);
			setErrors([]);
		} catch (err: any) {
			setErrors([{ field: 'general', message: err.message, type: 'syntax' }]);
			setResult(null);
		}
	}, [u, a, t]);

	const chartData = result ? {
		labels: result.graphs.position.t.map((t: number) => t.toFixed(1)),
		datasets: [
			{
				label: 'Position (m)',
				data: result.graphs.position.values,
				borderColor: 'rgb(59, 130, 246)',
				backgroundColor: 'rgba(59, 130, 246, 0.1)',
				tension: 0.4,
				fill: false,
			},
			{
				label: 'Velocity (m/s)',
				data: result.graphs.velocity.values,
				borderColor: 'rgb(34, 197, 94)',
				backgroundColor: 'rgba(34, 197, 94, 0.1)',
				tension: 0.4,
				fill: false,
			},
			{
				label: 'Acceleration (m/s²)',
				data: result.graphs.acceleration.values,
				borderColor: 'rgb(239, 68, 68)',
				backgroundColor: 'rgba(239, 68, 68, 0.1)',
				tension: 0.4,
				fill: false,
			}
		]
	} : null;

	return (
		<div className="physics-card">
			<h3 className="physics-card-title">1D Kinematics Simulator</h3>
			<p className="physics-card-desc">Explore position, velocity, and acceleration over time</p>

			<div className="physics-input-grid physics-input-grid-3">
				<div className="physics-input-group">
					<label>Initial Velocity (u)</label>
					<input type="number" value={u} onChange={(e) => setU(parseFloat(e.target.value) || 0)} className="physics-input" step={0.5} />
					<span className="physics-unit">m/s</span>
				</div>
				<div className="physics-input-group">
					<label>Acceleration (a)</label>
					<input type="number" value={a} onChange={(e) => setA(parseFloat(e.target.value) || 0)} className="physics-input" step={0.5} />
					<span className="physics-unit">m/s²</span>
				</div>
				<div className="physics-input-group">
					<label>Time (t)</label>
					<input type="number" min={0} step={0.5} value={t} onChange={(e) => setT(parseFloat(e.target.value) || 0)} className="physics-input" />
					<span className="physics-unit">s</span>
				</div>
			</div>

			<ErrorDisplay errors={errors} />

			{result && errors.length === 0 && (
				<>
					<div className="physics-chart-container">
						<Line
							data={chartData!}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								plugins: { legend: { position: 'top' as const } },
								scales: {
									x: { title: { display: true, text: 'Time (s)' } },
									y: { title: { display: true, text: 'Value' } }
								}
							}}
						/>
					</div>

					<div className="physics-metrics-grid">
						<div className="physics-metric physics-metric-blue">
							<div className="physics-metric-label">Displacement</div>
							<div className="physics-metric-value">{result.displacement.toFixed(2)} m</div>
						</div>
						<div className="physics-metric physics-metric-green">
							<div className="physics-metric-label">Final Velocity</div>
							<div className="physics-metric-value">{result.finalVelocity.toFixed(2)} m/s</div>
						</div>
						<div className="physics-metric physics-metric-red">
							<div className="physics-metric-label">Acceleration</div>
							<div className="physics-metric-value">{result.acceleration.toFixed(2)} m/s²</div>
						</div>
					</div>

					<CopyButton
						textToCopy={`u=${u} m/s, a=${a} m/s², t=${t} s → s=${result.displacement.toFixed(2)} m, v=${result.finalVelocity.toFixed(2)} m/s`}
						className="physics-copy-btn"
					>
						Copy Results
					</CopyButton>
				</>
			)}
		</div>
	);
}

export default KinematicsSimulator;
