'use client';

import { useState } from 'react';
import { ErrorDisplay } from './ErrorDisplay';
import CopyButton from '../CopyButton';
import { calculateCircuit } from '@/lib/physics/circuits';

interface Component {
	id: string;
	type: 'resistor' | 'battery';
	value: number;
	label: string;
}

export function CircuitBuilder() {
	const [components, setComponents] = useState<Component[]>([
		{ id: '1', type: 'resistor', value: 10, label: 'R1' },
		{ id: '2', type: 'resistor', value: 20, label: 'R2' },
	]);
	const [mode, setMode] = useState<'series' | 'parallel'>('series');
	const [batteryVoltage, setBatteryVoltage] = useState(12);
	const [errors, setErrors] = useState<any[]>([]);

	const resistances = components.map(c => c.value);
	const circuitResult = calculateCircuit(resistances, batteryVoltage, mode);
	const totalResistance = circuitResult.totalResistance;
	const totalCurrent = circuitResult.totalCurrent;
	const power = circuitResult.power;

	const handleAddResistor = () => {
		const id = String(Date.now());
		setComponents([...components, { id, type: 'resistor', value: 10, label: `R${components.length + 1}` }]);
	};

	const handleRemoveComponent = (id: string) => {
		if (components.length <= 2) {
			setErrors([{ field: 'general', message: 'Need at least 2 components', type: 'inconsistent' }]);
			return;
		}
		setComponents(components.filter(c => c.id !== id));
		setErrors([]);
	};

	return (
		<div className="physics-card">
			<h3 className="physics-card-title">🔌 Circuit Simulator</h3>
			<p className="physics-card-desc">Build series and parallel circuits, calculate total resistance, current, and power</p>

			<div className="physics-circuit-mode">
				<button onClick={() => setMode('series')} className={`physics-mode-btn ${mode === 'series' ? 'active' : ''}`}>Series</button>
				<button onClick={() => setMode('parallel')} className={`physics-mode-btn ${mode === 'parallel' ? 'active' : ''}`}>Parallel</button>
			</div>

			<div className="physics-circuit-components">
				{components.map((comp, index) => (
					<div key={comp.id} className="physics-circuit-component">
						<span className="physics-component-label">{comp.label}</span>
						<span className="physics-component-type">{comp.type}</span>
						<input type="number" min={1} value={comp.value}
							onChange={(e) => {
								const newComponents = [...components];
								newComponents[index].value = parseFloat(e.target.value) || 0;
								setComponents(newComponents);
								setErrors([]);
							}}
							className="physics-input physics-input-sm" />
						<span className="physics-unit">Ω</span>
						<button onClick={() => handleRemoveComponent(comp.id)} className="physics-component-remove">✕</button>
					</div>
				))}
			</div>

			<button onClick={handleAddResistor} className="physics-add-btn">+ Add Resistor</button>

			<div className="physics-input-group physics-circuit-battery">
				<label>Battery Voltage (V)</label>
				<input type="number" min={0.1} step={0.5} value={batteryVoltage}
					onChange={(e) => setBatteryVoltage(parseFloat(e.target.value) || 0)} className="physics-input" />
			</div>

			<ErrorDisplay errors={errors} />

			{errors.length === 0 && (
				<>
					<div className="physics-metrics-grid">
						<div className="physics-metric physics-metric-blue">
							<div className="physics-metric-label">Total Resistance</div>
							<div className="physics-metric-value">{totalResistance.toFixed(2)} Ω</div>
						</div>
						<div className="physics-metric physics-metric-green">
							<div className="physics-metric-label">Total Current</div>
							<div className="physics-metric-value">{totalCurrent.toFixed(3)} A</div>
						</div>
						<div className="physics-metric physics-metric-purple">
							<div className="physics-metric-label">Power</div>
							<div className="physics-metric-value">{power.toFixed(2)} W</div>
						</div>
					</div>

					<div className="physics-formula-note">
						{mode === 'series'
							? 'Series: R_total = R₁ + R₂ + R₃ + ...'
							: 'Parallel: 1/R_total = 1/R₁ + 1/R₂ + 1/R₃ + ...'
						} | V = IR | P = VI
					</div>

					<CopyButton
						textToCopy={`${mode}: ${components.map(c => `${c.label}=${c.value}Ω`).join(', ')}, V=${batteryVoltage}V → R=${totalResistance.toFixed(2)}Ω, I=${totalCurrent.toFixed(3)}A, P=${power.toFixed(2)}W`}
						className="physics-copy-btn"
					>
						Copy Results
					</CopyButton>
				</>
			)}
		</div>
	);
}

export default CircuitBuilder;
