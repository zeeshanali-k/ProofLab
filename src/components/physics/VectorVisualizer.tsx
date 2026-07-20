'use client';

import { useState, useEffect, useRef } from 'react';
import { createVector, addVectors } from '@/lib/physics/vectors';
import { ErrorDisplay } from './ErrorDisplay';
import CopyButton from '../CopyButton';

interface VectorInput {
	x: number;
	y: number;
	label: string;
	color: string;
}

export function VectorVisualizer() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [vectors, setVectors] = useState<VectorInput[]>([
		{ x: 3, y: 4, label: 'v₁', color: '#2563eb' },
		{ x: 2, y: -1, label: 'v₂', color: '#16a34a' }
	]);
	const [resultant, setResultant] = useState<any>(null);
	const [errors, setErrors] = useState<any[]>([]);

	useEffect(() => {
		try {
			const vObjects = vectors.map(v => createVector(v.x, v.y));
			const sum = addVectors(vObjects);
			setResultant(sum);
			setErrors([]);
		} catch (err: any) {
			setErrors([{ field: 'general', message: err.message, type: 'syntax' }]);
			setResultant(null);
		}
	}, [vectors]);

	useEffect(() => {
		if (!canvasRef.current) return;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const w = canvas.width;
		const h = canvas.height;
		const cx = w / 2;
		const cy = h / 2;
		const scale = 35;

		ctx.clearRect(0, 0, w, h);

		// Grid
		ctx.strokeStyle = '#e5e7eb';
		ctx.lineWidth = 0.5;
		for (let i = -10; i <= 10; i++) {
			const x = cx + i * scale;
			const y = cy - i * scale;
			ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
			ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
		}

		// Axes
		ctx.strokeStyle = '#94a3b8';
		ctx.lineWidth = 1.5;
		ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(w, cy); ctx.stroke();
		ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, h); ctx.stroke();

		// Vectors (head-to-tail)
		let curX = cx;
		let curY = cy;

		vectors.forEach((v) => {
			const endX = curX + v.x * scale;
			const endY = curY - v.y * scale;

			ctx.strokeStyle = v.color;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(curX, curY);
			ctx.lineTo(endX, endY);
			ctx.stroke();

			// Arrowhead
			const angle = Math.atan2(-(endY - curY), endX - curX);
			const headLen = 10;
			ctx.fillStyle = v.color;
			ctx.beginPath();
			ctx.moveTo(endX, endY);
			ctx.lineTo(endX - headLen * Math.cos(angle - 0.5), endY + headLen * Math.sin(angle - 0.5));
			ctx.lineTo(endX - headLen * Math.cos(angle + 0.5), endY + headLen * Math.sin(angle + 0.5));
			ctx.closePath();
			ctx.fill();

			ctx.fillStyle = '#333';
			ctx.font = '13px sans-serif';
			ctx.fillText(v.label, (curX + endX) / 2 - 10, (curY + endY) / 2 - 10);

			curX = endX;
			curY = endY;
		});

		// Resultant (dashed, from origin)
		if (vectors.length > 1) {
			ctx.strokeStyle = '#dc2626';
			ctx.lineWidth = 2;
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			ctx.lineTo(curX, curY);
			ctx.stroke();
			ctx.setLineDash([]);

			ctx.fillStyle = '#dc2626';
			ctx.font = 'bold 13px sans-serif';
			ctx.fillText('R', (cx + curX) / 2 - 10, (cy + curY) / 2 - 15);
		}
	}, [vectors, resultant]);

	const handleChange = (index: number, field: 'x' | 'y', value: number) => {
		const newVectors = [...vectors];
		newVectors[index] = { ...newVectors[index], [field]: value };
		setVectors(newVectors);
	};

	const addVec = () => {
		const colors = ['#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];
		setVectors([...vectors, { x: 0, y: 0, label: `v${vectors.length + 1}`, color: colors[vectors.length % colors.length] }]);
	};

	const removeVec = (index: number) => {
		if (vectors.length <= 2) return;
		setVectors(vectors.filter((_, i) => i !== index));
	};

	return (
		<div className="physics-card">
			<h3 className="physics-card-title">Vector Addition Visualizer</h3>
			<p className="physics-card-desc">Add vectors graphically using head-to-tail method</p>

			<div className="physics-vector-layout">
				<div className="physics-vector-canvas-wrap">
					<canvas ref={canvasRef} width={400} height={400} className="physics-canvas" />
				</div>

				<div className="physics-vector-controls">
					{vectors.map((v, i) => (
						<div key={i} className="physics-vector-item">
							<div className="physics-vector-item-header">
								<span className="physics-vector-label" style={{ color: v.color }}>{v.label}</span>
								{vectors.length > 2 && (
									<button onClick={() => removeVec(i)} className="physics-vector-remove">✕</button>
								)}
							</div>
							<div className="physics-vector-inputs">
								<div className="physics-vector-field">
									<label>x</label>
									<input type="number" value={v.x}
										onChange={(e) => handleChange(i, 'x', parseFloat(e.target.value) || 0)}
										className="physics-input" step={0.5} />
								</div>
								<div className="physics-vector-field">
									<label>y</label>
									<input type="number" value={v.y}
										onChange={(e) => handleChange(i, 'y', parseFloat(e.target.value) || 0)}
										className="physics-input" step={0.5} />
								</div>
							</div>
						</div>
					))}

					<button onClick={addVec} className="physics-add-btn">+ Add Vector</button>

					<ErrorDisplay errors={errors} />

					{resultant && errors.length === 0 && (
						<div className="physics-result physics-result-red">
							<div className="physics-result-label">Resultant</div>
							<div className="physics-result-grid">
								<div><span className="physics-result-key">Magnitude:</span> <span className="physics-result-val">{resultant.magnitude.toFixed(2)}</span></div>
								<div><span className="physics-result-key">Angle:</span> <span className="physics-result-val">{resultant.angle.toFixed(1)}°</span></div>
								<div className="physics-result-full"><span className="physics-result-key">Components:</span> <span className="physics-result-val">({resultant.x.toFixed(2)}, {resultant.y.toFixed(2)})</span></div>
							</div>
							<CopyButton
								textToCopy={`R = (${resultant.x.toFixed(2)}, ${resultant.y.toFixed(2)}), |R| = ${resultant.magnitude.toFixed(2)}, θ = ${resultant.angle.toFixed(1)}°`}
								className="physics-copy-btn"
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default VectorVisualizer;
