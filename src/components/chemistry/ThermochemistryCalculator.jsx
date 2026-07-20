'use client';

import { useState } from 'react';
import MathDisplay from '../MathDisplay';
import CopyButton from '../CopyButton';
import Autocomplete from './Autocomplete';
import {
	calculateReactionEnthalpy,
	calculateReactionEnthalpyFromBonds,
	calculateHeatOfCombustion,
	calculateGibbsFreeEnergy,
	calculateEquilibriumConstantFromDeltaG,
	calculateDeltaGFromEquilibriumConstant,
	getStandardEnthalpy,
	getBondEnergy,
	STANDARD_ENTHALPIES,
	BOND_ENERGIES
} from '../../../lib/chemistry/thermochemistry';

export function ThermochemistryCalculator() {
	const [activeTab, setActiveTab] = useState('enthalpy');
	
	// Enthalpy calculator state
	const [reactants, setReactants] = useState('H2(g) + Cl2(g)');
	const [products, setProducts] = useState('HCl(g)');
	
	// Bond energy calculator state
	const [bondsBroken, setBondsBroken] = useState('H-H,Cl-Cl');
	const [bondsFormed, setBondsFormed] = useState('H-Cl');
	
	// Heat of combustion state
	const [fuelFormula, setFuelFormula] = useState('CH4(g)');
	const [fuelMoles, setFuelMoles] = useState('1');
	
	// Gibbs free energy state
	const [deltaH, setDeltaH] = useState('-100');
	const [deltaS, setDeltaS] = useState('50');
	const [temperature, setTemperature] = useState('298.15');
	const [equilibriumConstant, setEquilibriumConstant] = useState('1');
	
	// Results state
	const [enthalpyResult, setEnthalpyResult] = useState(null);
	const [bondEnergyResult, setBondEnergyResult] = useState(null);
	const [combustionResult, setCombustionResult] = useState(null);
	const [gibbsResult, setGibbsResult] = useState(null);
	const [deltaGResult, setDeltaGResult] = useState(null);
	
	// Error state
	const [error, setError] = useState('');
	const [showCompoundList, setShowCompoundList] = useState(false);

	// Available compounds for autocomplete
	const availableCompounds = Object.keys(STANDARD_ENTHALPIES);
	const availableBonds = Object.keys(BOND_ENERGIES);

	// Format number for display
	const formatNumber = (num, decimals = 2) => {
		if (num === null || num === undefined) return '0';
		if (Math.abs(num) > 1000) return num.toExponential(decimals);
		return num.toFixed(decimals);
	};

	// Parse reactants and products
	const parseSpecies = (speciesString) => {
		// Simple parser for "2H2(g) + O2(g)" -> [{formula: 'H2(g)', coefficient: 2}, {formula: 'O2(g)', coefficient: 1}]
		const species = speciesString
			.split('+')
			.map(s => s.trim())
			.filter(s => s.length > 0);
		
		return species.map(species => {
			const match = species.match(/^(\d*)(.+)$/);
			const coefficient = match?.[1] ? parseInt(match[1]) : 1;
			const formula = match?.[2] || species;
			return { formula, coefficient };
		});
	};

	// Calculate reaction enthalpy from formation enthalpies
	const handleCalculateEnthalpy = () => {
		setError('');
		try {
			const reactantSpecies = parseSpecies(reactants);
			const productSpecies = parseSpecies(products);
			
			const result = calculateReactionEnthalpy(reactantSpecies, productSpecies);
			setEnthalpyResult(result);
		} catch (err) {
			setError('Invalid input');
			setEnthalpyResult(null);
		}
	};

	// Calculate reaction enthalpy from bond energies
	const handleCalculateBondEnergy = () => {
		setError('');
		try {
			const broken = bondsBroken.split(',').map(b => b.trim()).filter(b => b.length > 0);
			const formed = bondsFormed.split(',').map(b => b.trim()).filter(b => b.length > 0);
			
			const result = calculateReactionEnthalpyFromBonds(broken, formed);
			setBondEnergyResult(result);
		} catch (err) {
			setError('Invalid input');
			setBondEnergyResult(null);
		}
	};

	// Calculate heat of combustion
	const handleCalculateCombustion = () => {
		setError('');
		try {
			const result = calculateHeatOfCombustion(fuelFormula, parseFloat(fuelMoles));
			setCombustionResult(result);
		} catch (err) {
			setError('Invalid input');
			setCombustionResult(null);
		}
	};

	// Calculate Gibbs free energy
	const handleCalculateGibbs = () => {
		setError('');
		try {
			const result = calculateGibbsFreeEnergy(
				parseFloat(deltaH),
				parseFloat(temperature),
				parseFloat(deltaS)
			);
			setGibbsResult(result);
			
			// Also calculate equilibrium constant
			const K = calculateEquilibriumConstantFromDeltaG(
				parseFloat(deltaH),
				parseFloat(temperature),
				parseFloat(deltaS)
			);
			setDeltaGResult({ ...result, K });
		} catch (err) {
			setError('Invalid input');
			setGibbsResult(null);
			setDeltaGResult(null);
		}
	};

	// Calculate deltaG from K
	const handleCalculateDeltaGFromK = () => {
		setError('');
		try {
			const deltaG = calculateDeltaGFromEquilibriumConstant(
				parseFloat(equilibriumConstant),
				parseFloat(temperature)
			);
			const gibbs = calculateGibbsFreeEnergy(
				deltaG,
				parseFloat(temperature),
				0 // ΔS = 0 for this calculation
			);
			setDeltaGResult({ ...gibbs, K: parseFloat(equilibriumConstant) });
			setGibbsResult(null);
		} catch (err) {
			setError('Invalid input');
			setDeltaGResult(null);
			setGibbsResult(null);
		}
	};

	// Format formula for display
	const formatFormula = (formula) => {
		if (!formula) return formula;
		return formula.replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}');
	};

	// Render enthalpy calculator
	const renderEnthalpyCalculator = () => (
		<div className="calculator-section">
			<h3>Reaction Enthalpy Calculator</h3>
			<p className="calculator-description">
				Calculate ΔH° reaction from standard enthalpies of formation
			</p>
			
			<div className="input-grid">
				<div className="input-item full-width">
					<label>Reactants (e.g., 2H2(g) + O2(g)):</label>
					<input
						type="text"
						value={reactants}
						onChange={(e) => setReactants(e.target.value)}
						placeholder="e.g., H2(g) + Cl2(g)"
						className="equation-input"
					/>
					<button 
						onClick={() => setShowCompoundList(!showCompoundList)}
						className="compound-list-btn"
					>
						{showCompoundList ? 'Hide Compounds' : 'Show Compounds'}
					</button>
				</div>
				
				{showCompoundList && (
					<div className="compound-list">
						<h5>Available Compounds:</h5>
						<div className="compound-grid">
							{availableCompounds.slice(0, 50).map(compound => (
								<button
									key={compound}
									onClick={() => {
										setReactants(prev => prev + (prev.length > 0 && !prev.endsWith('+') ? ' + ' : '') + compound);
										setShowCompoundList(false);
									}}
									className="compound-item"
								>
									{compound}
								</button>
							))}
						</div>
					</div>
				)}
				
				<div className="input-item full-width">
					<label>Products (e.g., 2HCl(g)):</label>
					<input
						type="text"
						value={products}
						onChange={(e) => setProducts(e.target.value)}
						placeholder="e.g., 2HCl(g)"
						className="equation-input"
					/>
				</div>
			</div>
			
			<button onClick={handleCalculateEnthalpy} className="calculate-btn">
				Calculate ΔH° reaction
			</button>
			
			{enthalpyResult && (
				<div className="result-card">
					<h4>Results</h4>
					
					<div className="reaction-summary">
						<div className="reaction-equation">
							<span className="side">{reactants}</span>
							<span className="arrow">→</span>
							<span className="side">{products}</span>
						</div>
					</div>
					
					<div className={`result-item ${enthalpyResult.reactionEnthalpy < 0 ? 'exothermic' : 'endothermic'}`}>
						<span className="label">ΔH° reaction:</span>
						<span className="value highlight">
							{formatNumber(enthalpyResult.reactionEnthalpy, 2)} kJ/mol
						</span>
						<CopyButton 
							textToCopy={`ΔH° = ${enthalpyResult.reactionEnthalpy.toFixed(2)} kJ/mol`} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className="enthalpy-details">
						<h5>Formation Enthalpies:</h5>
						<div className="enthalpy-grid">
							<div className="grid-header">
								<span>Species</span>
								<span>ΔH°f (kJ/mol)</span>
							</div>
							{Object.entries(enthalpyResult.formationEnthalpies).map(([species, enthalpy]) => (
								<div key={species} className="grid-row">
									<span>{species}</span>
									<span>{formatNumber(enthalpy, 2)}</span>
								</div>
							))}
						</div>
					</div>
					
					<div className="thermo-note">
						{enthalpyResult.reactionEnthalpy < 0 ? 
							'✓ Exothermic reaction (releases heat)' : 
							'✗ Endothermic reaction (absorbs heat)'}
					</div>
				</div>
			)}
		</div>
	);

	// Render bond energy calculator
	const renderBondEnergyCalculator = () => (
		<div className="calculator-section">
			<h3>Bond Energy Calculator</h3>
			<p className="calculator-description">
				Calculate ΔH° reaction from bond energies
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Bonds Broken (e.g., H-H, Cl-Cl):</label>
					<input
						type="text"
						value={bondsBroken}
						onChange={(e) => setBondsBroken(e.target.value)}
						placeholder="e.g., H-H, Cl-Cl"
						className="bonds-input"
					/>
					<div className="bond-hint">Comma-separated list of bonds</div>
				</div>
				<div className="input-item">
					<label>Bonds Formed (e.g., H-Cl):</label>
					<input
						type="text"
						value={bondsFormed}
						onChange={(e) => setBondsFormed(e.target.value)}
						placeholder="e.g., H-Cl"
						className="bonds-input"
					/>
					<div className="bond-hint">Comma-separated list of bonds</div>
				</div>
			</div>
			
			<div className="bond-list-preview">
				<div className="bond-section">
					<h5>Available Bonds:</h5>
					<div className="bond-tags">
						{availableBonds.slice(0, 20).map(bond => (
							<button
								key={bond}
								onClick={() => setBondsBroken(prev => prev + (prev.length > 0 ? ', ' : '') + bond)}
								className="bond-tag"
							>
								{bond}
							</button>
						))}
					</div>
				</div>
			</div>
			
			<button onClick={handleCalculateBondEnergy} className="calculate-btn">
				Calculate ΔH° reaction
			</button>
			
			{bondEnergyResult && (
				<div className="result-card">
					<h4>Results</h4>
					
					<div className="bond-summary">
						<div className="bond-section">
							<h5>Bonds Broken (absorbs energy):</h5>
							<div className="bond-list">
								{bondsBroken.split(',').map(b => b.trim()).filter(b => b.length > 0).map(bond => (
									<div key={bond} className="bond-item">
										<span className="bond-name">{bond}</span>
										<span className="bond-energy">+{getBondEnergy(bond)} kJ/mol</span>
									</div>
								))}
							</div>
							<div className="bond-total">
								Total: +{Object.values(bondEnergyResult.bondEnergies).reduce((a, b) => a + b, 0)} kJ
							</div>
						</div>
						
						<div className="bond-section">
							<h5>Bonds Formed (releases energy):</h5>
							<div className="bond-list">
								{bondsFormed.split(',').map(b => b.trim()).filter(b => b.length > 0).map(bond => (
									<div key={bond} className="bond-item">
										<span className="bond-name">{bond}</span>
										<span className="bond-energy">-{getBondEnergy(bond)} kJ/mol</span>
									</div>
								))}
							</div>
							<div className="bond-total">
								Total: -{Object.values(bondEnergyResult.bondEnergies).reduce((a, b) => a + b, 0)} kJ
							</div>
						</div>
					</div>
					
					<div className={`result-item ${bondEnergyResult.reactionEnthalpy < 0 ? 'exothermic' : 'endothermic'}`}>
						<span className="label">ΔH° reaction (from bonds):</span>
						<span className="value highlight">{formatNumber(bondEnergyResult.reactionEnthalpy, 2)} kJ/mol</span>
						<CopyButton 
							textToCopy={`ΔH° = ${bondEnergyResult.reactionEnthalpy.toFixed(2)} kJ/mol (from bonds)`} 
							className="copy-value-btn"
						/>
					</div>
				</div>
			)}
		</div>
	);

	// Render heat of combustion calculator
	const renderCombustionCalculator = () => (
		<div className="calculator-section">
			<h3>Heat of Combustion Calculator</h3>
			<p className="calculator-description">
				Calculate the heat released when a fuel combusts completely
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Fuel Formula:</label>
					<select 
						value={fuelFormula} 
						onChange={(e) => setFuelFormula(e.target.value)}
						className="formula-select"
					>
						{availableCompounds
							.filter(c => c.includes('C') || c.includes('H'))
							.map(compound => (
								<option key={compound} value={compound}>{compound}</option>
							))}
					</select>
				</div>
				<div className="input-item">
					<label>Moles of Fuel:</label>
					<input
						type="number"
						value={fuelMoles}
						onChange={(e) => setFuelMoles(e.target.value)}
						placeholder="e.g., 1"
						className="number-input"
						step="0.1"
						min="0"
					/>
				</div>
			</div>
			
			<button onClick={handleCalculateCombustion} className="calculate-btn">
				Calculate Heat of Combustion
			</button>
			
			{combustionResult !== null && (
				<div className="result-card">
					<h4>Results</h4>
					
					<div className="result-item">
						<span className="label">Fuel:</span>
						<MathDisplay math={formatFormula(fuelFormula)} />
					</div>
					
					<div className="result-item">
						<span className="label">Standard Enthalpy:</span>
						<span className="value">{formatNumber(getStandardEnthalpy(fuelFormula), 2)} kJ/mol</span>
					</div>
					
					<div className="result-item highlight">
						<span className="label">Heat of Combustion:</span>
						<span className="value">{formatNumber(combustionResult, 2)} kJ</span>
						<CopyButton 
							textToCopy={`ΔH° combustion = ${combustionResult.toFixed(2)} kJ for ${fuelMoles} mol ${fuelFormula}`} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className="thermo-note">
						✓ Combustion is typically exothermic (negative ΔH°)
					</div>
				</div>
			)}
		</div>
	);

	// Render Gibbs free energy calculator
	const renderGibbsCalculator = () => (
		<div className="calculator-section">
			<h3>Gibbs Free Energy Calculator</h3>
			<p className="calculator-description">
				Calculate ΔG° = ΔH° - TΔS° and equilibrium constant
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>ΔH° (kJ/mol):</label>
					<input
						type="number"
						value={deltaH}
						onChange={(e) => setDeltaH(e.target.value)}
						placeholder="e.g., -100"
						className="number-input"
						step="0.1"
					/>
				</div>
				<div className="input-item">
					<label>ΔS° (J/mol·K):</label>
					<input
						type="number"
						value={deltaS}
						onChange={(e) => setDeltaS(e.target.value)}
						placeholder="e.g., 50"
						className="number-input"
						step="0.1"
					/>
				</div>
				<div className="input-item">
					<label>Temperature (K):</label>
					<input
						type="number"
						value={temperature}
						onChange={(e) => setTemperature(e.target.value)}
						placeholder="e.g., 298.15"
						className="number-input"
						step="0.1"
						min="0"
					/>
				</div>
			</div>
			
			<div className="button-group">
				<button onClick={handleCalculateGibbs} className="calculate-btn">
					Calculate ΔG° and K
				</button>
				<button onClick={handleCalculateDeltaGFromK} className="calculate-btn secondary">
					Calculate ΔG° from K
				</button>
			</div>
			
			<div className="input-grid">
				<div className="input-item full-width">
					<label>Equilibrium Constant (K):</label>
					<input
						type="number"
						value={equilibriumConstant}
						onChange={(e) => setEquilibriumConstant(e.target.value)}
						placeholder="e.g., 1"
						className="number-input"
						step="0.1"
						min="0"
					/>
				</div>
			</div>
			
			{(gibbsResult || deltaGResult) && (
				<div className="result-card">
					<h4>Results</h4>
					
					{deltaGResult && (
						<>
							<div className="result-item">
								<span className="label">ΔH°:</span>
								<span className="value">{formatNumber(deltaGResult.deltaH || parseFloat(deltaH), 2)} kJ/mol</span>
							</div>
							<div className="result-item">
								<span className="label">TΔS°:</span>
								<span className="value">{formatNumber(parseFloat(temperature) * parseFloat(deltaS) / 1000, 2)} kJ/mol</span>
							</div>
							
							<div className={`result-item ${deltaGResult.gibbs < 0 ? 'spontaneous' : 'nonspontaneous'}`}>
								<span className="label">ΔG°:</span>
								<span className="value highlight">{formatNumber(deltaGResult.gibbs, 2)} kJ/mol</span>
								<CopyButton 
									textToCopy={`ΔG° = ${deltaGResult.gibbs.toFixed(2)} kJ/mol`} 
									className="copy-value-btn"
								/>
							</div>
							
							<div className="result-item">
								<span className="label">Equilibrium Constant (K):</span>
								<span className="value highlight">{formatNumber(deltaGResult.K, 4)}</span>
								<CopyButton 
									textToCopy={`K = ${deltaGResult.K.toFixed(4)}`} 
									className="copy-value-btn"
								/>
							</div>
							
							<div className="gibbs-note">
								{deltaGResult.gibbs < 0 ? 
									'✓ Spontaneous reaction (K > 1, products favored)' : 
									'✗ Non-spontaneous reaction (K < 1, reactants favored)'}
							</div>
						</>
					)}
					
					{gibbsResult && !deltaGResult && (
						<div className="result-item">
							<span className="label">ΔG°:</span>
							<span className="value highlight">{formatNumber(gibbsResult, 2)} kJ/mol</span>
						</div>
					)}
				</div>
			)}
		</div>
	);

	return (
		<div className="thermochemistry-calculator-container">
			<div className="calculator-tabs">
				<button 
					className={`tab-btn ${activeTab === 'enthalpy' ? 'active' : ''}`}
					onClick={() => setActiveTab('enthalpy')}
				>
					Reaction Enthalpy
				</button>
				<button 
					className={`tab-btn ${activeTab === 'bonds' ? 'active' : ''}`}
					onClick={() => setActiveTab('bonds')}
				>
					Bond Energies
				</button>
				<button 
					className={`tab-btn ${activeTab === 'combustion' ? 'active' : ''}`}
					onClick={() => setActiveTab('combustion')}
				>
					Heat of Combustion
				</button>
				<button 
					className={`tab-btn ${activeTab === 'gibbs' ? 'active' : ''}`}
					onClick={() => setActiveTab('gibbs')}
				>
					Gibbs Free Energy
				</button>
			</div>
			
			<div className="calculator-content">
				{activeTab === 'enthalpy' && renderEnthalpyCalculator()}
				{activeTab === 'bonds' && renderBondEnergyCalculator()}
				{activeTab === 'combustion' && renderCombustionCalculator()}
				{activeTab === 'gibbs' && renderGibbsCalculator()}
			</div>
			
			{error && (
				<div className="error-message">{error}</div>
			)}
		</div>
	);
}

export default ThermochemistryCalculator;
