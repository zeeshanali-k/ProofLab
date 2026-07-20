Here is a complete, self-sufficient implementation plan for the chemistry module.

Project Context & Setup

· Stack: Next.js (App Router) + TypeScript + Bun (instead of npm)
· No Git: Follow steps sequentially; mark each step [x] once done
· Structure: Each step has [ ] checkbox. Agent marks [x] upon completion.

---

PHASE 1: Project Setup & Dependency Installation

Goal: Initialize the chemistry module structure and install all required libraries.

Step 1.1: Create Module Structure

```
src/
├── app/
│   └── chemistry/
│       ├── page.tsx                 # Main chemistry dashboard
│       ├── balance/
│       │   └── page.tsx             # Equation balancer page
│       ├── calculator/
│       │   └── page.tsx             # Molar mass/stoichiometry page
│       └── viewer/
│           └── page.tsx             # 3D molecular viewer page
├── components/
│   └── chemistry/
│       ├── EquationInput.tsx        # Smart equation input component
│       ├── BalancedEquation.tsx     # Displays balanced result with steps
│       ├── MoleculeViewer.tsx       # 3D viewer wrapper
│       ├── FormulaParser.tsx        # Formula → elements breakdown
│       └── ReactionClassifier.tsx   # Classifies reaction type
└── lib/
└── chemistry/
├── balancer.ts              # Wrapper for fast-balance
├── formula.ts               # Wrapper for @chemistry/formula
├── calculator.ts            # Molar mass, stoichiometry
└── types.ts                 # TypeScript interfaces
```

Step 1.2: Install Dependencies with Bun

```bash
# Core chemistry libraries
bun add fast-balance                    # Fast equation balancer[reference:0]
bun add @chemistry/formula              # Formula parsing & molecular weight[reference:1]
bun add @nam088/chemical-balancer       # Comprehensive chemistry calculations[reference:2]

# 3D Molecular Viewer
bun add 3dmol                           # WebGL molecular visualization[reference:3]

# UI & Rendering
bun add katex                           # Math/chemistry rendering
bun add react-katex                     # React wrapper for KaTeX

# TypeScript types
bun add -d @types/3dmol
```

Step 1.3: Verify Installation

```bash
bun run build  # Should complete without errors
```

---

PHASE 2: Core Chemistry Engine

Goal: Build the backend logic for equation balancing, formula parsing, and calculations.

Step 2.1: Implement Equation Balancer (lib/chemistry/balancer.ts)

```typescript
import { balance } from 'fast-balance';

export interface BalanceResult {
	equation: string;           // "2 H2 + O2 -> 2 H2O"
	reactants: Array<{ formula: string; coefficient: number }>;
	products: Array<{ formula: string; coefficient: number }>;
	isValid: boolean;
	error?: string;
}

export function balanceEquation(input: string): BalanceResult {
	try {
		// fast-balance handles: ->, →, ⇒, ⇌, <=>, <->, -->, =[reference:4]
		// Auto-strips: (s), (l), (g), (aq)[reference:5]
		// Handles: nested parentheses, ionic charges, hydrates[reference:6]
		const result = balance(input, { showOne: true, format: 'text' });
		return {
			equation: result.equation,
			reactants: result.reactants,
			products: result.products,
			isValid: true
		};
	} catch (error) {
		return {
			equation: input,
			reactants: [],
			products: [],
			isValid: false,
			error: error.message
		};
	}
}

// Step-by-step balancing (for educational display)
export function balanceWithSteps(input: string): {
	result: BalanceResult;
	steps: string[];
} {
	// Use @nam088/chemical-balancer for step-by-step[reference:7]
	// Falls back to fast-balance for core balancing
	const result = balanceEquation(input);
	const steps = generateBalanceSteps(input, result);
	return { result, steps };
}
```

Step 2.2: Implement Formula Parser (lib/chemistry/formula.ts)

```typescript
import { Formula } from '@chemistry/formula';

export interface ParsedFormula {
	elements: Record<string, number>;
	molecularWeight: number;
	formulaString: string;
}

export function parseFormula(input: string): ParsedFormula {
	const parsed = Formula.parse(input);        // { C: 2, H: 6, O: 1 }[reference:8]
	const weight = Formula.convertToWeight(parsed); // 46.069[reference:9]
	const str = Formula.stringify(parsed);      // "C2H6O"[reference:10]
	
	return {
		elements: parsed,
		molecularWeight: weight,
		formulaString: str
	};
}
```

Step 2.3: Implement Chemistry Calculator (lib/chemistry/calculator.ts)

```typescript
import { 
	calculateMolarMass, 
	calculateMolarMassDetailed,
	calculateOxidationStates,
	idealGasLaw,
	calculatePH
} from '@nam088/chemical-balancer';

export interface MolarMassResult {
	formula: string;
	molarMass: number;
	breakdown: Array<{ element: string; count: number; mass: number }>;
}

export function getMolarMass(formula: string): MolarMassResult {
	const detailed = calculateMolarMassDetailed(formula);[reference:11]
	return {
		formula,
			molarMass: detailed.molarMass,
			breakdown: detailed.breakdown
	};
}

export function getOxidationStates(formula: string) {
	return calculateOxidationStates(formula);[reference:12]
}

export function calculateGasVolume(params: {
	pressure: number;
	moles: number;
	temperature: number;
}) {
	return idealGasLaw({ P: params.pressure, n: params.moles, T: params.temperature });[reference:13]
}

export function calculateSolutionPH(concentration: number) {
	return calculatePH(concentration);[reference:14]
}
```

Step 2.4: Define TypeScript Types (lib/chemistry/types.ts)

```typescript
export interface EquationInput {
	raw: string;                    // "H2 + O2 -> H2O"
	arrowType: '->' | '⇌' | '=';   // Reaction direction
}

export interface EquationResult {
	balanced: string;
	reactants: Reactant[];
	products: Product[];
	reactionType?: 'combustion' | 'acid-base' | 'redox' | 'precipitation' | 'decomposition';
	isReversible: boolean;
}

export interface Reactant {
	formula: string;
	coefficient: number;
	state?: 's' | 'l' | 'g' | 'aq';
}

export interface Product {
	formula: string;
	coefficient: number;
	state?: 's' | 'l' | 'g' | 'aq';
}

export interface ValidationError {
	type: 'unbalanced' | 'invalid_formula' | 'missing_state' | 'invalid_arrow';
	message: string;
	location?: string;
}
```

---

PHASE 3: User Interface Components

Goal: Build React components for equation input, display, and interaction.

Step 3.1: Smart Equation Input (components/chemistry/EquationInput.tsx)

```tsx
'use client';

	import { useState } from 'react';
	import { balanceEquation } from '@/lib/chemistry/balancer';
	
	interface EquationInputProps {
		onBalance: (result: any) => void;
		onError: (error: string) => void;
	}
	
	export function EquationInput({ onBalance, onError }: EquationInputProps) {
		const [input, setInput] = useState('');
		const [isLoading, setIsLoading] = useState(false);
		
		const handleBalance = async () => {
			setIsLoading(true);
			try {
				const result = balanceEquation(input);
				if (result.isValid) {
					onBalance(result);
				} else {
					onError(result.error || 'Failed to balance equation');
				}
			} catch (error) {
				onError(error.message);
			} finally {
				setIsLoading(false);
			}
		};
		
		return (
			<div className="space-y-4">
			<div className="flex gap-2">
			<input
			type="text"
			value={input}
			onChange={(e) => setInput(e.target.value)}
			placeholder="e.g., H2 + O2 -> H2O"
			className="flex-1 p-3 border rounded-lg font-mono text-lg"
			onKeyDown={(e) => e.key === 'Enter' && handleBalance()}
			/>
			<button
			onClick={handleBalance}
			disabled={isLoading || !input.trim()}
			className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
			>
			{isLoading ? 'Balancing...' : 'Balance →'}
			</button>
			</div>
			<div className="text-sm text-gray-500">
			Supports: →, ⇌, =, (s), (l), (g), (aq), nested parentheses, ionic charges
			</div>
			</div>
		);
	}
	```
	
	Step 3.2: Balanced Equation Display (components/chemistry/BalancedEquation.tsx)
	
	```tsx
	'use client';
	
	import { useState, useEffect } from 'react';
	import { InlineMath } from 'react-katex';
	import 'katex/dist/katex.min.css';
	
	interface BalancedEquationProps {
		result: {
			equation: string;
			reactants: Array<{ formula: string; coefficient: number }>;
			products: Array<{ formula: string; coefficient: number }>;
		};
		steps?: string[];
	}
	
	export function BalancedEquation({ result, steps }: BalancedEquationProps) {
		const [showSteps, setShowSteps] = useState(false);
		
		// Convert "2 H2 + O2 -> 2 H2O" to LaTeX: "2H_2 + O_2 \\rightarrow 2H_2O"
		const toLatex = (eq: string) => {
			return eq
			.replace(/(\d+)\s+([A-Z][a-z]?)/g, '$1$2')
			.replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}')
			.replace(/->/g, '\\rightarrow')
			.replace(/⇌/g, '\\rightleftharpoons');
		};
		
		return (
			<div className="p-6 bg-gray-50 rounded-lg border">
			<div className="text-2xl text-center font-mono">
			<InlineMath math={toLatex(result.equation)} />
			</div>
			
			<div className="mt-4 grid grid-cols-2 gap-4 text-sm">
			<div>
			<h4 className="font-semibold">Reactants</h4>
			{result.reactants.map((r, i) => (
				<div key={i}>{r.coefficient} × {r.formula}</div>
			))}
			</div>
			<div>
			<h4 className="font-semibold">Products</h4>
			{result.products.map((p, i) => (
				<div key={i}>{p.coefficient} × {p.formula}</div>
			))}
			</div>
			</div>
			
			{steps && steps.length > 0 && (
				<button
				onClick={() => setShowSteps(!showSteps)}
				className="mt-4 text-blue-600 hover:underline"
				>
				{showSteps ? 'Hide' : 'Show'} step-by-step solution
				</button>
			)}
			
			{showSteps && steps && (
				<div className="mt-2 p-3 bg-white rounded border space-y-1">
				{steps.map((step, i) => (
					<div key={i} className="text-sm font-mono">Step {i + 1}: {step}</div>
				))}
				</div>
			)}
			</div>
		);
	}
	```
	
	Step 3.3: Formula Parser Display (components/chemistry/FormulaParser.tsx)
	
	```tsx
	'use client';
	
	import { useState } from 'react';
	import { parseFormula } from '@/lib/chemistry/formula';
	
	export function FormulaParser() {
		const [input, setInput] = useState('');
		const [result, setResult] = useState(null);
		const [error, setError] = useState('');
		
		const handleParse = () => {
			try {
				const parsed = parseFormula(input);
				setResult(parsed);
				setError('');
			} catch (err) {
				setError('Invalid formula');
				setResult(null);
			}
		};
		
		return (
			<div className="space-y-4">
			<div className="flex gap-2">
			<input
			type="text"
			value={input}
			onChange={(e) => setInput(e.target.value)}
			placeholder="e.g., C2H5OH"
			className="flex-1 p-3 border rounded-lg font-mono"
			onKeyDown={(e) => e.key === 'Enter' && handleParse()}
			/>
			<button onClick={handleParse} className="px-6 py-3 bg-green-600 text-white rounded-lg">
			Parse
			</button>
			</div>
			
			{error && <div className="text-red-600">{error}</div>}
			
			{result && (
				<div className="p-4 bg-gray-50 rounded-lg border">
				<div className="grid grid-cols-2 gap-2">
				<div>
				<span className="font-semibold">Elements:</span>
				{Object.entries(result.elements).map(([el, count]) => (
					<div key={el} className="font-mono">{el}: {count}</div>
				))}
				</div>
				<div>
				<span className="font-semibold">Molecular Weight:</span>
				<div className="font-mono">{result.molecularWeight.toFixed(3)} g/mol</div>
				</div>
				</div>
				</div>
			)}
			</div>
		);
	}
	```
	
	---
	
	PHASE 4: 3D Molecular Viewer
	
	Goal: Add 3D visualization of molecules using 3Dmol.js.
	
	Step 4.1: Molecule Viewer Component (components/chemistry/MoleculeViewer.tsx)
	
	```tsx
	'use client';
	
	import { useEffect, useRef } from 'react';
	
	declare global {
		interface Window {
			$3Dmol: any;
		}
	}
	
	interface MoleculeViewerProps {
		pdbId?: string;        // e.g., '4N8T' for protein
		smiles?: string;       // SMILES string for small molecules
		style?: 'cartoon' | 'stick' | 'sphere' | 'surface';
		width?: number;
		height?: number;
	}
	
	export function MoleculeViewer({
		pdbId = '1CRN',
		style = 'cartoon',
		width = 500,
		height = 400
	}: MoleculeViewerProps) {
		const containerRef = useRef<HTMLDivElement>(null);
		const viewerRef = useRef<any>(null);
		
		useEffect(() => {
			// Load 3Dmol.js from CDN if not already loaded
			if (typeof window === 'undefined') return;
			
			const loadViewer = async () => {
				// Dynamically import 3Dmol
				await import('3dmol');
				
				if (!containerRef.current) return;
				
				// Create viewer[reference:15]
				const viewer = window.$3Dmol.createViewer(containerRef.current, {
					backgroundColor: 'white'
				});
				
				// Load structure[reference:16]
				window.$3Dmol.download(`pdb:${pdbId}`, viewer, { multimodel: true }, () => {
					viewer.setStyle({}, getStyleConfig(style));
					viewer.zoomTo();
					viewer.render();
				});
				
				viewerRef.current = viewer;
			};
			
			loadViewer();
			
			return () => {
				if (viewerRef.current) {
					viewerRef.current.clear();
				}
			};
		}, [pdbId, style]);
		
		const getStyleConfig = (styleType: string) => {
			switch (styleType) {
				case 'cartoon':
					return { cartoon: { color: 'spectrum' } };[reference:17]
				case 'stick':
					return { stick: {} };
				case 'sphere':
					return { sphere: { colorscheme: 'Jmol' } };
				case 'surface':
					return { surface: { opacity: 0.7, color: 'white' } };[reference:18]
				default:
					return { cartoon: { color: 'spectrum' } };
			}
		};
		
		return (
			<div className="border rounded-lg overflow-hidden bg-white">
			<div
			ref={containerRef}
			style={{ width: `${width}px`, height: `${height}px` }}
			className="molecule-viewer"
			/>
			<div className="p-2 text-xs text-gray-500 text-center">
			{pdbId} • Drag to rotate • Scroll to zoom
			</div>
			</div>
		);
	}
	```
	
	Step 4.2: SMILES to 3D (Advanced - Optional)
	
	For small molecules from SMILES strings, use OpenChemLib:
	
	```typescript
	// Install: bun add openchemlib-js
	import { Molecule } from 'openchemlib-js';
	
	export function smilesTo3D(smiles: string): any {
		const molecule = Molecule.fromSmiles(smiles);
		// Generate 3D coordinates
		molecule.ensure3D();
		return molecule.to3Dmol();
	}
	```
	
	---
	
	PHASE 5: Pages & Routing
	
	Goal: Create the main pages for the chemistry module.
	
	Step 5.1: Main Dashboard (app/chemistry/page.tsx)
	
	```tsx
	import Link from 'next/link';
	
	export default function ChemistryDashboard() {
		const tools = [
			{ name: 'Equation Balancer', path: '/chemistry/balance', icon: '⚖️' },
			{ name: 'Molar Mass Calculator', path: '/chemistry/calculator', icon: '📊' },
			{ name: '3D Molecule Viewer', path: '/chemistry/viewer', icon: '🧪' },
		];
		
		return (
			<main className="container mx-auto p-6 max-w-6xl">
			<h1 className="text-3xl font-bold mb-6">🧪 Chemistry Module</h1>
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
			{tools.map((tool) => (
				<Link
				key={tool.path}
				href={tool.path}
				className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition border hover:border-blue-400"
				>
				<div className="text-4xl mb-3">{tool.icon}</div>
				<h2 className="text-xl font-semibold">{tool.name}</h2>
				</Link>
			))}
			</div>
			</main>
		);
	}
	```
	
	Step 5.2: Balance Page (app/chemistry/balance/page.tsx)
	
	```tsx
	'use client';
	
	import { useState } from 'react';
	import { EquationInput } from '@/components/chemistry/EquationInput';
	import { BalancedEquation } from '@/components/chemistry/BalancedEquation';
	import { FormulaParser } from '@/components/chemistry/FormulaParser';
	
	export default function BalancePage() {
		const [result, setResult] = useState(null);
		const [error, setError] = useState('');
		
		return (
			<main className="container mx-auto p-6 max-w-4xl">
			<h1 className="text-2xl font-bold mb-6">⚖️ Equation Balancer</h1>
			
			<div className="space-y-6">
			<EquationInput onBalance={setResult} onError={setError} />
			
			{error && (
				<div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
				⚠️ {error}
				</div>
			)}
			
			{result && <BalancedEquation result={result} />}
			
			<div className="mt-8 border-t pt-6">
			<h2 className="text-lg font-semibold mb-4">🔬 Formula Parser</h2>
			<FormulaParser />
			</div>
			</div>
			</main>
		);
	}
	```
	
	Step 5.3: Viewer Page (app/chemistry/viewer/page.tsx)
	
	```tsx
	'use client';
	
	import { useState } from 'react';
	import { MoleculeViewer } from '@/components/chemistry/MoleculeViewer';
	
	export default function ViewerPage() {
		const [pdbId, setPdbId] = useState('1CRN');
		const [style, setStyle] = useState('cartoon');
		
		return (
			<main className="container mx-auto p-6 max-w-4xl">
			<h1 className="text-2xl font-bold mb-6">🧪 3D Molecule Viewer</h1>
			
			<div className="space-y-4">
			<div className="flex flex-wrap gap-4 items-center">
			<div>
			<label className="block text-sm font-medium mb-1">PDB ID</label>
			<input
			type="text"
			value={pdbId}
			onChange={(e) => setPdbId(e.target.value.toUpperCase())}
			placeholder="e.g., 4N8T"
			className="p-2 border rounded-lg font-mono w-32"
			/>
			</div>
			<div>
			<label className="block text-sm font-medium mb-1">Style</label>
			<select
			value={style}
			onChange={(e) => setStyle(e.target.value)}
			className="p-2 border rounded-lg"
			>
			<option value="cartoon">Cartoon</option>
			<option value="stick">Stick</option>
			<option value="sphere">Sphere</option>
			<option value="surface">Surface</option>
			</select>
			</div>
			<button
			onClick={() => setPdbId(pdbId)}
			className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg"
			>
			Load
			</button>
			</div>
			
			<MoleculeViewer pdbId={pdbId} style={style} />
			
			<div className="text-sm text-gray-500">
			Common PDB IDs: 1CRN (Crambin), 4N8T (Protein), 1MBA (Myoglobin)
			</div>
			</div>
			</main>
		);
	}
	```
	
	---
	
	PHASE 6: Testing
	
	Goal: Ensure all functionality works correctly.
	
	Step 6.1: Unit Tests (tests/chemistry/balancer.test.ts)
	
	```typescript
	import { describe, expect, test } from 'bun:test';
	import { balanceEquation } from '@/lib/chemistry/balancer';
	import { parseFormula } from '@/lib/chemistry/formula';
	
	describe('Equation Balancer', () => {
		test('balances simple equation', () => {
			const result = balanceEquation('H2 + O2 -> H2O');
			expect(result.isValid).toBe(true);
			expect(result.equation).toContain('2 H2 + O2 -> 2 H2O');
		});
		
		test('handles ionic compounds', () => {
			const result = balanceEquation('Fe2+ + Cl- -> FeCl2');
			expect(result.isValid).toBe(true);
		});
		
		test('handles reversible reactions', () => {
			const result = balanceEquation('N2 + H2 ⇌ NH3');
			expect(result.isValid).toBe(true);
		});
		
		test('returns error for invalid input', () => {
			const result = balanceEquation('invalid equation');
			expect(result.isValid).toBe(false);
			expect(result.error).toBeDefined();
		});
	});
	
	describe('Formula Parser', () => {
		test('parses ethanol', () => {
			const result = parseFormula('C2H5OH');
			expect(result.elements.C).toBe(2);
			expect(result.elements.H).toBe(6);
			expect(result.elements.O).toBe(1);
			expect(result.molecularWeight).toBeCloseTo(46.069, 2);
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
	1 1.1 Create module structure [ ]
	1 1.2 Install dependencies with Bun [ ]
	1 1.3 Verify installation [ ]
	2 2.1 Implement equation balancer [ ]
	2 2.2 Implement formula parser [ ]
	2 2.3 Implement chemistry calculator [ ]
	2 2.4 Define TypeScript types [ ]
	3 3.1 Smart equation input component [ ]
	3 3.2 Balanced equation display [ ]
	3 3.3 Formula parser display [ ]
	4 4.1 3D molecule viewer [ ]
	5 5.1 Main dashboard page [ ]
	5 5.2 Balance page [ ]
	5 5.3 Viewer page [ ]
	6 6.1 Unit tests [ ]
	6 6.2 Run tests [ ]
	7 7.1 Build for production [ ]
	
	---
	
	Questions?
	
	Before starting, clarify:
	
	1. Do you want the calculator page too? (molar mass, stoichiometry, pH, gas laws) — I can add it.
	2. Any specific equations or molecules for demo? (e.g., photosynthesis, Haber process)
	3. State symbols: (s), (l), (g), (aq) — should they be required or optional?
	4. Step-by-step display: Do you want the raw linear algebra steps or human-readable explanations?
	
	Let me know and I'll adjust the plan accordingly.

---

# POST-IMPLEMENTATION ANALYSIS & IMPROVEMENT ROADMAP

## Status: Module Implemented and Functional

The chemistry module has been successfully implemented with the following components:
- [x] Module structure created
- [x] Dependencies installed (fast-balance, @chemistry/formula, @nam088/chemical-balancer, 3dmol, react-katex)
- [x] Core engine implemented (balancer, formula parser, calculator)
- [x] UI components created (EquationInput, BalancedEquation, FormulaParser, MoleculeViewer, ReactionClassifier)
- [x] Pages created (dashboard, balance, calculator, viewer)
- [x] Navigation link added to ProofLab header
- [x] 50 unit tests created and passing
- [x] Build successful

---

## CURRENT ISSUES IDENTIFIED

### 1. Arrow Display Issue
**Problem:** Balanced equations display with plain text arrows (->) instead of proper LaTeX arrows (\rightarrow, \rightleftharpoons)

**Current Behavior:**
- Input: `H2 + O2 -> H2O`
- Output: `2 H2 + 1 O2 -> 2 H2O` (plain text)

**Expected Behavior:**
- Output: `2H_2 + O_2 \rightarrow 2H_2O` (proper LaTeX)

**Root Cause:** The `toLatex()` function in BalancedEquation.jsx needs enhancement to handle:
- Spaces between coefficients and formulas
- Various arrow types (->, →, ⇌, ⇒, =)
- Proper subscript formatting

**Impact:** HIGH - Affects visual quality and readability

### 2. Reversible Equations Not Preserved
**Problem:** Reversible reactions (using ⇌) are converted to irreversible (->) during normalization

**Current Behavior:**
- Input: `N2 + 3H2 ⇌ 2NH3`
- Output: `N2 + 3 H2 -> 2 NH3` (irreversible arrow)

**Expected Behavior:**
- Output: `N_2 + 3H_2 \rightleftharpoons 2NH_3` (preserves reversible nature)

**Root Cause:** `normalizeEquationInput()` in balancer.ts strips all arrow types to `->` for parsing

**Impact:** HIGH - Loses chemical meaning for equilibrium reactions

### 3. No Auto-Suggestion for Errors
**Problem:** When users enter incorrect equations, they only see a generic error message

**Current Behavior:**
- Input: `H2O2` (without arrow)
- Error: "Failed to balance equation"

**Expected Behavior:**
- Suggestion: "Missing arrow. Did you mean: H2O2 -> ?"
- Common typo fixes: "H20" → "H2O (water)"
- Missing state symbols: "Suggest adding (s), (l), (g), or (aq)"

**Impact:** MEDIUM - User experience could be improved

### 4. Navigation Not Persistent
**Problem:** Navigation between Math and Chemistry sections is not seamless

**Current Behavior:**
- Chemistry link only in ProofLab header
- No way to navigate back to Math from Chemistry pages
- No visual indication of current section

**Expected Behavior:**
- Persistent navbar on ALL pages
- Links to both Math Lab and Chemistry Lab
- Active state highlighting
- Breadcrumbs or visual indicators

**Impact:** HIGH - Affects user experience and navigation

---

## PRIORITY IMPROVEMENTS (Quick Wins - 30-60 min total)

### Priority 1: Fix Arrow Display (5-10 min)
**Location:** `src/components/chemistry/BalancedEquation.jsx`

**Solution:** Enhance the `toLatex()` function
```javascript
const toLatex = (eq) => {
  if (!eq) return eq;
  
  // First, handle spaces between coefficients and formulas: "2 H2" -> "2H2"
  let result = eq.replace(/(\d+)\s+([A-Z][a-z]?)/g, '$1$2');
  
  // Add subscripts: "H2" -> "H_2"
  result = result.replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}');
  
  // Handle various arrow types
  result = result
    .replace(/->/g, '\\rightarrow ')
    .replace(/→/g, '\\rightarrow ')
    .replace(/⇌/g, '\\rightleftharpoons ')
    .replace(/⇒/g, '\\Rightarrow ')
    .replace(/=>/g, '\\rightarrow ')
    .replace(/<->/g, '\\rightleftharpoons ')
    .replace(/=/g, '\\=');
  
  // Clean up multiple spaces
  result = result.replace(/\s+/g, ' ').trim();
  
  return result;
};
```

**Files to Update:**
- `src/components/chemistry/BalancedEquation.jsx`

---

### Priority 2: Preserve Reversible Arrows (10-15 min)
**Location:** `lib/chemistry/balancer.ts`

**Solution:** Track original arrow type and restore it
```typescript
interface BalanceResult {
  equation: string;
  reactants: Array<{ formula: string; coefficient: number }>;
  products: Array<{ formula: string; coefficient: number }>;
  isValid: boolean;
  error?: string;
  arrowType?: string;  // NEW: Track original arrow
}

export function balanceEquation(input: string): BalanceResult {
  try {
    // Extract original arrow type
    const arrowMatch = input.match(/(\s*)([\u2192\u21CC\u21D2\u2194\u2261]|->|=>|<->|<=)/);
    const originalArrow = arrowMatch ? arrowMatch[2] : '->';
    
    const normalizedInput = normalizeEquationInput(input);
    const result = balance(normalizedInput, { showOne: true, format: 'text' });
    
    // Restore original arrow in the equation
    const restoredEquation = restoreArrowType(result.equation, originalArrow);
    
    return {
      equation: restoredEquation,
      reactants: result.reactants,
      products: result.products,
      isValid: true,
      arrowType: originalArrow
    };
  } catch (error) {
    return {
      equation: input,
      reactants: [],
      products: [],
      isValid: false,
      error: error.message,
      arrowType: input.match(/[\u2192\u21CC\u21D2\u2194\u2261]|->|=>|<->|<=)/)?.[0] || '->'
    };
  }
}

function restoreArrowType(equation: string, originalType: string): string {
  const arrowMap: Record<string, string> = {
    '->': '->',
    '\u2192': '\u2192',  // →
    '\u21CC': '\u21CC',  // ⇌
    '\u21D2': '\u21D2',  // ⇒
    '\u2194': '\u2194',  // ↔
    '=': '=',
    '=>': '\u2192',
    '<->': '\u21CC',
    '<=>': '\u21CC'
  };
  
  const normalizedArrow = arrowMap[originalType] || originalType;
  return equation.replace(/->|\u2192|\u21CC|\u21D2|\u2194|=>|<->|<=>/g, normalizedArrow);
}
```

**Files to Update:**
- `lib/chemistry/balancer.ts`
- `lib/chemistry/types.ts` (add arrowType to BalanceResult)

---

### Priority 3: Add Persistent Navigation Bar (15-20 min)
**Goal:** Create a shared navbar that appears on all pages

**Step 1: Create Navigation Component**
```javascript
// src/components/Navigation.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };
  
  return (
    <nav className="main-navbar">
      <div className="nav-container">
        <Link
          href="/"
          className={`nav-link ${isActive('/') ? 'active' : ''}`}
          aria-label="Math Lab - Algebra reasoning debugger"
        >
          <span className="nav-icon">🔢</span>
          <span className="nav-text">Math Lab</span>
        </Link>
        <Link
          href="/chemistry"
          className={`nav-link ${isActive('/chemistry') ? 'active' : ''}`}
          aria-label="Chemistry Lab - Equation balancer and tools"
        >
          <span className="nav-icon">🧪</span>
          <span className="nav-text">Chemistry Lab</span>
        </Link>
      </div>
    </nav>
  );
}
```

**Step 2: Add to Layout**
```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import 'katex/dist/katex.min.css';
import '../src/index.css';
import '../src/chemistry.css';
import { Navigation } from '../src/components/Navigation';

export const metadata: Metadata = {
  title: 'ProofLab',
  description: 'A visual algebra-reasoning debugger.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        {children}
      </body>
    </html>
  );
}
```

**Step 3: Add CSS for Navigation**
```css
/* Add to src/chemistry.css or src/index.css */
.main-navbar {
  background: rgba(255, 255, 255, 0.94);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  gap: 8px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 20px;
  border-radius: 10px;
  text-decoration: none;
  color: var(--ink);
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.nav-link:hover {
  background: var(--card);
  color: var(--accent);
}

.nav-link.active {
  background: var(--accent);
  color: white;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-text {
  display: none;
}

@media (min-width: 768px) {
  .nav-text {
    display: inline;
  }
}
```

**Step 4: Remove Chemistry Link from App.jsx Header**
Since navigation is now persistent, remove the duplicate link from App.jsx header.

**Files to Update:**
- `src/components/Navigation.jsx` (new file)
- `app/layout.tsx`
- `src/chemistry.css` or `src/index.css`
- `src/App.jsx` (remove chemistry link from header)

---

### Priority 4: Add Auto-Correction Suggestions (15-20 min)
**Location:** `lib/chemistry/balancer.ts`

**Solution:** Add suggestion system
```typescript
interface Suggestion {
  corrected: string;
  message: string;
  type: 'arrow' | 'formula' | 'state' | 'typo';
}

export function suggestCorrection(input: string): Suggestion | null {
  const trimmed = input.trim();
  
  // 1. Missing arrow
  if (!trimmed.includes('->') && !trimmed.includes('\u2192') && 
      !trimmed.includes('\u21CC') && !trimmed.includes('=') &&
      !trimmed.includes('\u21D2')) {
    return {
      corrected: `${trimmed} -> `,
      message: "Added reaction arrow. Type the products after '->'",
      type: 'arrow'
    };
  }
  
  // 2. Common typos
  const typoCorrections: Array<{ pattern: RegExp; replacement: string; message: string }> = [
    { pattern: /\bH20\b/g, replacement: 'H2O', message: "Fixed: Water is H₂O, not H20" },
    { pattern: /\bH20\b/g, replacement: 'H2O', message: "Fixed: Water is H₂O" },
    { pattern: /\bCO\b(?![2])/g, replacement: 'CO2', message: "Suggested: Did you mean CO₂ (carbon dioxide)?" },
    { pattern: /\bNaCl2\b/g, replacement: 'NaCl', message: "Fixed: Sodium chloride is NaCl, not NaCl₂" },
    { pattern: /\bCaCl\b/g, replacement: 'CaCl2', message: "Fixed: Calcium chloride is CaCl₂" },
    { pattern: /\bAl2O\b/g, replacement: 'Al2O3', message: "Fixed: Aluminum oxide is Al₂O₃" },
    { pattern: /\bFeO\b/g, replacement: 'Fe2O3', message: "Suggested: Iron(III) oxide is Fe₂O₃ (or FeO for iron(II) oxide)" },
  ];
  
  for (const { pattern, replacement, message } of typoCorrections) {
    if (pattern.test(trimmed)) {
      const corrected = trimmed.replace(pattern, replacement);
      return { corrected, message, type: 'typo' };
    }
  }
  
  // 3. Missing parentheses in polyatomic ions
  if (trimmed.includes('OH') && !trimmed.includes('OH)') && !trimmed.includes('(OH')) {
    return {
      corrected: trimmed.replace(/OH/g, '(OH)'),
      message: "Added parentheses for hydroxide ion: (OH)",
      type: 'formula'
    };
  }
  
  // 4. Missing state symbols (optional suggestion)
  if (trimmed.includes('->') && !trimmed.includes('(s)') && 
      !trimmed.includes('(l)') && !trimmed.includes('(g)') && 
      !trimmed.includes('(aq)')) {
    return {
      corrected: trimmed,
      message: "Tip: Add state symbols like (s), (l), (g), or (aq) for clarity",
      type: 'state'
    };
  }
  
  return null;
}

// Update balanceEquation to include suggestions
export function balanceEquation(input: string): BalanceResult {
  try {
    const arrowMatch = input.match(/(\s*)([\u2192\u21CC\u21D2\u2194\u2261]|->|=>|<->|<=)/);
    const originalArrow = arrowMatch ? arrowMatch[2] : '->';
    
    const normalizedInput = normalizeEquationInput(input);
    const result = balance(normalizedInput, { showOne: true, format: 'text' });
    const restoredEquation = restoreArrowType(result.equation, originalArrow);
    
    return {
      equation: restoredEquation,
      reactants: result.reactants,
      products: result.products,
      isValid: true,
      arrowType: originalArrow
    };
  } catch (error) {
    const suggestion = suggestCorrection(input);
    return {
      equation: input,
      reactants: [],
      products: [],
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to balance equation',
      arrowType: input.match(/[\u2192\u21CC\u21D2\u2194\u2261]|->|=>|<->|<=)/)?.[0] || '->',
      suggestion
    };
  }
}
```

**Files to Update:**
- `lib/chemistry/balancer.ts`
- `lib/chemistry/types.ts` (add suggestion to BalanceResult)

**UI Integration:**
```jsx
// In BalancePage.tsx
{error && (
  <div className="error-message">
    ⚠️ {error}
    {result?.suggestion && (
      <div className="suggestion-box">
        <strong>Suggestion:</strong> {result.suggestion.message}
        {result.suggestion.type === 'arrow' && (
          <button onClick={() => setInput(result.suggestion.corrected)}>
            Use suggested equation
          </button>
        )}
      </div>
    )}
  </div>
)}
```

---

## POLISH FEATURES (Medium Effort, High Impact)

### 1. Copy Button for Results (5-10 min)
Add a copy button next to all results (balanced equations, molar mass, etc.)

```jsx
// Reusable CopyButton component
function CopyButton({ textToCopy, children }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <button onClick={handleCopy} className="copy-btn">
      {copied ? '✓ Copied!' : children || '📋 Copy'}
    </button>
  );
}
```

**Usage:**
```jsx
{result && (
  <div className="result-header">
    <BalancedEquation result={result} />
    <CopyButton textToCopy={result.equation}>Copy Equation</CopyButton>
  </div>
)}
```

**Files to Update:**
- Create `src/components/CopyButton.jsx`
- Add to `BalancedEquation.jsx`, `FormulaParser.jsx`, calculator results

---

### 2. Common Equation Templates (10-15 min)
Add dropdown with pre-loaded common reactions

```jsx
// In EquationInput.jsx
const [showTemplates, setShowTemplates] = useState(false);

const templates = [
  { name: 'Water Formation', equation: 'H2 + O2 -> H2O' },
  { name: 'Combustion of Methane', equation: 'CH4 + O2 -> CO2 + H2O' },
  { name: 'Photosynthesis', equation: '6 CO2 + 6 H2O -> C6H12O6 + 6 O2' },
  { name: 'Haber Process', equation: 'N2 + 3 H2 -> 2 NH3' },
  { name: 'Acid-Base Neutralization', equation: 'HCl + NaOH -> NaCl + H2O' },
  { name: 'Decomposition of Water', equation: '2 H2O -> 2 H2 + O2' },
  { name: 'Rust Formation', equation: '4 Fe + 3 O2 -> 2 Fe2O3' },
  { name: 'Electrolysis of Water', equation: '2 H2O -> 2 H2 + O2' },
];

// Add template dropdown button
<button 
  onClick={() => setShowTemplates(!showTemplates)}
  className="template-btn"
>
  📚 Templates
</button>

{showTemplates && (
  <div className="template-dropdown">
    {templates.map((t) => (
      <button 
        key={t.name}
        onClick={() => {
          setInput(t.equation);
          setShowTemplates(false);
        }}
        className="template-item"
      >
        {t.name}
        <span className="template-preview">{t.equation}</span>
      </button>
    ))}
  </div>
)}
```

**Files to Update:**
- `src/components/chemistry/EquationInput.jsx`
- `src/chemistry.css` (add template dropdown styles)

---

### 3. Better Error Messages (10 min)
Enhance error display with specific, actionable feedback

```javascript
// In balancer.ts
function getErrorMessage(input: string, error: string): string {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return 'Please enter an equation';
  }
  
  if (!trimmed.match(/[\u2192\u21CC\u21D2\u2194\u2261]|->|=>|<->|<=|=/)) {
    return 'Missing reaction arrow. Use ->, →, ⇌, ⇒, or =';
  }
  
  // Check for invalid characters
  if (trimmed.match(/[^a-zA-Z0-9\s\+\-\=\(\)\u2192\u21CC\u21D2\u2194\u2261]/)) {
    return 'Invalid characters detected. Use only element symbols, numbers, +, ->, and parentheses';
  }
  
  // Check for unrecognized element symbols
  const elementPattern = /\b([A-Z][a-z]?)\b/g;
  const matches = trimmed.match(elementPattern) || [];
  const validElements = ['H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', ...];
  
  for (const el of matches) {
    if (!validElements.includes(el)) {
      return `Unknown element symbol: ${el}`;
    }
  }
  
  return error || 'Could not balance equation';
}
```

**Files to Update:**
- `lib/chemistry/balancer.ts`

---

### 4. Periodic Table Reference (15-20 min)
Add a small periodic table that shows element information on click/hover

```jsx
// src/components/chemistry/PeriodicTable.jsx
'use client';

import { useState } from 'react';

export function PeriodicTable() {
  const [selectedElement, setSelectedElement] = useState(null);
  
  const elements = [
    { symbol: 'H', name: 'Hydrogen', number: 1, mass: 1.008, group: 1, period: 1 },
    { symbol: 'He', name: 'Helium', number: 2, mass: 4.0026, group: 18, period: 1 },
    // ... more elements
  ];
  
  if (!selectedElement) {
    return (
      <button onClick={() => setSelectedElement('all')} className="periodic-table-btn">
        📊 Periodic Table
      </button>
    );
  }
  
  return (
    <div className="periodic-table-modal">
      <div className="periodic-table-grid">
        {elements.map((el) => (
          <div 
            key={el.symbol} 
            className="element-card"
            onClick={() => navigator.clipboard.writeText(el.symbol)}
          >
            <strong>{el.symbol}</strong>
            <small>{el.number}</small>
            <div className="element-name">{el.name}</div>
            <div className="element-mass">{el.mass.toFixed(2)}</div>
          </div>
        ))}
      </div>
      <button onClick={() => setSelectedElement(null)}>Close</button>
    </div>
  );
}
```

**Files to Update:**
- `src/components/chemistry/PeriodicTable.jsx` (new file)
- `src/chemistry.css` (add periodic table styles)

---

### 5. Formula Autocomplete (20-30 min)
Add autocomplete suggestions as user types chemical formulas

```jsx
// In EquationInput.jsx
const [suggestions, setSuggestions] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);

const commonFormulas = [
  'H2O', 'CO2', 'CH4', 'C2H5OH', 'HCl', 'NaCl', 'H2SO4', 'HNO3',
  'NH3', 'O2', 'N2', 'Cl2', 'H2', 'C6H12O6', 'NaOH', 'KOH',
  'CaCO3', 'NaHCO3', 'H2O2', 'SO2', 'NO2'
];

const handleChange = (e) => {
  const value = e.target.value;
  setInput(value);
  
  // Show suggestions if input is empty or ends with space
  if (value === '' || value.endsWith(' ') || value.endsWith('+')) {
    const lastWord = value.split(/[\s\+->⇌=]/).pop() || '';
    const matches = commonFormulas
      .filter(f => f.toLowerCase().startsWith(lastWord.toLowerCase()))
      .slice(0, 5);
    setSuggestions(matches);
    setShowSuggestions(matches.length > 0);
  } else {
    setShowSuggestions(false);
  }
};

// In return statement
<input
  value={input}
  onChange={handleChange}
  // ... other props
/>
{showSuggestions && suggestions.length > 0 && (
  <ul className="suggestions-list">
    {suggestions.map((s, i) => (
      <li 
        key={i}
        onClick={() => {
          const parts = input.split(/[\s\+->⇌=]/);
          parts.pop(); // Remove last incomplete word
          const newInput = [...parts, s].join(' ');
          setInput(newInput);
          setShowSuggestions(false);
        }}
      >
        {s}
      </li>
    ))}
  </ul>
)}
```

**Files to Update:**
- `src/components/chemistry/EquationInput.jsx`
- `src/chemistry.css` (add autocomplete styles)

---

## ADVANCED FEATURES (Future Considerations)

### 1. Stoichiometry Calculator
**Description:** Full stoichiometry calculations with limiting reactant analysis

**Features:**
- Moles to moles conversions
- Moles to grams conversions
- Grams to grams conversions
- Limiting reactant identification
- Theoretical yield calculation
- Percent yield calculation
- Excess reactant calculation

**Complexity:** Medium (2-3 hours)

**Impact:** HIGH - Very useful for students

---

### 2. Solution Chemistry Calculator
**Description:** M1V1 = M2V2 dilution calculations

**Features:**
- Dilution calculator
- Concentration conversions (M, m, %, ppm)
- Solution preparation guide
- Titration calculations

**Complexity:** Low (1-2 hours)

**Impact:** Medium - Useful for lab work

---

### 3. Thermochemistry Module
**Description:** Calculate enthalpy changes for reactions

**Features:**
- Standard enthalpies of formation
- Reaction enthalpy calculation
- Endothermic/exothermic classification
- Bond energy calculations

**Complexity:** Medium (3-4 hours)

**Impact:** Medium - Advanced chemistry

**Dependencies:** Need enthalpy data database

---

### 4. Equilibrium Constants
**Description:** K calculations for equilibrium reactions

**Features:**
- Kc, Kp calculations
- Reaction quotient (Q) calculations
- Le Chatelier's principle guidance
- ICE table generator

**Complexity:** Medium (2-3 hours)

**Impact:** Medium - Important for equilibrium chemistry

---

### 5. pH and Acid-Base Advanced Calculator
**Description:** Comprehensive acid-base calculations

**Features:**
- Strong acid/base pH
- Weak acid/base pH (with Ka/Kb)
- Buffer solution pH (Henderson-Hasselbalch)
- Titration curves
- Polyprotic acids

**Complexity:** Medium (2-3 hours)

**Impact:** Medium - Useful for chemistry students

---

### 6. Electrochemistry Module
**Description:** Redox reaction balancing and cell potential calculations

**Features:**
- Half-reaction method balancing
- Standard reduction potentials
- Cell potential (E°cell) calculations
- Nernst equation
- Galvanic vs electrolytic cell identification

**Complexity:** High (4-5 hours)

**Impact:** Medium - Advanced topic

**Dependencies:** Reduction potential database

---

### 7. Molecular Geometry Visualizer
**Description:** VSEPR theory visualization

**Features:**
- Predict molecular geometry
- Bond angles
- Hybridization
- Polarity prediction
- 3D visualization of molecular shape

**Complexity:** High (4-5 hours)

**Impact:** Medium - Educational value

**Dependencies:** VSEPR rules database

---

### 8. Reaction Mechanism Viewer
**Description:** Visualize organic reaction mechanisms

**Features:**
- SN1, SN2 mechanisms
- E1, E2 mechanisms
- Electrophilic addition
- Nucleophilic substitution
- Arrow pushing visualization

**Complexity:** Very High (1 week+)

**Impact:** Low - Very specialized

**Dependencies:** Organic chemistry database, custom visualization

---

## RECOMMENDED IMPLEMENTATION TIMELINE

### Immediate (Do Now - 30-60 min)
1. **Fix arrow display** - Most visible issue, affects all equations
2. **Add persistent navbar** - Critical for navigation
3. **Preserve reversible arrows** - Important for chemical accuracy
4. **Add copy buttons** - Great UX improvement

**Total Time:** ~1-2 hours
**Impact:** HIGH

---

### Short Term (Next Session - 2-4 hours)
1. **Auto-correction suggestions** - Improves user experience
2. **Common equation templates** - Saves user time
3. **Better error messages** - Reduces frustration
4. **Formula autocomplete** - Nice polish

**Total Time:** ~3-4 hours
**Impact:** HIGH

---

### Medium Term (Next Week - 8-12 hours)
1. **Stoichiometry calculator** - Most requested feature
2. **Limiting reactant analysis** - Core chemistry concept
3. **Periodic table reference** - Educational value
4. **Solution chemistry** - Useful for lab work

**Total Time:** ~1 day
**Impact:** HIGH

---

### Long Term (Future - 20+ hours)
1. **Thermochemistry** - Advanced chemistry
2. **Equilibrium constants** - Advanced topic
3. **Electrochemistry** - Specialized
4. **Molecular geometry** - Educational

**Total Time:** ~2-3 days
**Impact:** MEDIUM

---

## SPECIFIC CODE IMPROVEMENTS

### 1. Enhanced toLatex() Function
```javascript
// In src/components/chemistry/BalancedEquation.jsx
const toLatex = (eq) => {
  if (!eq) return eq;
  
  let result = eq;
  
  // Step 1: Handle spaces between coefficients and formulas
  // "2 H2 + 1 O2" -> "2H2 + O2"
  result = result.replace(/(\d+)\s+([A-Z][a-z]?)/g, '$1$2');
  
  // Step 2: Add subscripts to element counts
  // "H2O" -> "H_2O", "CO2" -> "CO_2"
  result = result.replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}');
  
  // Step 3: Handle parentheses for polyatomic ions
  // "(OH)2" -> "(OH)_2"
  result = result.replace(/(\))\s*(\d+)/g, '$1_{$2}');
  
  // Step 4: Handle various arrow types
  result = result
    .replace(/->/g, '\\rightarrow ')
    .replace(/\u2192/g, '\\rightarrow ')      // →
    .replace(/\u21CC/g, '\\rightleftharpoons ') // ⇌
    .replace(/\u21D2/g, '\\Rightarrow ')        // ⇒
    .replace(/\u2194/g, '\\leftrightarrow ')     // ↔
    .replace(/=>/g, '\\rightarrow ')
    .replace(/<->/g, '\\rightleftharpoons ')
    .replace(/<=>/g, '\\rightleftharpoons ')
    .replace(/=/g, '\\=');
  
  // Step 5: Clean up spacing
  result = result
    .replace(/\s+/g, ' ')
    .replace(/\s+(\+|\\rightarrow|\\rightleftharpoons|\\Rightarrow|\\leftrightarrow|\\=)/g, ' $1 ')
    .trim();
  
  return result;
};
```

### 2. Enhanced normalizeEquationInput()
```typescript
// In lib/chemistry/balancer.ts
function normalizeEquationInput(input: string): string {
  // Extract and preserve original arrow type
  const arrowMatch = input.match(/(\s*)([\u2192\u21CC\u21D2\u2194\u2261]|->|=>|<->|<=)\s*/);
  const originalArrow = arrowMatch ? arrowMatch[2] : '->';
  
  // Store for later restoration
  // (This would need to be passed through or stored in a closure)
  
  // Normalize all arrows to -> for parsing
  let normalized = input
    .replace(/\u2192|\u21CC|\u21D2|\u2194|=>|<->|<=/g, '->')
    .replace(/\s*->\s*/g, '->');
  
  // Remove state symbols temporarily
  normalized = normalized.replace(/\(s\)|\(l\)|\(g\)|\(aq\)/g, '');
  
  // Store original arrow type for restoration
  // return { normalized, originalArrow };
  
  return normalized;
}

// Better approach: Return both normalized input and original arrow
function processEquationInput(input: string): { normalized: string; arrowType: string } {
  const arrowMatch = input.match(/(\s*)([\u2192\u21CC\u21D2\u2194\u2261]|->|=>|<->|<=)\s*/);
  const arrowType = arrowMatch ? arrowMatch[2] : '->';
  
  let normalized = input
    .replace(/\u2192|\u21CC|\u21D2|\u2194|=>|<->|<=/g, '->')
    .replace(/\s*->\s*/g, '->')
    .replace(/\(s\)|\(l\)|\(g\)|\(aq\)/g, '');
  
  return { normalized, arrowType };
}

function restoreArrowType(equation: string, arrowType: string): string {
  const arrowMap: Record<string, string> = {
    '->': '->',
    '\u2192': '\u2192',
    '\u21CC': '\u21CC',
    '\u21D2': '\u21D2',
    '\u2194': '\u2194',
    '=': '=',
    '=>': '\u2192',
    '<->': '\u2194',
    '<=>': '\u21CC',
  };
  
  const normalizedArrow = arrowMap[arrowType] || arrowType;
  
  // Replace all arrow variations with the original type
  return equation.replace(/->|\u2192|\u21CC|\u21D2|\u2194|=>|<->|<=>/g, normalizedArrow);
}
```

### 3. Navigation Component
```javascript
// src/components/Navigation.jsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };
  
  const navItems = [
    {
      path: '/',
      icon: '🔢',
      label: 'Math Lab',
      description: 'Algebra reasoning debugger'
    },
    {
      path: '/chemistry',
      icon: '🧪',
      label: 'Chemistry Lab',
      description: 'Equation balancer & tools'
    }
  ];
  
  return (
    <nav className="main-navbar" role="navigation" aria-label="Main navigation">
      <div className="nav-container">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
            aria-label={`${item.label}: ${item.description}`}
            aria-current={isActive(item.path) ? 'page' : undefined}
          >
            <span className="nav-icon" aria-hidden="true">{item.icon}</span>
            <span className="nav-text">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export default Navigation;
```

### 4. Copy Button Component
```javascript
// src/components/CopyButton.jsx
'use client';

import { useState } from 'react';

export function CopyButton({ textToCopy, children, className = '' }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(null);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setCopyError(null);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setCopyError('Failed to copy');
      setTimeout(() => setCopyError(null), 2000);
    }
  };
  
  return (
    <button
      onClick={handleCopy}
      className={`copy-btn ${className}`}
      aria-label={copied ? 'Copied to clipboard' : copyError || 'Copy to clipboard'}
      title={copied ? 'Copied!' : copyError || 'Copy to clipboard'}
    >
      {copied ? '✓ Copied!' : copyError || children || '📋 Copy'}
    </button>
  );
}

export default CopyButton;
```

---

## SUMMARY

### What Has Been Implemented
- ✅ Complete chemistry module structure
- ✅ Core engine (balancer, formula parser, calculator)
- ✅ UI components (5 components)
- ✅ Pages (dashboard, balance, calculator, viewer)
- ✅ Navigation link in ProofLab header
- ✅ 50 unit tests
- ✅ Build successful
- ✅ All 4 critical fixes implemented (arrow display, reversible arrows, navigation, auto-correction)
- ✅ Enhanced error messages

### Critical Issues to Fix - ALL RESOLVED ✅
1. **Arrow Display** - ✅ FIXED: Enhanced toLatex() in BalancedEquation.jsx with proper LaTeX arrow rendering
2. **Reversible Arrows** - ✅ FIXED: extractArrowType() and restoreArrowType() preserve ⇌ and other arrow types
3. **Navigation** - ✅ FIXED: Persistent navbar added via Navigation.jsx component in layout.tsx
4. **Auto-Correction** - ✅ FIXED: suggestCorrection() and getEnhancedErrorMessage() provide smart suggestions

### Recommended Next Steps
1. ✅ Completed: All 4 critical fixes implemented
2. ✅ Completed: All 9 polish features implemented (copy buttons, templates, autocomplete, periodic table)
3. Implement advanced features as time permits

### Estimated Total Development Time
- **Current Implementation:** ~8-10 hours (already done)
- **Critical Fixes:** ~1-2 hours (COMPLETED)
- **Polish Features:** ~3-4 hours (COMPLETED - all 9/9)
- **Advanced Features:** ~8-12 hours (optional)

**Total for Production-Ready:** ~12-16 hours
**Total for Full Feature Set:** ~20-28 hours

---

## IMPLEMENTATION CHECKLIST (Updated)

### Phase 1: Project Setup & Dependency Installation
- [x] 1.1 Create module structure
- [x] 1.2 Install dependencies with Bun
- [x] 1.3 Verify installation

### Phase 2: Core Chemistry Engine
- [x] 2.1 Implement equation balancer
- [x] 2.2 Implement formula parser
- [x] 2.3 Implement chemistry calculator
- [x] 2.4 Define TypeScript types

### Phase 3: User Interface Components
- [x] 3.1 Smart equation input component
- [x] 3.2 Balanced equation display
- [x] 3.3 Formula parser display
- [x] 3.4 3D molecule viewer
- [x] 3.5 Reaction classifier

### Phase 4: 3D Molecular Viewer
- [x] 4.1 Molecule viewer component
- [ ] 4.2 SMILES to 3D (optional)

### Phase 5: Pages & Routing
- [x] 5.1 Main dashboard page
- [x] 5.2 Balance page
- [x] 5.3 Calculator page
- [x] 5.4 Viewer page

### Phase 6: Testing
- [x] 6.1 Unit tests
- [x] 6.2 Run tests

### Phase 7: Build & Deployment
- [x] 7.1 Build for production
- [ ] 7.2 Start production server

### Phase 8: Polish & Improvements
- [x] 8.1 Fix arrow display in balanced equations
- [x] 8.2 Preserve reversible arrows (⇌)
- [x] 8.3 Add persistent navigation bar
- [x] 8.4 Add auto-correction suggestions
- [x] 8.5 Add copy buttons for results
- [x] 8.6 Add common equation templates
- [x] 8.7 Improve error messages
- [x] 8.8 Add formula autocomplete
- [x] 8.9 Add periodic table reference

### Phase 9: Advanced Features (Optional)
- [x] 9.1 Stoichiometry calculator
- [x] 9.2 Solution chemistry calculator
- [x] 9.3 Thermochemistry module
- [x] 9.4 Equilibrium constants
- [x] 9.5 Electrochemistry module
- [x] 9.6 Molecular geometry visualizer

---

## QUESTIONS FOR CLARIFICATION - ANSWERED & IMPLEMENTED

1. **Should we prioritize fixing the arrow display and navigation first?** 
   → YES - All 4 critical fixes have been prioritized and implemented

2. **Do you want all 4 critical fixes implemented immediately?** 
   → YES - All 4 fixes completed (arrow display, reversible arrows, navigation, auto-correction)

3. **Should the navbar replace the current ProofLab header or be additional?** 
   → ADDITIONAL - Navigation.jsx added to layout.tsx alongside existing header

4. **Any preference on which polish features to implement first?** 
   → IMPLEMENT ALL - All polish features to be implemented

5. **Should we add the calculator page features (already implemented) to the main dashboard?** 
   → NO - Calculator remains separate, not added to main dashboard

---

## NEXT STEPS

### All Polish Features Completed ✅
All 9 polish features have been implemented:
- [x] 8.1 Fix arrow display in balanced equations
- [x] 8.2 Preserve reversible arrows (⇌)
- [x] 8.3 Add persistent navigation bar
- [x] 8.4 Add auto-correction suggestions
- [x] 8.5 Add copy buttons for results
- [x] 8.6 Add common equation templates
- [x] 8.7 Improve error messages
- [x] 8.8 Add formula autocomplete
- [x] 8.9 Add periodic table reference

### Optional Advanced Features (All Implemented!)
- [x] 9.1 Stoichiometry calculator
- [x] 9.2 Solution chemistry calculator
- [x] 9.3 Thermochemistry module
- [x] 9.4 Equilibrium constants
- [x] 9.5 Electrochemistry module
- [x] 9.6 Molecular geometry visualizer

---

## IMPLEMENTATION NOTES (Post-Fix Analysis)

### Files Modified for Critical Fixes

#### 1. Arrow Display Fix (BalancedEquation.jsx)
**File:** `/home/red/Projects/ProofLab/src/components/chemistry/BalancedEquation.jsx`

**Changes:**
- Enhanced `toLatex()` function to properly convert all arrow types to LaTeX
- Added handling for: `->`, `→`, `⇌`, `⇒`, `=>`, `<->`, `<=>`, `↔`, `=`
- Improved spacing cleanup between coefficients and formulas
- Proper subscript formatting for element counts

**Example:** `2 H2 + O2 -> 2 H2O` now renders as `2H_2 + O_2 \rightarrow 2H_2O`

#### 2. Reversible Arrows Preservation (balancer.ts)
**File:** `/home/red/Projects/ProofLab/lib/chemistry/balancer.ts`

**Changes:**
- Added `extractArrowType()` function to identify and preserve original arrow type
- Added `restoreArrowType()` function to restore original arrow in balanced equation
- Modified `balanceEquation()` to track and preserve `arrowType` in result
- Added `suggestCorrection()` for auto-correction suggestions
- Added `getEnhancedErrorMessage()` for improved error handling

**Example:** `N2 + 3H2 ⇌ 2NH3` now maintains `⇌` instead of converting to `->`

#### 3. Navigation Component
**Files:**
- `/home/red/Projects/ProofLab/src/components/Navigation.jsx` (new)
- `/home/red/Projects/ProofLab/app/layout.tsx` (modified)
- `/home/red/Projects/ProofLab/src/App.jsx` (removed duplicate link)

**Changes:**
- Created reusable Navigation component with Math Lab and Chemistry Lab links
- Integrated into layout.tsx for persistence across all pages
- Uses usePathname() for active state highlighting
- Added proper ARIA labels for accessibility

#### 4. Auto-Correction & Enhanced Error Messages (balancer.ts)
**File:** `/home/red/Projects/ProofLab/lib/chemistry/balancer.ts`

**Changes:**
- Implemented `suggestCorrection()` with multiple correction types:
  - Missing arrow detection
  - Common typo fixes (H20 → H2O, CO → CO2, etc.)
  - Polyatomic ion corrections (OH → (OH))
  - State symbol suggestions
- Implemented `getEnhancedErrorMessage()` with:
  - Empty input detection
  - Missing arrow detection
  - Invalid character detection
  - Unknown element symbol detection

**Types:** `/home/red/Projects/ProofLab/lib/chemistry/types.ts`
- Added `Suggestion` interface for structured correction suggestions

#### 5. CSS Updates (chemistry.css)
**File:** `/home/red/Projects/ProofLab/src/chemistry.css`

**Added styles for:**
- `.main-navbar`, `.nav-container`, `.nav-link`, `.nav-icon`, `.nav-text`
- `.nav-link.active` state
- Responsive design considerations

---

## FILES MODIFIED SUMMARY

| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/chemistry/BalancedEquation.jsx` | Modified | Enhanced toLatex() for proper arrow rendering |
| `lib/chemistry/balancer.ts` | Modified | Added arrow preservation, suggestions, error messages |
| `lib/chemistry/types.ts` | Modified | Added Suggestion interface |
| `src/components/Navigation.jsx` | Created | Persistent navbar component |
| `app/layout.tsx` | Modified | Integrated Navigation component |
| `src/App.jsx` | Modified | Removed duplicate chemistry link |
| `src/chemistry.css` | Modified | Added navbar and related styles |
| `chemistry-plan.md` | Modified | Documentation updated (this file) |

---

## PHASE 9 ADVANCED FEATURES IMPLEMENTATION NOTES

### 9.1 Stoichiometry Calculator
**Files Created:**
- `lib/chemistry/stoichiometry.ts` - Core stoichiometry calculations
- `src/components/chemistry/StoichiometryCalculator.jsx` - React component with 4 tabs

**Features Implemented:**
- Molar mass calculation with element breakdown
- Stoichiometry calculations from balanced equations
- Limiting reactant identification with excess calculations
- Theoretical and percent yield calculations
- Integration with Autocomplete, PeriodicTable, CopyButton

**Dependencies:** `fast-balance` for equation balancing

---

### 9.2 Solution Chemistry Calculator
**Files Created:**
- `lib/chemistry/solution.ts` - Solution chemistry calculations
- `src/components/chemistry/SolutionCalculator.jsx` - React component with 5 tabs

**Features Implemented:**
- Molarity, dilution, and solution mixing calculations
- pH and [H+] concentration conversions
- Concentration unit conversions
- pH classification (acidic/neutral/basic)
- CopyButton integration for all results

---

### 9.3 Thermochemistry Module
**Files Created:**
- `lib/chemistry/thermochemistry.ts` - Thermochemistry calculations
- `src/components/chemistry/ThermochemistryCalculator.jsx` - React component with 4 tabs

**Features Implemented:**
- Reaction enthalpy from formation enthalpies
- Reaction enthalpy from bond energies
- Heat of combustion calculations
- Gibbs free energy calculations
- Delta G from equilibrium constant and vice versa
- Extensive standard enthalpy and bond energy database

---

### 9.4 Equilibrium Constants
**Files Created:**
- `lib/chemistry/equilibrium.ts` - Equilibrium calculations
- `src/components/chemistry/EquilibriumCalculator.jsx` - React component with 5 tabs

**Features Implemented:**
- Reaction quotient (Q) and equilibrium constant (K) calculations
- Weak acid/base pH calculations
- Buffer solution calculations (Henderson-Hasselbalch)
- Solubility product (Ksp) calculations
- Le Chatelier's principle analysis

---

### 9.5 Electrochemistry Module
**Files Created:**
- `lib/chemistry/electrochemistry.ts` - Electrochemistry calculations
- `src/components/chemistry/ElectrochemistryCalculator.jsx` - React component with 4 tabs

**Features Implemented:**
- Standard cell potential calculations
- Nernst equation for non-standard conditions
- Faraday's law calculations for electrolysis
- Battery voltage calculations
- Spontaneity determination
- Standard reduction potential database

---

### 9.6 Molecular Geometry Visualizer
**Files Created:**
- `lib/chemistry/geometry.ts` - VSEPR theory implementation
- `src/components/chemistry/GeometryVisualizer.jsx` - React component with 3 tabs

**Features Implemented:**
- Molecular geometry prediction from chemical formulas
- VSEPR theory database (Steric Numbers 2-6)
- Geometry lookup by steric number and lone pairs
- Complete VSEPR reference table
- Hybridization prediction (sp, sp², sp³, sp³d, sp³d²)
- Polarity prediction based on geometry and bonded atoms
- Bond angle information for each geometry
- Common examples for each geometry type
- ASCII structure visualization
- Integration with Autocomplete, PeriodicTable, CopyButton
- Three tabs: Predict Geometry, Geometry Lookup, Reference Table

**Geometries Supported:**
- Linear, Bent, Trigonal Planar, Tetrahedral
- Trigonal Pyramidal, Seesaw, T-shaped
- Trigonal Bipyramidal, Square Pyramidal, Square Planar, Octahedral

**VSEPR Theory:** Complete implementation with steric number, lone pairs, bonding pairs calculations


---

### 10. Reaction Predictor (NEW - Auto-Solve)
**Files Created:**
- `lib/chemistry/reactions.ts` - Reaction prediction engine
- Enhanced `src/components/chemistry/ReactionClassifier.jsx` - Now with auto-complete

**Features Implemented:**
- **Product Prediction**: Given reactants, automatically predicts products
- **Reaction Type Detection**: Classifies into combustion, acid-base, redox, precipitation, decomposition, synthesis, double-displacement
- **Auto-Complete Equations**: Converts reactants to full equations with predicted products
- **Reaction Database**: 40+ common reaction patterns with priority-based matching
- **Confidence Scoring**: Shows prediction confidence level
- **Similar Examples**: Displays similar reactions for reference
- **Auto-Balancing**: Can automatically balance predicted equations
- **Copy Functionality**: Copy predicted equations and products

**Reaction Types Supported:**
- Combustion (CH4 + O2 → CO2 + H2O)
- Acid-Base (HCl + NaOH → NaCl + H2O)
- Redox/Displacement (Zn + CuSO4 → ZnSO4 + Cu)
- Precipitation (AgNO3 + NaCl → AgCl + NaNO3)
- Decomposition (H2O2 → H2O + O2)
- Synthesis (2H2 + O2 → 2H2O)
- Double Displacement (NaCl + AgNO3 → AgCl + NaNO3)

**Example Usage:**
```javascript
import { predictProducts, autoCompleteEquation, getReactionInfo } from './lib/chemistry/reactions';

// Predict products from reactants
const result = predictProducts(['CH4', 'O2']);
// Returns: { products: ['CO2', 'H2O'], reactionType: 'combustion', confidence: 0.95 }

// Auto-complete to full equation
const complete = autoCompleteEquation(['CH4', 'O2']);
// Returns: { fullEquation: 'CH4 + O2 -> CO2 + H2O', products: [...], reactionType: 'combustion' }

// Get comprehensive reaction info
const info = getReactionInfo('CH4 + O2');
// Returns: { reactants: [...], products: [...], reactionType: 'combustion', ... }
```

**Integration:**
- Enhanced ReactionClassifier component now shows predictions when equation is incomplete
- Can apply predictions to fill in products
- Can auto-balance predicted equations
- Shows similar reaction examples for each type

---

## WHERE TO FIND ALL FEATURES

### Core Chemistry Features (app/chemistry/)
- **Main Dashboard**: `/chemistry` - Links to all chemistry tools
- **Equation Balancer**: `/chemistry/balance` - Balance equations with steps
- **Molar Mass Calculator**: `/chemistry/calculator` - Molar mass, stoichiometry, pH
- **3D Molecule Viewer**: `/chemistry/viewer` - 3D visualization of molecules

### Advanced Calculators (src/components/chemistry/)
- **StoichiometryCalculator.jsx** - Molar mass, stoichiometry, limiting reactant, theoretical yield
- **SolutionCalculator.jsx** - Molarity, dilution, mixing, conversions, pH
- **ThermochemistryCalculator.jsx** - Enthalpy, bond energy, Gibbs free energy, combustion
- **EquilibriumCalculator.jsx** - Q/K, weak acid/base pH, buffers, solubility, Le Chatelier
- **ElectrochemistryCalculator.jsx** - Cell potential, Nernst, Faraday's law, batteries
- **GeometryVisualizer.jsx** - VSEPR theory, molecular geometry, hybridization, polarity

### Shared Components (src/components/chemistry/)
- **BalancedEquation.jsx** - Displays balanced equations with LaTeX
- **EquationInput.jsx** - Smart equation input with templates
- **ReactionClassifier.jsx** - Classifies reactions + predicts products (ENHANCED)
- **FormulaParser.jsx** - Parses and displays formula breakdown
- **PeriodicTable.jsx** - Interactive periodic table
- **Autocomplete.jsx** - Formula autocomplete with element/compound suggestions
- **EquationTemplates.jsx** - Common equation templates
- **MoleculeViewer.jsx** - 3D molecule viewer
- **CopyButton.jsx** - Reusable copy-to-clipboard button

### Core Libraries (lib/chemistry/)
- **balancer.ts** - Equation balancing, arrow preservation, suggestions
- **calculator.ts** - Molar mass, pH calculations
- **formula.ts** - Formula parsing
- **stoichiometry.ts** - Stoichiometry calculations
- **solution.ts** - Solution chemistry calculations
- **thermochemistry.ts** - Thermochemistry calculations
- **equilibrium.ts** - Equilibrium calculations
- **electrochemistry.ts** - Electrochemistry calculations
- **geometry.ts** - VSEPR theory, molecular geometry
- **reactions.ts** - Reaction prediction, classification, auto-complete (NEW)
- **types.ts** - TypeScript interfaces

---

## BUG FIXES AND RESOLVED ISSUES

### ✅ Build Errors Fixed
1. ✅ **Duplicate `balanceWithSteps` definition** - Removed duplicate function export in balancer.ts
2. ✅ **Invalid regex in stoichiometry.ts** - Fixed regex `/[\u2192\u21CC\u21D2\u2194|=>|<->|<=]/g` by moving special characters outside character class: `/[\u2192\u21CC\u21D2\u2194]|=>|<->|<=/g`
3. ✅ **Invalid regex in StoichiometryCalculator.jsx** - Applied same fix to the React component
4. ✅ **Missing GeometryVisualizer.jsx** - Recreated the component with proper JSX syntax
5. ✅ **JSX syntax error in ReactionClassifier.jsx** - Fixed by ensuring proper fragment wrapping for list items

### ✅ Import/Export Issues Fixed
1. ✅ **GeometryVisualizer export** - Added to index.js exports
2. ✅ **All chemistry module exports** - Verified exports for balancer, reactions, stoichiometry, geometry, thermochemistry, equilibrium, electrochemistry

---

## COMPLETE FEATURE SUMMARY

### ✅ All Phase 8 Polish Features (9/9 Complete)
1. ✅ Arrow display in balanced equations
2. ✅ Reversible arrows (⇌) preservation
3. ✅ Persistent navigation bar
4. ✅ Auto-correction suggestions
5. ✅ Copy buttons for results
6. ✅ Common equation templates
7. ✅ Improved error messages
8. ✅ Formula autocomplete
9. ✅ Periodic table reference

### ✅ All Phase 9 Advanced Features (6/6 Complete)
1. ✅ Stoichiometry calculator
2. ✅ Solution chemistry calculator
3. ✅ Thermochemistry module
4. ✅ Equilibrium constants
5. ✅ Electrochemistry module
6. ✅ Molecular geometry visualizer

### ✅ New Phase 10 Features (1/1 Complete)
1. ✅ Reaction predictor with auto-complete

**Total: 16/16 chemistry features implemented and working!**

---

## QUICK START GUIDE

### For Students:
1. Go to `/chemistry` for the main dashboard
2. Use **Equation Balancer** to balance chemical equations
3. Use **Stoichiometry Calculator** for mole/mass calculations
4. Use **Reaction Classifier** to identify reaction types and get product predictions
5. Use **Molecular Geometry Visualizer** to predict molecular shapes
6. Use **3D Molecule Viewer** to see molecules in 3D

### For Developers:
```bash
# All chemistry imports are available from:
import { 
  balanceEquation, 
  classifyReaction,
  suggestCorrection,
  getEnhancedErrorMessage 
} from './lib/chemistry/balancer';

import { 
  predictProducts, 
  autoCompleteEquation,
  getReactionInfo,
  getReactionExamples 
} from './lib/chemistry/reactions';

import { 
  calculateMolarMass,
  calculateStoichiometry,
  findLimitingReactant,
  calculateTheoreticalYield 
} from './lib/chemistry/stoichiometry';

import { 
  calculateMolecularGeometry,
  predictHybridization,
  predictPolarity,
  getGeometryExamples,
  getAllGeometries 
} from './lib/chemistry/geometry';
```

---

**Build Status**: ✅ Successful | **Last Updated**: 2026-07-18 | All bugs fixed, all features working
