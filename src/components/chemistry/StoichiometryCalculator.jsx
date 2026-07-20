'use client';

import { useState } from 'react';
import MathDisplay from '../MathDisplay';
import CopyButton from '../CopyButton';
import Autocomplete from './Autocomplete';
import PeriodicTable from './PeriodicTable';
import {
	calculateStoichiometry,
	findLimitingReactant,
	calculateTheoreticalYield,
	calculatePercentYield,
	calculateMolarMass
} from '../../../lib/chemistry/stoichiometry';

export function StoichiometryCalculator() {
	const [activeTab, setActiveTab] = useState('molarMass');
	const [equation, setEquation] = useState('H2 + O2 -> H2O');
	const [formula, setFormula] = useState('H2O');
	const [mass, setMass] = useState('10');
	const [givenSpecies, setGivenSpecies] = useState('H2');
	const [targetProduct, setTargetProduct] = useState('H2O');
	const [limitingReactant, setLimitingReactant] = useState('H2');
	const [actualYield, setActualYield] = useState('8.5');
	
	// Results state
	const [molarMassResult, setMolarMassResult] = useState(null);
	const [stoichResult, setStoichResult] = useState(null);
	const [limitingResult, setLimitingResult] = useState(null);
	const [yieldResult, setYieldResult] = useState(null);
	const [percentYield, setPercentYield] = useState(null);
	
	// Error state
	const [error, setError] = useState('');
	const [showPeriodicTable, setShowPeriodicTable] = useState(false);

	// Format formula for display
	const formatFormula = (formula) => {
		if (!formula) return formula;
		return formula.replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}');
	};

	// Calculate molar mass
	const handleCalculateMolarMass = () => {
		setError('');
		try {
			const result = calculateMolarMass(formula);
			setMolarMassResult(result);
		} catch (err) {
			setError('Invalid formula');
			setMolarMassResult(null);
		}
	};

	// Calculate stoichiometry
	const handleCalculateStoichiometry = () => {
		setError('');
		try {
			const result = calculateStoichiometry(
				equation,
				parseFloat(mass),
				givenSpecies
			);
			if (result.isValid) {
				setStoichResult(result);
			} else {
				setError(result.error || 'Invalid input');
				setStoichResult(null);
			}
		} catch (err) {
			setError('Error calculating stoichiometry');
			setStoichResult(null);
		}
	};

	// Find limiting reactant
	const handleFindLimitingReactant = () => {
		setError('');
		try {
			// Parse masses from input (format: H2:5,O2:10)
			const massPairs = limitingReactant.split(',').map(s => s.trim());
			const masses = {};
			for (const pair of massPairs) {
				const [species, mass] = pair.split(':');
				if (species && mass) {
					masses[species.trim()] = parseFloat(mass.trim());
				}
			}
			
			const result = findLimitingReactant(equation, masses);
			if (result.isValid) {
				setLimitingResult(result);
			} else {
				setError(result.error || 'Invalid input');
				setLimitingResult(null);
			}
		} catch (err) {
			setError('Error finding limiting reactant');
			setLimitingResult(null);
		}
	};

	// Calculate theoretical yield
	const handleCalculateTheoreticalYield = () => {
		setError('');
		try {
			const result = calculateTheoreticalYield(
				equation,
				parseFloat(mass),
				limitingReactant,
				targetProduct
			);
			if (result.isValid) {
				setYieldResult(result);
				// Calculate percent yield if actual yield is provided
				if (actualYield) {
					const percent = calculatePercentYield(
						result.theoreticalYield || 0,
						parseFloat(actualYield)
					);
					setPercentYield(percent);
				}
			} else {
				setError(result.error || 'Invalid input');
				setYieldResult(null);
				setPercentYield(null);
			}
		} catch (err) {
			setError('Error calculating theoretical yield');
			setYieldResult(null);
			setPercentYield(null);
		}
	};

	// Handle element selection from periodic table
	const handleElementSelect = (symbol) => {
		setFormula(prev => prev + symbol);
		setShowPeriodicTable(false);
	};

	// Render molar mass calculator
	const renderMolarMassCalculator = () => (
		<div className="calculator-section">
			<h3>Molar Mass Calculator</h3>
			<p className="calculator-description">
				Calculate the molar mass of a chemical formula
			</p>
			
			<div className="input-group">
				<Autocomplete
					value={formula}
					onChange={setFormula}
					placeholder="Enter chemical formula (e.g., H2O)"
					className="molar-mass-input"
				/>
				<button 
					onClick={handleCalculateMolarMass}
					className="calculate-btn"
				>
					Calculate
				</button>
				<button 
					onClick={() => setShowPeriodicTable(!showPeriodicTable)}
					className="periodic-table-btn"
				>
					{showPeriodicTable ? 'Hide Periodic Table' : 'Show Periodic Table'}
				</button>
			</div>
			
			{showPeriodicTable && (
				<PeriodicTable onElementSelect={handleElementSelect} />
			)}
			
			{molarMassResult && (
				<div className="result-card">
					<h4>Result</h4>
					<div className="result-formula">
						<MathDisplay math={formatFormula(formula)} />
						<CopyButton textToCopy={formula} className="copy-result-btn" />
					</div>
					<div className="result-item">
						<span className="label">Molar Mass:</span>
						<span className="value">{molarMassResult.mass.toFixed(3)} g/mol</span>
						<CopyButton 
							textToCopy={molarMassResult.mass.toFixed(3) + ' g/mol'} 
							className="copy-value-btn"
						/>
					</div>
					<div className="result-item">
						<span className="label">Elements:</span>
						<div className="elements-list">
							{Object.entries(molarMassResult.elements || {}).map(([el, count]) => (
								<div key={el} className="element-item">
									<span>{el}: {count}</span>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);

	// Render stoichiometry calculator
	const renderStoichiometryCalculator = () => (
		<div className="calculator-section">
			<h3>Stoichiometry Calculator</h3>
			<p className="calculator-description">
				Calculate masses and moles from a balanced equation
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Balanced Equation:</label>
					<input
						type="text"
						value={equation}
						onChange={(e) => setEquation(e.target.value)}
						placeholder="e.g., 2H2 + O2 -> 2H2O"
						className="equation-input"
					/>
				</div>
				<div className="input-item">
					<label>Given Species:</label>
					<select 
						value={givenSpecies} 
						onChange={(e) => setGivenSpecies(e.target.value)}
						className="species-select"
					>
						{getSpeciesFromEquation(equation).map(species => (
							<option key={species} value={species}>{species}</option>
						))}
					</select>
				</div>
				<div className="input-item">
					<label>Given Mass (g):</label>
					<input
						type="number"
						value={mass}
						onChange={(e) => setMass(e.target.value)}
						placeholder="Mass in grams"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
			</div>
			
			<button onClick={handleCalculateStoichiometry} className="calculate-btn">
				Calculate Stoichiometry
			</button>
			
			{stoichResult && (
				<div className="result-card">
					<h4>Results for {stoichResult.givenSpecies}</h4>
					<div className="result-item">
						<span className="label">Moles of {stoichResult.givenSpecies}:</span>
						<span className="value">{(stoichResult.molesGiven || 0).toFixed(4)} mol</span>
					</div>
					<div className="result-item">
						<span className="label">Molar Mass:</span>
						<span className="value">{(stoichResult.molarMass || 0).toFixed(3)} g/mol</span>
					</div>
					
					<h5>Calculated Quantities:</h5>
					<table className="stoich-table">
						<thead>
							<tr>
								<th>Species</th>
								<th>Moles</th>
								<th>Mass (g)</th>
							</tr>
						</thead>
						<tbody>
							{Object.entries(stoichResult.results || {}).map(([species, data]) => (
								<tr key={species}>
									<td><MathDisplay math={formatFormula(species)} /></td>
									<td>{data.moles.toFixed(4)}</td>
									<td>{data.mass.toFixed(3)}</td>
								</tr>
							))}
						</tbody>
					</table>
					
					<CopyButton 
						textToCopy={formatResultsForCopy(stoichResult)} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render limiting reactant calculator
	const renderLimitingReactantCalculator = () => (
		<div className="calculator-section">
			<h3>Limiting Reactant Calculator</h3>
			<p className="calculator-description">
				Determine the limiting reactant in a reaction
			</p>
			
			<div className="input-grid">
				<div className="input-item full-width">
					<label>Balanced Equation:</label>
					<input
						type="text"
						value={equation}
						onChange={(e) => setEquation(e.target.value)}
						placeholder="e.g., 2H2 + O2 -> 2H2O"
						className="equation-input"
					/>
				</div>
				<div className="input-item full-width">
					<label>Reactant Masses (format: species1:mass1, species2:mass2):</label>
					<input
						type="text"
						value={limitingReactant}
						onChange={(e) => setLimitingReactant(e.target.value)}
						placeholder="e.g., H2:5, O2:20"
						className="masses-input"
					/>
				</div>
			</div>
			
			<button onClick={handleFindLimitingReactant} className="calculate-btn">
				Find Limiting Reactant
			</button>
			
			{limitingResult && (
				<div className="result-card">
					<h4>Results</h4>
					<div className="result-item">
						<span className="label">Limiting Reactant:</span>
						<span className="value highlight">{limitingResult.limitingReactant}</span>
					</div>
					
					{limitingResult.excessReactants && limitingResult.excessReactants.length > 0 && (
						<>
							<h5>Excess Reactants:</h5>
							<table className="stoich-table">
								<thead>
									<tr>
										<th>Species</th>
										<th>Moles Available</th>
										<th>Moles Required</th>
										<th>Excess Moles</th>
									</tr>
								</thead>
								<tbody>
									{limitingResult.excessReactants.map((excess) => (
										<tr key={excess.species}>
											<td><MathDisplay math={formatFormula(excess.species)} /></td>
											<td>{excess.moles.toFixed(4)}</td>
											<td>{excess.molesRequired.toFixed(4)}</td>
											<td>{(excess.moles - excess.molesRequired).toFixed(4)}</td>
										</tr>
									))}
								</tbody>
							</table>
						</>
					)}
					
					<CopyButton 
						textToCopy={formatLimitingResultsForCopy(limitingResult)} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render theoretical yield calculator
	const renderTheoreticalYieldCalculator = () => (
		<div className="calculator-section">
			<h3>Theoretical Yield Calculator</h3>
			<p className="calculator-description">
				Calculate the theoretical and percent yield of a reaction
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Balanced Equation:</label>
					<input
						type="text"
						value={equation}
						onChange={(e) => setEquation(e.target.value)}
						placeholder="e.g., 2H2 + O2 -> 2H2O"
						className="equation-input"
					/>
				</div>
				<div className="input-item">
					<label>Limiting Reactant:</label>
					<select 
						value={limitingReactant} 
						onChange={(e) => setLimitingReactant(e.target.value)}
						className="species-select"
					>
						{getSpeciesFromEquation(equation).map(species => (
							<option key={species} value={species}>{species}</option>
						))}
					</select>
				</div>
				<div className="input-item">
					<label>Limiting Reactant Mass (g):</label>
					<input
						type="number"
						value={mass}
						onChange={(e) => setMass(e.target.value)}
						placeholder="Mass in grams"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>Target Product:</label>
					<select 
						value={targetProduct} 
						onChange={(e) => setTargetProduct(e.target.value)}
						className="species-select"
					>
						{getSpeciesFromEquation(equation).filter(s => 
							!getSpeciesFromEquation(equation).some(r => r === s) || 
							balancedProducts(equation).includes(s)
						).map(species => (
							<option key={species} value={species}>{species}</option>
						))}
					</select>
				</div>
				<div className="input-item">
					<label>Actual Yield (g):</label>
					<input
						type="number"
						value={actualYield}
						onChange={(e) => setActualYield(e.target.value)}
						placeholder="Actual mass obtained"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
			</div>
			
			<button onClick={handleCalculateTheoreticalYield} className="calculate-btn">
				Calculate Theoretical Yield
			</button>
			
			{yieldResult && (
				<div className="result-card">
					<h4>Results</h4>
					<div className="result-item">
						<span className="label">Theoretical Yield:</span>
						<span className="value highlight">{(yieldResult.theoreticalYield || 0).toFixed(3)} g</span>
					</div>
					<div className="result-item">
						<span className="label">Mole Ratio:</span>
						<span className="value">{(yieldResult.moleRatio || 0).toFixed(3)}</span>
					</div>
					
					{percentYield !== null && (
						<div className="result-item">
							<span className="label">Percent Yield:</span>
							<span className="value highlight">{percentYield.toFixed(2)}%</span>
						</div>
					)}
					
					<CopyButton 
						textToCopy={formatYieldResultsForCopy(yieldResult, percentYield)} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Helper function to extract species from equation
	const getSpeciesFromEquation = (eq) => {
		try {
			// This is a simplified approach - in a real implementation, we'd parse the equation
			const species = eq
				.replace(/[\u2192\u21CC\u21D2\u2194]|=>|<->|<=|->/g, ' ')  // Replace all arrows with space
				.split('+')
				.map(s => s.trim())
				.filter(s => s.length > 0);
			return [...new Set(species)]; // Remove duplicates
		} catch {
			return [];
		}
	};

	// Helper function to get products from equation
	const balancedProducts = (eq) => {
		try {
			const arrowIndex = eq.indexOf('->');
			if (arrowIndex === -1) return [];
			return eq.substring(arrowIndex + 2)
				.split('+')
				.map(s => s.trim())
				.filter(s => s.length > 0);
		} catch {
			return [];
		}
	};

	// Helper functions for copy
	const formatResultsForCopy = (result) => {
		const lines = [
			`Equation: ${result.equation}`,
			`Given: ${result.givenSpecies} = ${result.givenMass}g (${result.molesGiven?.toFixed(4)} mol)`,
			`Molar Mass: ${result.molarMass?.toFixed(3)} g/mol`,
			'',
			'Results:'
		];
		
		for (const [species, data] of Object.entries(result.results || {})) {
			lines.push(`${species}: ${data.moles.toFixed(4)} mol = ${data.mass.toFixed(3)} g`);
		}
		
		return lines.join('\n');
	};

	const formatLimitingResultsForCopy = (result) => {
		const lines = [
			`Equation: ${result.equation}`,
			`Limiting Reactant: ${result.limitingReactant}`,
			'',
			'Excess Reactants:'
		];
		
		for (const excess of result.excessReactants || []) {
			lines.push(`  ${excess.species}: ${excess.moles.toFixed(4)} mol available, ${excess.molesRequired.toFixed(4)} mol required`);
		}
		
		return lines.join('\n');
	};

	const formatYieldResultsForCopy = (result, percent) => {
		const lines = [
			`Equation: ${result.equation}`,
			`Limiting Reactant: ${result.limitingReactant} (${result.limitingReactantMass}g)`,
			`Target Product: ${result.targetProduct}`,
			`Theoretical Yield: ${result.theoreticalYield?.toFixed(3)} g`,
			`Mole Ratio: ${result.moleRatio?.toFixed(3)}`
		];
		
		if (percent !== null) {
			lines.push(`Percent Yield: ${percent.toFixed(2)}%`);
		}
		
		return lines.join('\n');
	};

	return (
		<div className="stoichiometry-calculator-container">
			<div className="calculator-tabs">
				<button 
					className={`tab-btn ${activeTab === 'molarMass' ? 'active' : ''}`}
					onClick={() => setActiveTab('molarMass')}
				>
					Molar Mass
				</button>
				<button 
					className={`tab-btn ${activeTab === 'stoichiometry' ? 'active' : ''}`}
					onClick={() => setActiveTab('stoichiometry')}
				>
					Stoichiometry
				</button>
				<button 
					className={`tab-btn ${activeTab === 'limiting' ? 'active' : ''}`}
					onClick={() => setActiveTab('limiting')}
				>
					Limiting Reactant
				</button>
				<button 
					className={`tab-btn ${activeTab === 'yield' ? 'active' : ''}`}
					onClick={() => setActiveTab('yield')}
				>
					Theoretical Yield
				</button>
			</div>
			
			<div className="calculator-content">
				{activeTab === 'molarMass' && renderMolarMassCalculator()}
				{activeTab === 'stoichiometry' && renderStoichiometryCalculator()}
				{activeTab === 'limiting' && renderLimitingReactantCalculator()}
				{activeTab === 'yield' && renderTheoreticalYieldCalculator()}
			</div>
			
			{error && (
				<div className="error-message">{error}</div>
			)}
		</div>
	);
}

export default StoichiometryCalculator;
