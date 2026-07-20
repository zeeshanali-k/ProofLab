'use client';

import { useState } from 'react';
import { getMolarMass, calculatePH, calculateHPlusFromPH, calculateMass, calculateMolesFromMass } from '../../../lib/chemistry/calculator';
import FormulaParser from '../../../src/components/chemistry/FormulaParser';
import MathDisplay from '../../../src/components/MathDisplay';

interface MolarMassResult {
	formula: string;
	molarMass: number;
	breakdown: Array<{ element: string; count: number; mass: number }>;
}

export default function CalculatorPage() {
	const [activeTab, setActiveTab] = useState<'molar-mass' | 'ph' | 'stoichiometry'>('molar-mass');
	const [molarMassInput, setMolarMassInput] = useState('');
	const [molarMassResult, setMolarMassResult] = useState<MolarMassResult | null>(null);
	const [phInput, setPhInput] = useState('');
	const [phResult, setPhResult] = useState<{ ph: number; concentration: number } | null>(null);
	const [massInput, setMassInput] = useState({ formula: '', mass: '', moles: '' });
	const [massResult, setMassResult] = useState<{ formula: string; molarMass: number; mass?: number; moles?: number; verified?: boolean } | null>(null);
	
	// Calculate molar mass
	const handleMolarMass = () => {
		if (!molarMassInput.trim()) return;
		const result = getMolarMass(molarMassInput);
		setMolarMassResult(result);
	};
	
	// Calculate pH
	const handlePH = () => {
		if (phInput === '') return;
		const concentration = parseFloat(phInput);
		if (isNaN(concentration)) return;
		const ph = calculatePH(concentration);
		setPhResult({ ph, concentration });
	};
	
	const handleReversePH = () => {
		if (phInput === '') return;
		const ph = parseFloat(phInput);
		if (isNaN(ph)) return;
		const concentration = calculateHPlusFromPH(ph);
		setPhResult({ ph, concentration });
	};
	
	// Calculate mass/moles
	const handleMassCalculation = () => {
		const { formula, mass, moles } = massInput;
		if (!formula.trim()) return;
		
		const molarMass = getMolarMass(formula).molarMass;
		
		if (mass && moles) {
			// Both provided - verify they match
			const expectedMoles = calculateMolesFromMass(parseFloat(mass), molarMass);
			const expectedMass = calculateMass(parseFloat(moles), molarMass);
			setMassResult({
				formula,
				molarMass,
				mass: parseFloat(mass),
				moles: parseFloat(moles),
				verified: Math.abs(expectedMoles - parseFloat(moles)) < 0.01
			});
		} else if (mass) {
			// Calculate moles from mass
			const molesCalc = calculateMolesFromMass(parseFloat(mass), molarMass);
			setMassResult({
				formula,
				molarMass,
				mass: parseFloat(mass),
				moles: molesCalc
			});
		} else if (moles) {
			// Calculate mass from moles
			const massCalc = calculateMass(parseFloat(moles), molarMass);
			setMassResult({
				formula,
				molarMass,
				mass: massCalc,
				moles: parseFloat(moles)
			});
		}
	};
	
	return (
		<main className="chemistry-page calculator-page">
			<div className="page-header">
				<h1>📊 Molar Mass & Stoichiometry Calculator</h1>
				<p className="page-description">
					Calculate molar masses, pH, and perform stoichiometric calculations.
				</p>
			</div>
			
			<div className="calculator-tabs">
				<button 
					className={`tab-btn ${activeTab === 'molar-mass' ? 'active' : ''}`}
					onClick={() => setActiveTab('molar-mass')}
				>
					Molar Mass
				</button>
				<button 
					className={`tab-btn ${activeTab === 'ph' ? 'active' : ''}`}
					onClick={() => setActiveTab('ph')}
				>
					pH Calculator
				</button>
				<button 
					className={`tab-btn ${activeTab === 'stoichiometry' ? 'active' : ''}`}
					onClick={() => setActiveTab('stoichiometry')}
				>
					Mass/Moles
				</button>
			</div>
			
			<div className="calculator-content">
				{activeTab === 'molar-mass' && (
					<div className="molar-mass-calculator">
						<h2>Molar Mass Calculator</h2>
						<div className="input-group">
							<input
								type="text"
								value={molarMassInput}
								onChange={(e) => setMolarMassInput(e.target.value)}
								placeholder="e.g., C2H5OH"
								className="calculator-input"
							/>
							<button onClick={handleMolarMass} className="calculator-btn">
								Calculate
							</button>
						</div>
						
						{molarMassResult && (
							<div className="molar-mass-result">
								<h3>Result for {molarMassResult.formula}</h3>
								<div className="result-main">
									Molar Mass: <strong>{molarMassResult.molarMass.toFixed(3)} g/mol</strong>
								</div>
								
								<h4>Element Breakdown:</h4>
								<table className="breakdown-table">
									<thead>
										<tr>
											<th>Element</th>
											<th>Count</th>
											<th>Mass Contribution (g/mol)</th>
										</tr>
									</thead>
									<tbody>
										{molarMassResult.breakdown.map((item, index) => (
											<tr key={index}>
												<td>{item.element}</td>
												<td>{item.count}</td>
												<td>{item.mass.toFixed(3)}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				)}
				
				{activeTab === 'ph' && (
					<div className="ph-calculator">
						<h2>pH Calculator</h2>
						<div className="ph-options">
							<div className="ph-option">
								<label>
									<input 
										type="radio" 
										name="ph-mode"
										checked={true}
									/>
									From [H+] concentration
								</label>
								<div className="input-group">
									<input
										type="text"
										value={phInput}
										onChange={(e) => setPhInput(e.target.value)}
										placeholder="e.g., 0.001 (for [H+] = 0.001 M)"
										className="ph-input"
									/>
									<button onClick={handlePH} className="ph-btn">
										Calculate pH
									</button>
								</div>
							</div>
							
							<div className="ph-option">
								<label>
									<input 
										type="radio" 
										name="ph-mode"
									/>
									From pH value
								</label>
								<div className="input-group">
									<input
										type="text"
										value={phInput}
										onChange={(e) => setPhInput(e.target.value)}
										placeholder="e.g., 3"
										className="ph-input"
									/>
									<button onClick={handleReversePH} className="ph-btn">
										Calculate [H+]
									</button>
								</div>
							</div>
						</div>
						
						{phResult && (
							<div className="ph-result">
								<h3>Result</h3>
								<div className="result-grid">
									<div className="result-item">
										<span className="result-label">[H+] Concentration:</span>
										<span className="result-value">
											<MathDisplay math={`[H^+] = ${phResult.concentration.toExponential(3)} M`} />
										</span>
									</div>
									<div className="result-item">
										<span className="result-label">pH:</span>
										<span className="result-value"><MathDisplay math={`pH = ${phResult.ph.toFixed(2)}`} /></span>
									</div>
									<div className="result-item">
										<span className="result-label">pOH:</span>
										<span className="result-value">
											<MathDisplay math={`pOH = ${(14 - phResult.ph).toFixed(2)}`} />
										</span>
									</div>
								</div>
								
								<div className="ph-classification">
									{phResult.ph < 7 && <span className="ph-acid">🔴 Acidic Solution</span>}
									{phResult.ph === 7 && <span className="ph-neutral">🟢 Neutral Solution</span>}
									{phResult.ph > 7 && <span className="ph-base">🔵 Basic (Alkaline) Solution</span>}
								</div>
							</div>
						)}
					</div>
				)}
				
				{activeTab === 'stoichiometry' && (
					<div className="stoichiometry-calculator">
						<h2>Mass & Moles Calculator</h2>
						<div className="stoich-form">
							<div className="form-group">
								<label>Chemical Formula</label>
								<input
									type="text"
									value={massInput.formula}
									onChange={(e) => setMassInput({ ...massInput, formula: e.target.value })}
									placeholder="e.g., H2O"
									className="stoich-input"
								/>
							</div>
							
							<div className="form-row">
								<div className="form-group">
									<label>Mass (g)</label>
									<input
										type="number"
										value={massInput.mass}
										onChange={(e) => setMassInput({ ...massInput, mass: e.target.value })}
										placeholder="Enter mass"
										className="stoich-input"
									/>
								</div>
								
								<div className="form-group">
									<label>Moles</label>
									<input
										type="number"
										value={massInput.moles}
										onChange={(e) => setMassInput({ ...massInput, moles: e.target.value })}
										placeholder="Enter moles"
										className="stoich-input"
									/>
								</div>
							</div>
							
							<button onClick={handleMassCalculation} className="stoich-calc-btn">
								Calculate
							</button>
						</div>
						
						{massResult && (
							<div className="stoich-result">
								<h3>Result for {massResult.formula}</h3>
								<div className="stoich-info">
									<p>Molar Mass: <strong>{massResult.molarMass.toFixed(3)} g/mol</strong></p>
									<p>
										Mass: <strong>{massResult.mass?.toFixed(3)} g</strong>
									</p>
									<p>
										Moles: <strong>{massResult.moles?.toFixed(6)} mol</strong>
									</p>
									{massResult.verified && (
										<p className="verified">✓ Values are consistent with the formula</p>
									)}
								</div>
							</div>
						)}
					</div>
				)}
			</div>
			
			<div className="formula-parser-section">
				<h3>📋 Formula Parser</h3>
				<FormulaParser />
			</div>
		</main>
	);
}
