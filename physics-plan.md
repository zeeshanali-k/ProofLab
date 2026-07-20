You're welcome! Here's the complete, revised implementation plan incorporating your changes:

· SHM & Circuits → Marked as optional (Phase 5)
· Vector Visualizer → Added as required (simple implementation)
· All other features → Required

This plan is fully self-contained for an AI agent to follow step-by-step.

---

PHYSICS MODULE – COMPLETE IMPLEMENTATION PLAN (Revised)

Project Context & Non-Negotiables

· Stack: Next.js (App Router) + TypeScript + Bun (package manager)
· No Git: Follow steps sequentially; mark each step [x] once done
· Agent Instructions: Do not touch git. Use bun for all package management. Follow the plan exactly. If a library fails to install, skip that specific feature and continue.

---

PHASE 0: Library Research & Selection

Goal: Identify the best libraries for physics simulations in Next.js/React with minimal friction.

Selected Libraries

Library Purpose Rationale
mathjs Equation parsing, symbolic algebra, unit conversion 444+ functions, symbolic CAS engine, units support
matter.js 2D rigid body physics (pendulum, projectiles) Well-established, works with Next.js
chart.js Real-time graphing Industry standard, React wrapper available
react-chartjs-2 Chart.js React wrapper Official wrapper, seamless integration
konva.js Vector visualization (drag-and-drop) Lightweight canvas library, React wrapper available
react-konva Konva.js React wrapper Declarative canvas components

Installation Command (All at Once)

```bash
bun add mathjs matter-js chart.js react-chartjs-2 konva react-konva
bun add -d @types/matter-js
```

Fallback: If any library causes issues, document the error, skip that feature, and continue.

---

PHASE 1: Project Setup & Structure

Goal: Create the module structure and install dependencies.

Step 1.1: Create Module Structure

```
src/
├── app/
│   └── physics/
│       ├── page.tsx                    # Main physics dashboard
│       ├── kinematics/
│       │   └── page.tsx                # 1D Kinematics with graphs
│       ├── projectile/
│       │   └── page.tsx                # Projectile motion simulator
│       ├── energy/
│       │   └── page.tsx                # Energy conservation explorer
│       ├── vectors/
│       │   └── page.tsx                # Vector addition visualizer
│       ├── shm/                        # OPTIONAL
│       │   └── page.tsx                # SHM visualizer
│       └── circuits/                   # OPTIONAL
│           └── page.tsx                # Basic circuit simulator
├── components/
│   └── physics/
│       ├── FormulaVisualizer.tsx       # Interactive formula with sliders
│       ├── KinematicsSimulator.tsx     # 1D motion with graphs
│       ├── ProjectileSimulator.tsx     # 2D projectile with trajectory
│       ├── EnergyExplorer.tsx          # KE/PE bars
│       ├── VectorVisualizer.tsx        # Drag-and-drop vector addition (simple)
│       ├── SHMVisualizer.tsx           # OPTIONAL - Mass-spring
│       ├── CircuitBuilder.tsx          # OPTIONAL - Series/parallel circuits
│       └── ErrorDisplay.tsx            # Live error highlighting component
└── lib/
└── physics/
├── equations.ts                # Physics equation definitions
├── validator.ts                # Live error checking logic
├── kinematics.ts               # Kinematics calculations
├── energy.ts                   # Energy calculations
├── vectors.ts                  # Vector operations
├── circuits.ts                 # OPTIONAL - Circuit calculations
└── types.ts                    # TypeScript interfaces
```

Step 1.2: Install Dependencies

```bash
bun add mathjs matter-js chart.js react-chartjs-2 konva react-konva
bun add -d @types/matter-js
```

Step 1.3: Verify Installation

```bash
bun run build  # Should complete without errors
```

---

PHASE 2: Core Physics Engine

Goal: Build the backend logic for equations, calculations, and validation.

Step 2.1: Define TypeScript Types (lib/physics/types.ts)

```typescript
export interface PhysicsEquation {
	id: string;
	name: string;
	latex: string;
	variables: Variable[];
	solveFor: (target: string, known: Record<string, number>) => number | null;
	validate: (inputs: Record<string, number>) => ValidationResult;
}

export interface Variable {
	symbol: string;
	name: string;
	unit: string;
	min?: number;
	max?: number;
	default?: number;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}

export interface ValidationError {
	field: string;
	message: string;
	type: 'missing' | 'out_of_range' | 'unit_mismatch' | 'inconsistent' | 'syntax';
}

export interface KinematicsResult {
	displacement: number;
	finalVelocity: number;
	acceleration: number;
	time: number;
	graphs: {
		position: { t: number[]; values: number[] };
		velocity: { t: number[]; values: number[] };
		acceleration: { t: number[]; values: number[] };
	};
}

export interface EnergyResult {
	kinetic: number;
	potential: number;
	total: number;
}

export interface Vector2D {
	x: number;
	y: number;
	magnitude: number;
	angle: number;
}

export interface VectorResult {
	vectors: Vector2D[];
	resultant: Vector2D;
	components: { x: number[]; y: number[] };
}

export interface CircuitResult {   // OPTIONAL
	totalResistance: number;
	totalCurrent: number;
	voltageDrops: { component: string; voltage: number }[];
	power: number;
}
```

Step 2.2: Implement Equation Definitions (lib/physics/equations.ts)

```typescript
import { evaluate, parse, derivative } from 'mathjs';
import { PhysicsEquation, ValidationResult } from './types';

export const PHYSICS_EQUATIONS: PhysicsEquation[] = [
	{
		id: 'newton_second',
		name: "Newton's Second Law",
		latex: 'F = ma',
		variables: [
			{ symbol: 'F', name: 'Force', unit: 'N', min: 0, max: 100, default: 10 },
			{ symbol: 'm', name: 'Mass', unit: 'kg', min: 0.1, max: 50, default: 2 },
			{ symbol: 'a', name: 'Acceleration', unit: 'm/s²', min: 0, max: 20, default: 5 },
		],
		solveFor: (target, known) => {
			// Solve F = ma for target variable
			if (target === 'F') return known.m * known.a;
			if (target === 'm') return known.F / known.a;
			if (target === 'a') return known.F / known.m;
			return null;
		},
		validate: (inputs) => {
			const errors = [];
			if (inputs.m <= 0) errors.push({ field: 'm', message: 'Mass must be positive', type: 'out_of_range' });
			return { isValid: errors.length === 0, errors };
		}
	},
{
	id: 'kinematics_v',
	name: 'Velocity Equation',
	latex: 'v = u + at',
	variables: [
		{ symbol: 'v', name: 'Final Velocity', unit: 'm/s', default: 20 },
		{ symbol: 'u', name: 'Initial Velocity', unit: 'm/s', default: 5 },
		{ symbol: 'a', name: 'Acceleration', unit: 'm/s²', default: 2 },
		{ symbol: 't', name: 'Time', unit: 's', min: 0, default: 5 },
	],
	solveFor: (target, known) => {
		if (target === 'v') return known.u + known.a * known.t;
		if (target === 'u') return known.v - known.a * known.t;
		if (target === 'a') return (known.v - known.u) / known.t;
		if (target === 't') return (known.v - known.u) / known.a;
		return null;
	},
	validate: (inputs) => {
		const errors = [];
		if (inputs.t < 0) errors.push({ field: 't', message: 'Time cannot be negative', type: 'out_of_range' });
		if (inputs.t === 0 && inputs.u !== inputs.v) {
			errors.push({ field: 't', message: 'At t=0, u must equal v', type: 'inconsistent' });
		}
		return { isValid: errors.length === 0, errors };
	}
},
{
	id: 'kinematics_s',
	name: 'Displacement Equation',
	latex: 's = ut + \\frac{1}{2}at^2',
	variables: [
		{ symbol: 's', name: 'Displacement', unit: 'm', default: 50 },
		{ symbol: 'u', name: 'Initial Velocity', unit: 'm/s', default: 0 },
		{ symbol: 'a', name: 'Acceleration', unit: 'm/s²', default: 2 },
		{ symbol: 't', name: 'Time', unit: 's', min: 0, default: 5 },
	],
	solveFor: (target, known) => {
		if (target === 's') return known.u * known.t + 0.5 * known.a * known.t * known.t;
		// Other solves require quadratic formula - simplified
		return null;
	},
	validate: (inputs) => {
		const errors = [];
		if (inputs.t < 0) errors.push({ field: 't', message: 'Time cannot be negative', type: 'out_of_range' });
		return { isValid: errors.length === 0, errors };
	}
},
{
	id: 'energy_ke',
	name: 'Kinetic Energy',
	latex: 'KE = \\frac{1}{2}mv^2',
	variables: [
		{ symbol: 'KE', name: 'Kinetic Energy', unit: 'J', default: 100 },
		{ symbol: 'm', name: 'Mass', unit: 'kg', min: 0.1, default: 2 },
		{ symbol: 'v', name: 'Velocity', unit: 'm/s', min: 0, default: 10 },
	],
	solveFor: (target, known) => {
		if (target === 'KE') return 0.5 * known.m * known.v * known.v;
		if (target === 'm') return (2 * known.KE) / (known.v * known.v);
		if (target === 'v') return Math.sqrt((2 * known.KE) / known.m);
		return null;
	},
	validate: (inputs) => {
		const errors = [];
		if (inputs.m <= 0) errors.push({ field: 'm', message: 'Mass must be positive', type: 'out_of_range' });
		if (inputs.v < 0) errors.push({ field: 'v', message: 'Velocity cannot be negative', type: 'out_of_range' });
		return { isValid: errors.length === 0, errors };
	}
},
{
	id: 'energy_pe',
	name: 'Potential Energy',
	latex: 'PE = mgh',
	variables: [
		{ symbol: 'PE', name: 'Potential Energy', unit: 'J', default: 100 },
		{ symbol: 'm', name: 'Mass', unit: 'kg', min: 0.1, default: 2 },
		{ symbol: 'g', name: 'Gravity', unit: 'm/s²', default: 9.81 },
		{ symbol: 'h', name: 'Height', unit: 'm', min: 0, default: 5 },
	],
	solveFor: (target, known) => {
		if (target === 'PE') return known.m * known.g * known.h;
		if (target === 'm') return known.PE / (known.g * known.h);
		if (target === 'h') return known.PE / (known.m * known.g);
		return null;
	},
	validate: (inputs) => {
		const errors = [];
		if (inputs.m <= 0) errors.push({ field: 'm', message: 'Mass must be positive', type: 'out_of_range' });
		if (inputs.h < 0) errors.push({ field: 'h', message: 'Height cannot be negative', type: 'out_of_range' });
		return { isValid: errors.length === 0, errors };
	}
},
{
	id: 'gravity',
	name: "Newton's Law of Gravitation",
	latex: 'F = G\\frac{m_1m_2}{r^2}',
	variables: [
		{ symbol: 'F', name: 'Force', unit: 'N', default: 10 },
		{ symbol: 'm1', name: 'Mass 1', unit: 'kg', min: 0.1, default: 100 },
		{ symbol: 'm2', name: 'Mass 2', unit: 'kg', min: 0.1, default: 100 },
		{ symbol: 'r', name: 'Distance', unit: 'm', min: 0.1, default: 5 },
	],
	solveFor: (target, known) => {
		const G = 6.67430e-11;
		if (target === 'F') return G * known.m1 * known.m2 / (known.r * known.r);
		return null;
	},
	validate: (inputs) => {
		const errors = [];
		if (inputs.r <= 0) errors.push({ field: 'r', message: 'Distance must be positive', type: 'out_of_range' });
		return { isValid: errors.length === 0, errors };
	}
}
];
```

Step 2.3: Implement Validator (lib/physics/validator.ts)

```typescript
import { evaluate, unit } from 'mathjs';

export interface ValidationError {
	field: string;
	message: string;
	type: 'missing' | 'out_of_range' | 'unit_mismatch' | 'inconsistent' | 'syntax';
}

export function validateEquation(
	equation: string,
	inputs: Record<string, number>
): ValidationError[] {
	const errors: ValidationError[] = [];
	
	// 1. Check for missing variables
	const variablePattern = /[a-zA-Z]+/g;
	const variables = equation.match(variablePattern) || [];
	const constants = ['pi', 'e', 'sin', 'cos', 'tan', 'log', 'sqrt', 'abs'];
	
	for (const v of variables) {
		if (!(v in inputs) && !constants.includes(v) && !isMathFunction(v)) {
			errors.push({
				field: v,
				message: `Missing value for "${v}"`,
				type: 'missing'
			});
		}
	}
	
	// 2. Check for division by zero
	if (equation.includes('/') && inputs) {
		// Simple check - look for denominators
		const parts = equation.split('/');
		if (parts.length > 1) {
			const denom = parts[1].trim();
			const denomVars = denom.match(/[a-zA-Z]+/g) || [];
			for (const v of denomVars) {
				if (v in inputs && Math.abs(inputs[v]) < 1e-10) {
					errors.push({
						field: v,
						message: `Division by zero - "${v}" is near zero`,
						type: 'out_of_range'
					});
				}
			}
		}
	}
	
	return errors;
}

// Live validation (for code-intelligence-style underlining)
export function getLiveValidation(
	input: string,
	cursorPosition: number
): ValidationError | null {
	// Parse the input at cursor position
	// Highlight the specific token that's wrong
	// Return the error with the exact location
	
	// Simple implementation: check for common mistakes
	const before = input.slice(0, cursorPosition);
	const after = input.slice(cursorPosition);
	
	// Check for incomplete variable references
	const varMatch = before.match(/([a-zA-Z]+)$/);
	if (varMatch) {
		const v = varMatch[1];
		if (!['sin', 'cos', 'tan', 'log', 'sqrt', 'abs'].includes(v)) {
			return {
				field: v,
				message: `Unknown variable "${v}"`,
				type: 'syntax'
			};
		}
	}
	
	return null;
}

function isMathFunction(name: string): boolean {
	return ['sin', 'cos', 'tan', 'log', 'sqrt', 'abs', 'exp', 'ln'].includes(name);
}
```

Step 2.4: Implement Kinematics Solver (lib/physics/kinematics.ts)

```typescript
import { KinematicsResult } from './types';

export function solveKinematics(params: {
	u?: number;   // initial velocity
	v?: number;   // final velocity
	a?: number;   // acceleration
	s?: number;   // displacement
	t?: number;   // time
}): KinematicsResult {
	const { u = 0, a = 0, t = 0 } = params;
	
	// Calculate using standard equations
	// v = u + at
	// s = ut + ½at²
	// v² = u² + 2as
	
	const finalVelocity = u + a * t;
	const displacement = u * t + 0.5 * a * t * t;
	
	// Generate graph data
	const points = 50;
	const tData = Array.from({ length: points }, (_, i) => (i / points) * t);
	const posData = tData.map(ti => u * ti + 0.5 * a * ti * ti);
	const velData = tData.map(ti => u + a * ti);
	const accData = tData.map(() => a);
	
	return {
		displacement,
		finalVelocity,
		acceleration: a,
		time: t,
		graphs: {
			position: { t: tData, values: posData },
			velocity: { t: tData, values: velData },
			acceleration: { t: tData, values: accData }
		}
	};
}
```

Step 2.5: Implement Energy Calculator (lib/physics/energy.ts)

```typescript
import { EnergyResult } from './types';

export function calculateEnergy(
	mass: number,
	velocity: number,
	height: number,
	g: number = 9.81
): EnergyResult {
	const kinetic = 0.5 * mass * velocity * velocity;
	const potential = mass * g * height;
	
	return {
		kinetic,
		potential,
		total: kinetic + potential
	};
}
```

Step 2.6: Implement Vector Operations (lib/physics/vectors.ts)

```typescript
import { Vector2D, VectorResult } from './types';

export function createVector(x: number, y: number): Vector2D {
	const magnitude = Math.sqrt(x * x + y * y);
	const angle = Math.atan2(y, x) * 180 / Math.PI;
	return { x, y, magnitude, angle };
}

export function addVectors(vectors: Vector2D[]): Vector2D {
	const sumX = vectors.reduce((sum, v) => sum + v.x, 0);
	const sumY = vectors.reduce((sum, v) => sum + v.y, 0);
	return createVector(sumX, sumY);
}

export function subtractVectors(v1: Vector2D, v2: Vector2D): Vector2D {
	return createVector(v1.x - v2.x, v1.y - v2.y);
}

export function scaleVector(v: Vector2D, scalar: number): Vector2D {
	return createVector(v.x * scalar, v.y * scalar);
}

export function dotProduct(v1: Vector2D, v2: Vector2D): number {
	return v1.x * v2.x + v1.y * v2.y;
}

export function getComponents(v: Vector2D): { x: number; y: number } {
	return { x: v.x, y: v.y };
}
```

---

PHASE 3: UI Components

Goal: Build the interactive React components.

Step 3.1: Formula Visualizer (components/physics/FormulaVisualizer.tsx)

```tsx
'use client';

	import { useState, useEffect } from 'react';
	import { evaluate } from 'mathjs';
	import { InlineMath } from 'react-katex';
	import 'katex/dist/katex.min.css';
	import { PhysicsEquation } from '@/lib/physics/types';
	import { ErrorDisplay } from './ErrorDisplay';
	
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
				// Get the target variable (left side of equation)
				const parts = equation.latex.split('=');
				const target = parts[0].trim();
				
				// Solve using the equation's solveFor method
				const solved = equation.solveFor(target, values);
				if (solved !== null) {
					setResult(solved);
					setErrors([]);
				}
				
				// Validate inputs
				const validation = equation.validate(values);
				if (!validation.isValid) {
					setErrors(validation.errors);
				}
			} catch (err) {
				setErrors([{ field: 'general', message: err.message, type: 'syntax' }]);
				setResult(null);
			}
		}, [values, equation]);
		
		const handleSliderChange = (symbol: string, value: number) => {
			setValues(prev => ({ ...prev, [symbol]: value }));
		};
		
		const handleInputChange = (symbol: string, value: number) => {
			setValues(prev => ({ ...prev, [symbol]: value }));
		};
		
		return (
			<div className="p-6 bg-white rounded-xl shadow-md border">
			<div className="text-2xl text-center font-mono mb-6">
			<InlineMath math={equation.latex} />
			</div>
			
			<div className="space-y-4">
			{equation.variables.map((v) => (
				<div key={v.symbol} className="space-y-1">
				<div className="flex justify-between">
				<label className="font-semibold text-sm">
				{v.symbol} ({v.name})
				</label>
				<span className="font-mono text-sm text-gray-500">{v.unit}</span>
				</div>
				<div className="flex items-center gap-4">
				<input
				type="range"
				min={v.min || 0}
				max={v.max || 100}
				step={0.1}
				value={values[v.symbol] || v.default || 0}
				onChange={(e) => handleSliderChange(v.symbol, parseFloat(e.target.value))}
				className="flex-1"
				/>
				<input
				type="number"
				value={values[v.symbol] || v.default || 0}
				onChange={(e) => handleInputChange(v.symbol, parseFloat(e.target.value) || 0)}
				className="w-24 p-1 border rounded font-mono text-right"
				step={0.1}
				/>
				</div>
				</div>
			))}
			</div>
			
			<ErrorDisplay errors={errors} />
			
			{result !== null && errors.length === 0 && (
				<div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
				<span className="font-semibold">Result:</span>
				<span className="ml-2 font-mono text-lg">{result.toFixed(4)}</span>
				</div>
			)}
			</div>
		);
	}
	```
	
	Step 3.2: Kinematics Simulator (components/physics/KinematicsSimulator.tsx)
	
	```tsx
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
	
	ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
	
	export function KinematicsSimulator() {
		const [u, setU] = useState(0);
		const [a, setA] = useState(2);
		const [t, setT] = useState(5);
		const [result, setResult] = useState<any>(null);
		const [errors, setErrors] = useState<any[]>([]);
		
		useEffect(() => {
			try {
				const solved = solveKinematics({ u, a, t });
				setResult(solved);
				setErrors([]);
			} catch (err) {
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
				},
				{
					label: 'Velocity (m/s)',
					data: result.graphs.velocity.values,
					borderColor: 'rgb(34, 197, 94)',
					backgroundColor: 'rgba(34, 197, 94, 0.1)',
					tension: 0.4,
				},
				{
					label: 'Acceleration (m/s²)',
					data: result.graphs.acceleration.values,
					borderColor: 'rgb(239, 68, 68)',
					backgroundColor: 'rgba(239, 68, 68, 0.1)',
					tension: 0.4,
				}
			]
		} : null;
		
		return (
			<div className="p-6 bg-white rounded-xl shadow-md border">
			<h3 className="text-lg font-semibold mb-4">1D Kinematics</h3>
			
			<div className="grid grid-cols-3 gap-4 mb-4">
			<div>
			<label className="block text-sm font-medium">Initial Velocity (u)</label>
			<input
			type="number"
			value={u}
			onChange={(e) => setU(parseFloat(e.target.value) || 0)}
			className="w-full p-2 border rounded-lg font-mono"
			/>
			<span className="text-xs text-gray-500">m/s</span>
			</div>
			<div>
			<label className="block text-sm font-medium">Acceleration (a)</label>
			<input
			type="number"
			value={a}
			onChange={(e) => setA(parseFloat(e.target.value) || 0)}
			className="w-full p-2 border rounded-lg font-mono"
			/>
			<span className="text-xs text-gray-500">m/s²</span>
			</div>
			<div>
			<label className="block text-sm font-medium">Time (t)</label>
			<input
			type="number"
			min={0}
			step={0.5}
			value={t}
			onChange={(e) => setT(parseFloat(e.target.value) || 0)}
			className="w-full p-2 border rounded-lg font-mono"
			/>
			<span className="text-xs text-gray-500">s</span>
			</div>
			</div>
			
			<ErrorDisplay errors={errors} />
			
			{result && errors.length === 0 && (
				<>
				<div className="h-64">
				<Line 
				data={chartData!}
				options={{
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: { position: 'top' as const },
						title: { display: false }
					},
					scales: {
						x: { title: { display: true, text: 'Time (s)' } },
											   y: { title: { display: true, text: 'Value' } }
					}
				}}
				/>
				</div>
				
				<div className="mt-4 grid grid-cols-3 gap-4 text-center">
				<div className="p-2 bg-blue-50 rounded">
				<div className="text-sm text-gray-500">Displacement</div>
				<div className="font-mono text-lg">{result.displacement.toFixed(2)} m</div>
				</div>
				<div className="p-2 bg-green-50 rounded">
				<div className="text-sm text-gray-500">Final Velocity</div>
				<div className="font-mono text-lg">{result.finalVelocity.toFixed(2)} m/s</div>
				</div>
				<div className="p-2 bg-red-50 rounded">
				<div className="text-sm text-gray-500">Acceleration</div>
				<div className="font-mono text-lg">{result.acceleration.toFixed(2)} m/s²</div>
				</div>
				</div>
				</>
			)}
			</div>
		);
	}
	```
	
	Step 3.3: Projectile Simulator (components/physics/ProjectileSimulator.tsx)
	
	```tsx
	'use client';
	
	import { useState, useEffect, useRef } from 'react';
	import { ErrorDisplay } from './ErrorDisplay';
	
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
				
				// Calculate time of flight (solve for when y = 0)
				const discriminant = v0y * v0y + 2 * g * h;
				if (discriminant < 0) {
					setErrors([{ field: 'general', message: 'Invalid parameters - projectile never lands', type: 'inconsistent' }]);
					return;
				}
				
				const tFlight = (v0y + Math.sqrt(discriminant)) / g;
				const range = v0x * tFlight;
				const maxHeight = h + (v0y * v0y) / (2 * g);
				
				setMetrics({ range, maxHeight, timeOfFlight: tFlight });
				setErrors([]);
				
				// Generate trajectory points
				const points = 100;
				const trajectoryPoints = [];
				for (let i = 0; i <= points; i++) {
					const t = (i / points) * tFlight;
					const x = v0x * t;
					const y = h + v0y * t - 0.5 * g * t * t;
					if (y >= 0) trajectoryPoints.push({ x, y });
				}
				setTrajectory(trajectoryPoints);
			} catch (err) {
				setErrors([{ field: 'general', message: err.message, type: 'syntax' }]);
			}
		}, [params]);
		
		useEffect(() => {
			if (!canvasRef.current || trajectory.length === 0) return;
			
			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;
			
			const width = canvas.width;
			const height_canvas = canvas.height;
			const maxX = Math.max(metrics.range * 1.1, 10);
			const maxY = Math.max(metrics.maxHeight * 1.2, 10);
			
			ctx.clearRect(0, 0, width, height_canvas);
			
			// Draw axes
			ctx.strokeStyle = '#333';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(30, height_canvas - 30);
		ctx.lineTo(width - 20, height_canvas - 30);
		ctx.stroke();
		
		// Draw trajectory
		ctx.strokeStyle = '#2563eb';
		ctx.lineWidth = 3;
		ctx.beginPath();
		trajectory.forEach((p, i) => {
			const x = 30 + (p.x / maxX) * (width - 60);
			const y = (height_canvas - 30) - (p.y / maxY) * (height_canvas - 60);
			if (i === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		});
			ctx.stroke();
			
			// Draw ground line
			const groundY = height_canvas - 30;
			ctx.strokeStyle = '#666';
		ctx.lineWidth = 2;
		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.moveTo(30, groundY);
		ctx.lineTo(width - 20, groundY);
		ctx.stroke();
		ctx.setLineDash([]);
		
		}, [trajectory, metrics]);
		
		return (
			<div className="p-6 bg-white rounded-xl shadow-md border">
			<h3 className="text-lg font-semibold mb-4">Projectile Motion</h3>
			
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
			<div>
			<label className="block text-sm font-medium">Velocity</label>
			<input
			type="range"
			min={5}
			max={50}
			value={params.v0}
			onChange={(e) => setParams(p => ({ ...p, v0: parseFloat(e.target.value) }))}
			className="w-full"
			/>
			<span className="text-sm font-mono">{params.v0} m/s</span>
			</div>
			<div>
			<label className="block text-sm font-medium">Angle</label>
			<input
			type="range"
			min={5}
			max={85}
			value={params.theta}
			onChange={(e) => setParams(p => ({ ...p, theta: parseFloat(e.target.value) }))}
			className="w-full"
			/>
			<span className="text-sm font-mono">{params.theta}°</span>
			</div>
			<div>
			<label className="block text-sm font-medium">Height</label>
			<input
			type="range"
			min={0}
			max={20}
			value={params.h}
			onChange={(e) => setParams(p => ({ ...p, h: parseFloat(e.target.value) }))}
			className="w-full"
			/>
			<span className="text-sm font-mono">{params.h} m</span>
			</div>
			<div>
			<label className="block text-sm font-medium">Gravity</label>
			<input
			type="range"
			min={1}
			max={20}
			step={0.5}
			value={params.g}
			onChange={(e) => setParams(p => ({ ...p, g: parseFloat(e.target.value) }))}
			className="w-full"
			/>
			<span className="text-sm font-mono">{params.g} m/s²</span>
			</div>
			</div>
			
			<canvas
			ref={canvasRef}
			width={600}
			height={400}
			className="w-full border rounded-lg bg-gray-50"
			/>
			
			<ErrorDisplay errors={errors} />
			
			{metrics.range > 0 && errors.length === 0 && (
				<div className="mt-4 grid grid-cols-3 gap-4 text-center">
				<div className="p-2 bg-blue-50 rounded">
				<div className="text-sm text-gray-500">Range</div>
				<div className="font-mono text-lg">{metrics.range.toFixed(2)} m</div>
				</div>
				<div className="p-2 bg-green-50 rounded">
				<div className="text-sm text-gray-500">Max Height</div>
				<div className="font-mono text-lg">{metrics.maxHeight.toFixed(2)} m</div>
				</div>
				<div className="p-2 bg-purple-50 rounded">
				<div className="text-sm text-gray-500">Time of Flight</div>
				<div className="font-mono text-lg">{metrics.timeOfFlight.toFixed(2)} s</div>
				</div>
				</div>
			)}
			</div>
		);
	}
	```
	
	Step 3.4: Energy Explorer (components/physics/EnergyExplorer.tsx)
	
	```tsx
	'use client';
	
	import { useState, useEffect } from 'react';
	import { Bar } from 'react-chartjs-2';
	import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
	import { calculateEnergy } from '@/lib/physics/energy';
	import { ErrorDisplay } from './ErrorDisplay';
	
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
				const calculated = calculateEnergy(mass, velocity, height, g);
				setResult(calculated);
				setErrors([]);
			} catch (err) {
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
			<div className="p-6 bg-white rounded-xl shadow-md border">
			<h3 className="text-lg font-semibold mb-4">⚡ Energy Conservation</h3>
			
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
			<div>
			<label className="block text-sm font-medium">Mass (kg)</label>
			<input
			type="number"
			min={0.1}
			step={0.1}
			value={mass}
			onChange={(e) => setMass(parseFloat(e.target.value) || 0)}
			className="w-full p-2 border rounded-lg"
			/>
			</div>
			<div>
			<label className="block text-sm font-medium">Velocity (m/s)</label>
			<input
			type="number"
			min={0}
			step={0.1}
			value={velocity}
			onChange={(e) => setVelocity(parseFloat(e.target.value) || 0)}
			className="w-full p-2 border rounded-lg"
			/>
			</div>
			<div>
			<label className="block text-sm font-medium">Height (m)</label>
			<input
			type="number"
			min={0}
			step={0.1}
			value={height}
			onChange={(e) => setHeight(parseFloat(e.target.value) || 0)}
			className="w-full p-2 border rounded-lg"
			/>
			</div>
			<div>
			<label className="block text-sm font-medium">Gravity (m/s²)</label>
			<input
			type="number"
			min={0.1}
			step={0.1}
			value={g}
			onChange={(e) => setG(parseFloat(e.target.value) || 0)}
			className="w-full p-2 border rounded-lg"
			/>
			</div>
			</div>
			
			<ErrorDisplay errors={errors} />
			
			{result && errors.length === 0 && (
				<>
				<div className="h-64">
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
				
				<div className="mt-4 grid grid-cols-3 gap-4 text-center">
				<div className="p-2 bg-blue-50 rounded">
				<div className="text-sm text-gray-500">Kinetic Energy</div>
				<div className="font-mono text-lg">{result.kinetic.toFixed(2)} J</div>
				</div>
				<div className="p-2 bg-green-50 rounded">
				<div className="text-sm text-gray-500">Potential Energy</div>
				<div className="font-mono text-lg">{result.potential.toFixed(2)} J</div>
				</div>
				<div className="p-2 bg-red-50 rounded">
				<div className="text-sm text-gray-500">Total Energy</div>
				<div className="font-mono text-lg">{result.total.toFixed(2)} J</div>
				</div>
				</div>
				
				<div className="mt-2 text-sm text-gray-500">
				<span className="font-semibold">Formula:</span> 
				{' '}KE = ½mv², PE = mgh, Total = KE + PE
				</div>
				</>
			)}
			</div>
		);
	}
	```
	
	Step 3.5: Vector Visualizer (components/physics/VectorVisualizer.tsx)
	
	```tsx
	'use client';
	
	import { useState, useEffect, useRef } from 'react';
	import { createVector, addVectors } from '@/lib/physics/vectors';
	import { ErrorDisplay } from './ErrorDisplay';
	
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
			} catch (err) {
				setErrors([{ field: 'general', message: err.message, type: 'syntax' }]);
				setResultant(null);
			}
		}, [vectors]);
		
		useEffect(() => {
			if (!canvasRef.current) return;
			
			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;
			
			const width = canvas.width;
			const height = canvas.height;
			const centerX = width / 2;
			const centerY = height / 2;
			const scale = 40; // pixels per unit
			
			ctx.clearRect(0, 0, width, height);
			
			// Draw grid
			ctx.strokeStyle = '#e5e7eb';
		ctx.lineWidth = 0.5;
		for (let i = -10; i <= 10; i++) {
			const x = centerX + i * scale;
			const y = centerY - i * scale;
			ctx.beginPath();
			ctx.moveTo(x, 0);
			ctx.lineTo(x, height);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(0, y);
			ctx.lineTo(width, y);
			ctx.stroke();
		}
		
		// Draw axes
		ctx.strokeStyle = '#333';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(0, centerY);
		ctx.lineTo(width, centerY);
		ctx.stroke();
		ctx.beginPath();
		ctx.moveTo(centerX, 0);
		ctx.lineTo(centerX, height);
		ctx.stroke();
		
		// Draw vectors
		let currentX = centerX;
		let currentY = centerY;
		
		vectors.forEach((v, i) => {
			const endX = currentX + v.x * scale;
			const endY = currentY - v.y * scale;
			
			// Draw arrow
			ctx.strokeStyle = v.color;
			ctx.lineWidth = 3;
			ctx.beginPath();
			ctx.moveTo(currentX, currentY);
			ctx.lineTo(endX, endY);
			ctx.stroke();
			
			// Draw arrowhead
			const angle = Math.atan2(-(endY - currentY), endX - currentX);
			const headLen = 10;
			ctx.fillStyle = v.color;
			ctx.beginPath();
			ctx.moveTo(endX, endY);
			ctx.lineTo(endX - headLen * Math.cos(angle - 0.5), endY + headLen * Math.sin(angle - 0.5));
			ctx.lineTo(endX - headLen * Math.cos(angle + 0.5), endY + headLen * Math.sin(angle + 0.5));
			ctx.closePath();
			ctx.fill();
			
			// Draw label
			ctx.fillStyle = '#333';
		ctx.font = '14px sans-serif';
		ctx.fillText(v.label, (currentX + endX) / 2 - 10, (currentY + endY) / 2 - 10);
		
		// Update current position for head-to-tail
		currentX = endX;
		currentY = endY;
		});
		
		// Draw resultant (from origin to final position)
		if (vectors.length > 1) {
			ctx.strokeStyle = '#dc2626';
		ctx.lineWidth = 2;
		ctx.setLineDash([5, 5]);
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		ctx.lineTo(currentX, currentY);
		ctx.stroke();
		ctx.setLineDash([]);
		
		// Label resultant
		ctx.fillStyle = '#dc2626';
		ctx.font = 'bold 14px sans-serif';
		ctx.fillText('R', (centerX + currentX) / 2 - 10, (centerY + currentY) / 2 - 15);
		}
		
		}, [vectors, resultant]);
		
		const handleVectorChange = (index: number, field: 'x' | 'y', value: number) => {
			const newVectors = [...vectors];
			newVectors[index][field] = value;
			setVectors(newVectors);
		};
		
		const addVector = () => {
			const colors = ['#8b5cf6', '#f59e0b', '#ec4899'];
			setVectors([
				...vectors,
			  { x: 0, y: 0, label: `v${vectors.length + 1}`, color: colors[vectors.length % colors.length] }
			]);
		};
		
		const removeVector = (index: number) => {
			if (vectors.length <= 2) return;
			setVectors(vectors.filter((_, i) => i !== index));
		};
		
		return (
			<div className="p-6 bg-white rounded-xl shadow-md border">
			<h3 className="text-lg font-semibold mb-4">Vector Addition</h3>
			
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<div>
			<canvas
			ref={canvasRef}
			width={400}
			height={400}
			className="w-full border rounded-lg bg-gray-50"
			/>
			</div>
			
			<div className="space-y-4">
			{vectors.map((v, i) => (
				<div key={i} className="p-3 border rounded-lg">
				<div className="flex justify-between items-center mb-2">
				<span className="font-semibold" style={{ color: v.color }}>
				{v.label}
				</span>
				{vectors.length > 2 && (
					<button
					onClick={() => removeVector(i)}
					className="text-red-500 hover:text-red-700 text-sm"
					>
					✕
					</button>
				)}
				</div>
				<div className="grid grid-cols-2 gap-2">
				<div>
				<label className="text-xs text-gray-500">x</label>
				<input
				type="number"
				value={v.x}
				onChange={(e) => handleVectorChange(i, 'x', parseFloat(e.target.value) || 0)}
				className="w-full p-1 border rounded font-mono text-sm"
				step={0.5}
				/>
				</div>
				<div>
				<label className="text-xs text-gray-500">y</label>
				<input
				type="number"
				value={v.y}
				onChange={(e) => handleVectorChange(i, 'y', parseFloat(e.target.value) || 0)}
				className="w-full p-1 border rounded font-mono text-sm"
				step={0.5}
				/>
				</div>
				</div>
				</div>
			))}
			
			<button
			onClick={addVector}
			className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
			>
			+ Add Vector
			</button>
			
			<ErrorDisplay errors={errors} />
			
			{resultant && errors.length === 0 && (
				<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
				<div className="font-semibold text-red-800">Resultant</div>
				<div className="grid grid-cols-2 gap-2 mt-1">
				<div className="text-sm">
				<span className="text-gray-500">Magnitude:</span>
				<span className="ml-2 font-mono">{resultant.magnitude.toFixed(2)}</span>
				</div>
				<div className="text-sm">
				<span className="text-gray-500">Angle:</span>
				<span className="ml-2 font-mono">{resultant.angle.toFixed(1)}°</span>
				</div>
				<div className="text-sm col-span-2">
				<span className="text-gray-500">Components:</span>
				<span className="ml-2 font-mono">({resultant.x.toFixed(2)}, {resultant.y.toFixed(2)})</span>
				</div>
				</div>
				</div>
			)}
			</div>
			</div>
			</div>
		);
	}
	```
	
	Step 3.6: Error Display Component (components/physics/ErrorDisplay.tsx)
	
	```tsx
	'use client';
	
	interface ErrorDisplayProps {
		errors: Array<{ field: string; message: string; type: string }>;
		onFix?: (field: string) => void;
	}
	
	export function ErrorDisplay({ errors, onFix }: ErrorDisplayProps) {
		if (errors.length === 0) return null;
		
		return (
			<div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg space-y-2">
			<div className="font-semibold text-red-800">⚠️ Issues Found:</div>
			{errors.map((error, i) => (
				<div key={i} className="flex items-start gap-2 text-sm text-red-700">
				<span className="mt-1">•</span>
				<div>
				{error.field !== 'general' && (
					<span className="font-mono bg-red-100 px-1 rounded">{error.field}</span>
				)}
				<span className="ml-2">{error.message}</span>
				{onFix && (
					<button 
					onClick={() => onFix(error.field)}
					className="ml-2 text-blue-600 hover:underline text-xs"
					>
					Suggest fix
					</button>
				)}
				</div>
				</div>
			))}
			</div>
		);
	}
	```
	
	---
	
	PHASE 4: Pages & Routing
	
	Goal: Create the main pages for the physics module.
	
	Step 4.1: Main Dashboard (app/physics/page.tsx)
	
	```tsx
	import Link from 'next/link';
	
	export default function PhysicsDashboard() {
		const tools = [
			{ name: 'Formula Visualizer', path: '/physics', icon: '📐', desc: 'Interactive physics equations' },
			{ name: 'Kinematics', path: '/physics/kinematics', icon: '📊', desc: '1D motion with graphs' },
			{ name: 'Projectile Motion', path: '/physics/projectile', icon: '🎯', desc: '2D trajectory simulator' },
			{ name: 'Energy Explorer', path: '/physics/energy', icon: '⚡', desc: 'KE, PE, and total energy' },
			{ name: 'Vector Visualizer', path: '/physics/vectors', icon: '➡️', desc: 'Drag-and-drop vector addition' },
		];
		
		// Optional features
		const optionalTools = [
			{ name: 'SHM Visualizer', path: '/physics/shm', icon: '🌀', desc: 'Simple harmonic motion' },
			{ name: 'Circuit Simulator', path: '/physics/circuits', icon: '🔌', desc: 'Series/parallel circuits' },
		];
		
		return (
			<main className="container mx-auto p-6 max-w-6xl">
			<h1 className="text-3xl font-bold mb-6">🔬 Physics Module</h1>
			
			<h2 className="text-xl font-semibold mb-4">Core Features</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
			{tools.map((tool) => (
				<Link
				key={tool.path}
				href={tool.path}
				className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition border hover:border-blue-400"
				>
				<div className="text-4xl mb-3">{tool.icon}</div>
				<h2 className="text-xl font-semibold">{tool.name}</h2>
				<p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
				</Link>
			))}
			</div>
			
			<h2 className="text-xl font-semibold mb-4 text-gray-400">Optional Features</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
			{optionalTools.map((tool) => (
				<Link
				key={tool.path}
				href={tool.path}
				className="p-6 bg-gray-50 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200 hover:border-gray-400"
				>
				<div className="text-4xl mb-3">{tool.icon}</div>
				<h2 className="text-xl font-semibold">{tool.name}</h2>
				<p className="text-sm text-gray-500 mt-1">{tool.desc}</p>
				</Link>
			))}
			</div>
			</main>
		);
	}
	```
	
	Step 4.2: Kinematics Page (app/physics/kinematics/page.tsx)
	
	```tsx
	'use client';
	
	import { KinematicsSimulator } from '@/components/physics/KinematicsSimulator';
	
	export default function KinematicsPage() {
		return (
			<main className="container mx-auto p-6 max-w-4xl">
			<h1 className="text-2xl font-bold mb-6">📊 Kinematics Simulator</h1>
			<KinematicsSimulator />
			</main>
		);
	}
	```
	
	Step 4.3: Projectile Page (app/physics/projectile/page.tsx)
	
	```tsx
	'use client';
	
	import { ProjectileSimulator } from '@/components/physics/ProjectileSimulator';
	
	export default function ProjectilePage() {
		return (
			<main className="container mx-auto p-6 max-w-4xl">
			<h1 className="text-2xl font-bold mb-6">🎯 Projectile Motion</h1>
			<ProjectileSimulator />
			</main>
		);
	}
	```
	
	Step 4.4: Energy Page (app/physics/energy/page.tsx)
	
	```tsx
	'use client';
	
	import { EnergyExplorer } from '@/components/physics/EnergyExplorer';
	
	export default function EnergyPage() {
		return (
			<main className="container mx-auto p-6 max-w-4xl">
			<h1 className="text-2xl font-bold mb-6">⚡ Energy Explorer</h1>
			<EnergyExplorer />
			</main>
		);
	}
	```
	
	Step 4.5: Vectors Page (app/physics/vectors/page.tsx)
	
	```tsx
	'use client';
	
	import { VectorVisualizer } from '@/components/physics/VectorVisualizer';
	
	export default function VectorsPage() {
		return (
			<main className="container mx-auto p-6 max-w-4xl">
			<h1 className="text-2xl font-bold mb-6">➡️ Vector Visualizer</h1>
			<VectorVisualizer />
			</main>
		);
	}
	```
	
	Step 4.6: SHM Page (app/physics/shm/page.tsx) – OPTIONAL
	
	```tsx
	'use client';
	
	import { SHMVisualizer } from '@/components/physics/SHMVisualizer';
	
	export default function SHMPage() {
		return (
			<main className="container mx-auto p-6 max-w-4xl">
			<h1 className="text-2xl font-bold mb-6">🌀 Simple Harmonic Motion</h1>
			<SHMVisualizer />
			</main>
		);
	}
	```
	
	Step 4.7: Circuits Page (app/physics/circuits/page.tsx) – OPTIONAL
	
	```tsx
	'use client';
	
	import { CircuitBuilder } from '@/components/physics/CircuitBuilder';
	
	export default function CircuitsPage() {
		return (
			<main className="container mx-auto p-6 max-w-4xl">
			<h1 className="text-2xl font-bold mb-6">🔌 Circuit Simulator</h1>
			<CircuitBuilder />
			</main>
		);
	}
	```
	
	---
	
	PHASE 5: Optional Advanced Features
	
	Step 5.1: SHM Visualizer (components/physics/SHMVisualizer.tsx) – OPTIONAL
	
	```tsx
	'use client';
	
	import { useState, useEffect, useRef } from 'react';
	import { Line } from 'react-chartjs-2';
	
	export function SHMVisualizer() {
		const [mass, setMass] = useState(1);
		const [springConstant, setSpringConstant] = useState(10);
		const [amplitude, setAmplitude] = useState(1);
		const [time, setTime] = useState(0);
		const canvasRef = useRef<HTMLCanvasElement>(null);
		const [animationId, setAnimationId] = useState<number | null>(null);
		
		const omega = Math.sqrt(springConstant / mass);
		const period = 2 * Math.PI / omega;
		
		useEffect(() => {
			const animate = () => {
				setTime(prev => prev + 0.016);
				animationId.current = requestAnimationFrame(animate);
			};
			animate();
			return () => {
				if (animationId.current) cancelAnimationFrame(animationId.current);
			};
		}, []);
		
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
			labels: tData.map(t => t.toFixed(1)),
			datasets: [
				{ label: 'Position', data: posData, borderColor: 'rgb(59, 130, 246)', tension: 0.4 },
				{ label: 'Velocity', data: velData, borderColor: 'rgb(34, 197, 94)', tension: 0.4 },
				{ label: 'Acceleration', data: accData, borderColor: 'rgb(239, 68, 68)', tension: 0.4 }
			]
		};
		
		useEffect(() => {
			if (!canvasRef.current) return;
			const canvas = canvasRef.current;
			const ctx = canvas.getContext('2d');
			if (!ctx) return;
			
			const width = canvas.width;
			const height = canvas.height;
			const centerX = width / 2;
			const centerY = height / 2;
			
			ctx.clearRect(0, 0, width, height);
			
			// Draw spring (simplified)
			const springLen = 80;
			const endX = centerX - 40;
			const startX = endX - springLen;
			
			ctx.strokeStyle = '#333';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.moveTo(startX, centerY);
		for (let i = 0; i < 10; i++) {
			const x = startX + (i / 10) * springLen;
			const offset = (i % 2 === 0) ? 15 : -15;
			ctx.lineTo(x, centerY + offset);
		}
		ctx.lineTo(endX, centerY);
		ctx.stroke();
		
		// Draw mass
		const massX = endX + displacement * 40;
		const massSize = 20;
		ctx.fillStyle = '#2563eb';
		ctx.fillRect(massX - massSize/2, centerY - massSize/2, massSize, massSize);
		ctx.fillStyle = 'white';
		ctx.font = '10px sans-serif';
		ctx.textAlign = 'center';
		ctx.fillText('m', massX, centerY + 4);
		
		// Draw equilibrium line
		ctx.strokeStyle = '#ccc';
		ctx.setLineDash([3, 3]);
		ctx.beginPath();
		ctx.moveTo(endX, centerY - 40);
		ctx.lineTo(endX, centerY + 40);
		ctx.stroke();
		ctx.setLineDash([]);
		
		}, [displacement]);
		
		return (
			<div className="p-6 bg-white rounded-xl shadow-md border">
			<h3 className="text-lg font-semibold mb-4">Mass-Spring System</h3>
			
			<div className="grid grid-cols-3 gap-4 mb-4">
			<div>
			<label className="block text-sm font-medium">Mass (kg)</label>
			<input
			type="range"
			min={0.1}
			max={5}
			step={0.1}
			value={mass}
			onChange={(e) => setMass(parseFloat(e.target.value))}
			className="w-full"
			/>
			<span className="text-sm font-mono">{mass}</span>
			</div>
			<div>
			<label className="block text-sm font-medium">Spring Constant (N/m)</label>
			<input
			type="range"
			min={1}
			max={50}
			value={springConstant}
			onChange={(e) => setSpringConstant(parseFloat(e.target.value))}
			className="w-full"
			/>
			<span className="text-sm font-mono">{springConstant}</span>
			</div>
			<div>
			<label className="block text-sm font-medium">Amplitude (m)</label>
			<input
			type="range"
			min={0.1}
			max={2}
			step={0.1}
			value={amplitude}
			onChange={(e) => setAmplitude(parseFloat(e.target.value))}
			className="w-full"
			/>
			<span className="text-sm font-mono">{amplitude}</span>
			</div>
			</div>
			
			<canvas
			ref={canvasRef}
			width={400}
			height={150}
			className="w-full border rounded-lg bg-gray-50 mb-4"
			/>
			
			<div className="h-64">
			<Line 
			data={chartData}
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
			
			<div className="mt-4 grid grid-cols-3 gap-4 text-center">
			<div className="p-2 bg-blue-50 rounded">
			<div className="text-sm text-gray-500">Displacement</div>
			<div className="font-mono text-lg">{displacement.toFixed(3)} m</div>
			</div>
			<div className="p-2 bg-green-50 rounded">
			<div className="text-sm text-gray-500">Velocity</div>
			<div className="font-mono text-lg">{velocity.toFixed(3)} m/s</div>
			</div>
			<div className="p-2 bg-red-50 rounded">
			<div className="text-sm text-gray-500">Acceleration</div>
			<div className="font-mono text-lg">{acceleration.toFixed(3)} m/s²</div>
			</div>
			</div>
			
			<div className="mt-2 text-sm text-gray-500">
			<span className="font-semibold">Period:</span> {period.toFixed(3)} s &nbsp;|&nbsp;
			<span className="font-semibold">Frequency:</span> {(1/period).toFixed(3)} Hz
			</div>
			</div>
		);
	}
	```
	
	Step 5.2: Circuit Builder (components/physics/CircuitBuilder.tsx) – OPTIONAL
	
	```tsx
	'use client';
	
	import { useState } from 'react';
	import { ErrorDisplay } from './ErrorDisplay';
	
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
		
		const totalResistance = mode === 'series'
		? components.reduce((sum, c) => sum + c.value, 0)
		: 1 / components.reduce((sum, c) => sum + 1/(c.value || 0.001), 0);
		
		const totalCurrent = totalResistance > 0 ? batteryVoltage / totalResistance : 0;
		
		const handleAddResistor = () => {
			const id = String(Date.now());
			setComponents([
				...components,
				 { id, type: 'resistor', value: 10, label: `R${components.length + 1}` }
			]);
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
			<div className="p-6 bg-white rounded-xl shadow-md border">
			<h3 className="text-lg font-semibold mb-4">Circuit Builder</h3>
			
			<div className="flex gap-4 mb-4">
			<button
			onClick={() => setMode('series')}
			className={`px-4 py-2 rounded-lg ${mode === 'series' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
			>
			Series
			</button>
			<button
			onClick={() => setMode('parallel')}
			className={`px-4 py-2 rounded-lg ${mode === 'parallel' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
			>
			Parallel
			</button>
			</div>
			
			<div className="space-y-2 mb-4">
			{components.map((comp, index) => (
				<div key={comp.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
				<span className="font-mono w-8">{comp.label}</span>
				<span className="text-sm text-gray-500">{comp.type}</span>
				<input
				type="number"
				min={1}
				value={comp.value}
				onChange={(e) => {
					const newComponents = [...components];
					newComponents[index].value = parseFloat(e.target.value) || 0;
					setComponents(newComponents);
					setErrors([]);
				}}
				className="w-20 p-1 border rounded font-mono"
				/>
				<span className="text-sm">Ω</span>
				<button
				onClick={() => handleRemoveComponent(comp.id)}
				className="text-red-500 hover:text-red-700"
				>
				✕
				</button>
				</div>
			))}
			</div>
			
			<div className="flex gap-4">
			<button
			onClick={handleAddResistor}
			className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
			>
			+ Add Resistor
			</button>
			</div>
			
			<div className="mt-4">
			<label className="block text-sm font-medium">Battery Voltage (V)</label>
			<input
			type="number"
			min={0.1}
			step={0.5}
			value={batteryVoltage}
			onChange={(e) => setBatteryVoltage(parseFloat(e.target.value) || 0)}
			className="w-full p-2 border rounded-lg"
			/>
			</div>
			
			<ErrorDisplay errors={errors} />
			
			{errors.length === 0 && (
				<div className="mt-4 grid grid-cols-3 gap-4 text-center">
				<div className="p-2 bg-blue-50 rounded">
				<div className="text-sm text-gray-500">Total Resistance</div>
				<div className="font-mono text-lg">{totalResistance.toFixed(2)} Ω</div>
				</div>
				<div className="p-2 bg-green-50 rounded">
				<div className="text-sm text-gray-500">Total Current</div>
				<div className="font-mono text-lg">{totalCurrent.toFixed(3)} A</div>
				</div>
				<div className="p-2 bg-purple-50 rounded">
				<div className="text-sm text-gray-500">Power</div>
				<div className="font-mono text-lg">{(batteryVoltage * totalCurrent).toFixed(2)} W</div>
				</div>
				</div>
			)}
			</div>
		);
	}
	```
	
	---
	
	PHASE 6: Testing
	
	Step 6.1: Unit Tests (tests/physics/equations.test.ts)
	
	```typescript
	import { describe, expect, test } from 'bun:test';
	import { validateEquation } from '@/lib/physics/validator';
	import { solveKinematics } from '@/lib/physics/kinematics';
	import { calculateEnergy } from '@/lib/physics/energy';
	import { createVector, addVectors } from '@/lib/physics/vectors';
	
	describe('Physics Validator', () => {
		test('detects missing variables', () => {
			const errors = validateEquation('F = m * a', { m: 5 });
			expect(errors.some(e => e.field === 'a')).toBe(true);
		});
		
		test('accepts valid inputs', () => {
			const errors = validateEquation('F = m * a', { m: 5, a: 10 });
			expect(errors.length).toBe(0);
		});
	});
	
	describe('Kinematics Solver', () => {
		test('solves for displacement', () => {
			const result = solveKinematics({ u: 0, a: 2, t: 5 });
			expect(result.displacement).toBeCloseTo(25, 2);
		});
	});
	
	describe('Energy Calculator', () => {
		test('calculates KE and PE correctly', () => {
			const result = calculateEnergy(2, 10, 5);
			expect(result.kinetic).toBe(100);
			expect(result.potential).toBe(98.1);
			expect(result.total).toBe(198.1);
		});
	});
	
	describe('Vector Operations', () => {
		test('adds vectors correctly', () => {
			const v1 = createVector(3, 4);
			const v2 = createVector(2, 1);
			const sum = addVectors([v1, v2]);
			expect(sum.x).toBe(5);
			expect(sum.y).toBe(5);
			expect(sum.magnitude).toBeCloseTo(7.07, 1);
		});
	});
	```
	
	Step 6.2: Run Tests
	
	```bash
	bun test
	```
	
	---
	
	PHASE 7: Build & Deployment
	
	Step 7.1: Build for Production
	
	```bash
	bun run build
	```
	
	Step 7.2: Start Production Server
	
	```bash
	bun run start
	```
	
	---
	
	Implementation Checklist
	
	Phase Step Status
	0 Library Research & Selection [ ]
	1 1.1 Create module structure [ ]
	1 1.2 Install dependencies with Bun [ ]
	1 1.3 Verify installation [ ]
	2 2.1 Define TypeScript types [ ]
	2 2.2 Implement equation definitions [ ]
	2 2.3 Implement validator (live error checking) [ ]
	2 2.4 Implement kinematics solver [ ]
	2 2.5 Implement energy calculator [ ]
	2 2.6 Implement vector operations [ ]
	3 3.1 Formula Visualizer component [ ]
	3 3.2 Kinematics Simulator component [ ]
	3 3.3 Projectile Simulator component [ ]
	3 3.4 Energy Explorer component [ ]
	3 3.5 Vector Visualizer component [ ]
	3 3.6 Error Display component [ ]
	4 4.1 Main dashboard page [ ]
	4 4.2 Kinematics page [ ]
	4 4.3 Projectile page [ ]
	4 4.4 Energy page [ ]
	4 4.5 Vectors page [ ]
	4 4.6 SHM page (OPTIONAL) [ ]
	4 4.7 Circuits page (OPTIONAL) [ ]
	5 5.1 SHM Visualizer (OPTIONAL) [ ]
	5 5.2 Circuit Builder (OPTIONAL) [ ]
	6 6.1 Unit tests [ ]
	6 6.2 Run tests [ ]
	7 7.1 Build for production [ ]
	7 7.2 Start production server [ ]
	
	---
	
	Notes for the Agent
	
	1. Error Handling: If a library fails to install, skip that feature and continue.
	2. Live Error Checking: Implement getLiveValidation() for real-time feedback (code-intelligence style) if time permits.
	3. Consistency: Follow the same UI patterns as the existing chemistry module.
	4. Documentation: Add comments for any complex logic.
	5. Optional Features: SHM and Circuits are marked optional. Implement them only if time permits.
	
	---
	
	You're welcome! This plan is complete and self-contained. Let me know if you need any clarifications.
