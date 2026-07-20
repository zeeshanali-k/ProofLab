'use client';

import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { calculateEnergy } from '@/lib/physics/energy';
import { ErrorDisplay } from './ErrorDisplay';
import CopyButton from '../CopyButton';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function EnergyExplorer() {
	const [mass, setMass] = useState(1);
	const [velocity, setVelocity] = useState(5);
	const [height, setHeight] = useState(10);
	const [g, setG] = useState(9.81);
	const [result, setResult] = useState<any>(null);
	const [errors, setErrors] = useState<any[]>([]);

	useEffect(() => {
		try {
			if (mass <= 0) {
				setErrors([{ field: 'mass', message: 'Mass must be positive', type: 'out_of_range' }]);
				setResult(null);
				return;
			}
			const calculated = calculateEnergy(mass, velocity, height, g);
			setResult(calculated);
			setErrors([]);
		} catch (err: any) {
			setErrors([{ field: 'general', message: err.message, type: 'syntax' }]);
			setResult(null);
		}
	}, [mass, velocity, height, g]);

	const chartData = result ? {
		labels: ['Kinetic Energy', 'Potential Energy', 'Total Energy'],
		datasets: [{
			label: 'Energy (J)',
			data: [result.kinetic, result.potential, result.total],
			backgroundColor: ['rgba(59, 130, 246, 0.6)', 'rgba(34, 197, 94, 0.6)', 'rgba(239, 68, 68, 0.6)'],
			borderColor: ['rgb(59, 130, 246)', 'rgb(34, 197, 94)', 'rgb(239, 68, 68)'],
			borderWidth: 2
		}]
	} : null;

	return (
		<div className="physics-card">
			<h3 className="physics-card-title">⚡ Energy Conservation Explorer</h3>
			<p className="physics-card-desc">Visualize kinetic, potential, and total energy</p>

			<div className="physics-input-grid physics-input-grid-4">
				<div className="physics-input-group">
					<label>Mass (kg)</label>
					<input type="number" min={0.1} step={0.1} value={mass}
						onChange={(e) => setMass(parseFloat(e.target.value) || 0)} className="physics-input" />
				</div>
				<div className="physics-input-group">
					<label>Velocity (m/s)</label>
					<input type="number" min={0} step={0.1} value={velocity}
						onChange={(e) => setVelocity(parseFloat(e.target.value) || 0)} className="physics-input" />
				</div>
				<div className="physics-input-group">
					<label>Height (m)</label>
					<input type="number" min={0} step={0.1} value={height}
						onChange={(e) => setHeight(parseFloat(e.target.value) || 0)} className="physics-input" />
				</div>
				<div className="physics-input-group">
					<label>Gravity (m/s²)</label>
					<input type="number" min={0.1} step={0.1} value={g}
						onChange={(e) => setG(parseFloat(e.target.value) || 0)} className="physics-input" />
				</div>
			</div>

			<ErrorDisplay errors={errors} />

			{result && errors.length === 0 && (
				<>
					<div className="physics-chart-container">
						<Bar
							data={chartData!}
							options={{
								responsive: true,
								maintainAspectRatio: false,
								plugins: {
									legend: { display: false },
									title: { display: true, text: `Total Energy: ${result.total.toFixed(2)} J` }
								},
								scales: {
									y: { beginAtZero: true, title: { display: true, text: 'Energy (J)' } }
								}
							}}
						/>
					</div>

					<div className="physics-metrics-grid">
						<div className="physics-metric physics-metric-blue">
							<div className="physics-metric-label">Kinetic Energy</div>
							<div className="physics-metric-value">{result.kinetic.toFixed(2)} J</div>
						</div>
						<div className="physics-metric physics-metric-green">
							<div className="physics-metric-label">Potential Energy</div>
							<div className="physics-metric-value">{result.potential.toFixed(2)} J</div>
						</div>
						<div className="physics-metric physics-metric-red">
							<div className="physics-metric-label">Total Energy</div>
							<div className="physics-metric-value">{result.total.toFixed(2)} J</div>
						</div>
					</div>

					<div className="physics-formula-note">
						KE = ½mv², PE = mgh, Total = KE + PE
					</div>

					<CopyButton
						textToCopy={`m=${mass}kg, v=${velocity}m/s, h=${height}m → KE=${result.kinetic.toFixed(2)}J, PE=${result.potential.toFixed(2)}J, Total=${result.total.toFixed(2)}J`}
						className="physics-copy-btn"
					>
						Copy Results
					</CopyButton>
				</>
			)}
		</div>
	);
}

export default EnergyExplorer;
