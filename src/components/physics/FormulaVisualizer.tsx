'use client';

import { useState, useEffect } from 'react';
import MathDisplay from '../MathDisplay';
import CopyButton from '../CopyButton';
import { ErrorDisplay } from './ErrorDisplay';
import type { PhysicsEquation } from '@/lib/physics/types';

interface FormulaVisualizerProps {
	equation: PhysicsEquation;
}

export function FormulaVisualizer({ equation }: FormulaVisualizerProps) {
	const [values, setValues] = useState<Record<string, number>>({});
	const [result, setResult] = useState<number | null>(null);
	const [errors, setErrors] = useState<any[]>([]);

	useEffect(() => {
		const initial: Record<string, number> = {};
		equation.variables.forEach(v => { initial[v.symbol] = v.default || 0; });
		setValues(initial);
	}, [equation]);

	useEffect(() => {
		try {
			const parts = equation.latex.split('=');
			const target = parts[0].trim().replace(/\\[a-zA-Z]+/g, '').replace(/[{}^_]/g, '');

			const solved = equation.solveFor(target, values);
			if (solved !== null && isFinite(solved)) {
				setResult(solved);
			} else {
				setResult(null);
			}

			const validation = equation.validate(values);
			setErrors(validation.isValid ? [] : validation.errors as any[]);
		} catch {
			setResult(null);
		}
	}, [values, equation]);

	const handleChange = (symbol: string, value: number) => {
		setValues(prev => ({ ...prev, [symbol]: value }));
	};

	return (
		<div className="physics-card">
			<div className="physics-formula-display">
				<MathDisplay math={equation.latex} />
			</div>

			<div className="physics-sliders">
				{equation.variables.map((v) => (
					<div key={v.symbol} className="physics-slider-group">
						<div className="physics-slider-header">
							<label className="physics-slider-label">
								<span className="physics-slider-symbol">{v.symbol}</span>
								<span className="physics-slider-name">{v.name}</span>
							</label>
							<span className="physics-slider-unit">{v.unit}</span>
						</div>
						<div className="physics-slider-row">
							<input
								type="range"
								min={v.min || 0}
								max={v.max || 100}
								step={0.1}
								value={values[v.symbol] ?? v.default ?? 0}
								onChange={(e) => handleChange(v.symbol, parseFloat(e.target.value))}
								className="physics-range"
							/>
							<input
								type="number"
								value={values[v.symbol] ?? v.default ?? 0}
								onChange={(e) => handleChange(v.symbol, parseFloat(e.target.value) || 0)}
								className="physics-number-input"
								step={0.1}
							/>
						</div>
					</div>
				))}
			</div>

			<ErrorDisplay errors={errors} />

			{result !== null && errors.length === 0 && (
				<div className="physics-result">
					<span className="physics-result-label">Result:</span>
					<span className="physics-result-value">{result.toFixed(4)}</span>
					<CopyButton textToCopy={result.toFixed(4)} className="physics-copy-btn" />
				</div>
			)}
		</div>
	);
}

export default FormulaVisualizer;
