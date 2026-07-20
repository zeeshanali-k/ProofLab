'use client';

import { useState } from 'react';
import MathDisplay from '../MathDisplay';
import CopyButton from '../CopyButton';
import Autocomplete from './Autocomplete';
import PeriodicTable from './PeriodicTable';
import { calculateMolarMass } from '../../../lib/chemistry/stoichiometry';
import {
	calculateMolarity,
	calculateMolarityFromMass,
	calculateMoles,
	calculateVolume,
	calculateMass,
	calculateDilution,
	calculateSolutionMixing,
	calculateMolality,
	calculateMoleFraction,
	calculatePPM,
	calculatePPB,
	convertConcentration,
	calculatePH,
	calculateHPlusFromPH,
	calculatePOH,
	calculateOHMinusFromPOH,
	getKw
} from '../../../lib/chemistry/solution';

export function SolutionCalculator() {
	const [activeTab, setActiveTab] = useState('molarity');
	
	// Molarity calculator state
	const [moles, setMoles] = useState('1');
	const [volumeLiters, setVolumeLiters] = useState('1');
	const [formula, setFormula] = useState('NaCl');
	const [massGrams, setMassGrams] = useState('58.44');
	
	// Dilution calculator state
	const [initialMolarity, setInitialMolarity] = useState('2');
	const [initialVolume, setInitialVolume] = useState('100');
	const [finalMolarity, setFinalMolarity] = useState('0.5');
	
	// Solution mixing state
	const [molarity1, setMolarity1] = useState('1');
	const [volume1, setVolume1] = useState('100');
	const [molarity2, setMolarity2] = useState('2');
	const [volume2, setVolume2] = useState('100');
	
	// Concentration conversion state
	const [concentrationValue, setConcentrationValue] = useState('1');
	const [fromUnit, setFromUnit] = useState('M');
	const [toUnit, setToUnit] = useState('g/L');
	
	// pH calculator state
	const [hPlusConcentration, setHPlusConcentration] = useState('1e-7');
	const [pH, setPH] = useState('7');
	const [pOH, setPOH] = useState('7');
	const [temperature, setTemperature] = useState('25');
	
	// Results state
	const [molarityResult, setMolarityResult] = useState(null);
	const [dilutionResult, setDilutionResult] = useState(null);
	const [mixingResult, setMixingResult] = useState(null);
	const [conversionResult, setConversionResult] = useState(null);
	const [phResult, setPHResult] = useState(null);
	const [kwResult, setKwResult] = useState(null);
	
	// Error state
	const [error, setError] = useState('');
	const [showPeriodicTable, setShowPeriodicTable] = useState(false);

	// Unit options
	const concentrationUnits = ['M', 'mM', 'μM', 'nM', 'g/L', 'mg/L', 'μg/mL', 'mg/mL', '%', 'ppm', 'ppb'];

	// Format number for display
	const formatNumber = (num, decimals = 4) => {
		if (num === null || num === undefined) return '0';
		if (Math.abs(num) < 1e-6) return num.toExponential(decimals);
		if (Math.abs(num) >= 1000) return num.toExponential(decimals);
		return num.toFixed(decimals);
	};

	// Handle element selection
	const handleElementSelect = (symbol) => {
		setFormula(prev => prev + symbol);
		setShowPeriodicTable(false);
	};

	// Calculate molarity
	const handleCalculateMolarity = () => {
		setError('');
		try {
			const molarMass = calculateMolarMass(formula);
			const result = calculateMolarityFromMass(
				formula,
				parseFloat(massGrams),
				parseFloat(volumeLiters),
				molarMass.mass
			);
			setMolarityResult(result);
		} catch (err) {
			setError('Invalid input');
			setMolarityResult(null);
		}
	};

	// Calculate molarity from moles
	const handleCalculateMolarityFromMoles = () => {
		setError('');
		try {
			const result = calculateMolarity(
				parseFloat(moles),
				parseFloat(volumeLiters)
			);
			setMolarityResult(result);
		} catch (err) {
			setError('Invalid input');
			setMolarityResult(null);
		}
	};

	// Calculate dilution
	const handleCalculateDilution = () => {
		setError('');
		try {
			const result = calculateDilution(
				parseFloat(initialMolarity),
				parseFloat(initialVolume),
				parseFloat(finalMolarity)
			);
			setDilutionResult(result);
		} catch (err) {
			setError('Invalid input');
			setDilutionResult(null);
		}
	};

	// Calculate solution mixing
	const handleCalculateMixing = () => {
		setError('');
		try {
			const result = calculateSolutionMixing(
				parseFloat(molarity1),
				parseFloat(volume1),
				parseFloat(molarity2),
				parseFloat(volume2)
			);
			setMixingResult(result);
		} catch (err) {
			setError('Invalid input');
			setMixingResult(null);
		}
	};

	// Calculate concentration conversion
	const handleConvertConcentration = () => {
		setError('');
		try {
			const molarMass = calculateMolarMass(formula);
			const result = convertConcentration(
				parseFloat(concentrationValue),
				fromUnit,
				toUnit,
				molarMass.mass
			);
			setConversionResult(result);
		} catch (err) {
			setError(err.message || 'Invalid input');
			setConversionResult(null);
		}
	};

	// Calculate pH/pOH
	const handleCalculatePH = () => {
		setError('');
		try {
			const hPlus = parseFloat(hPlusConcentration);
			const ph = calculatePH(hPlus);
			const poh = 14 - ph; // At 25°C
			const kw = getKw(parseFloat(temperature));
			
			setPHResult({ ph, poh, hPlus });
			setKwResult({ kw, temperature: parseFloat(temperature) });
		} catch (err) {
			setError('Invalid input');
			setPHResult(null);
			setKwResult(null);
		}
	};

	// Calculate from pH
	const handleCalculateFromPH = () => {
		setError('');
		try {
			const ph = parseFloat(pH);
			const hPlus = calculateHPlusFromPH(ph);
			const poh = 14 - ph;
			const ohMinus = calculateOHMinusFromPOH(poh);
			const kw = getKw(parseFloat(temperature));
			
			setPHResult({ ph, poh, hPlus, ohMinus });
			setKwResult({ kw, temperature: parseFloat(temperature) });
		} catch (err) {
			setError('Invalid input');
			setPHResult(null);
			setKwResult(null);
		}
	};

	// Render molarity calculator
	const renderMolarityCalculator = () => (
		<div className="calculator-section">
			<h3>Molarity Calculator</h3>
			<p className="calculator-description">
				Calculate molarity from mass and volume
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Formula:</label>
					<Autocomplete
						value={formula}
						onChange={setFormula}
						placeholder="e.g., NaCl"
						className="formula-input"
					/>
				</div>
				<div className="input-item">
					<label>Mass (g):</label>
					<input
						type="number"
						value={massGrams}
						onChange={(e) => setMassGrams(e.target.value)}
						placeholder="Mass in grams"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>Volume (L):</label>
					<input
						type="number"
						value={volumeLiters}
						onChange={(e) => setVolumeLiters(e.target.value)}
						placeholder="Volume in liters"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
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
			
			<div className="button-group">
				<button onClick={handleCalculateMolarity} className="calculate-btn">
					Calculate from Mass
				</button>
				<button onClick={handleCalculateMolarityFromMoles} className="calculate-btn secondary">
					Calculate from Moles
				</button>
			</div>
			
			{molarityResult && (
				<div className="result-card">
					<h4>Results</h4>
					<div className="result-item">
						<span className="label">Formula:</span>
						<MathDisplay math={formatFormula(formula)} />
					</div>
					<div className="result-item">
						<span className="label">Molarity:</span>
						<span className="value highlight">{formatNumber(molarityResult.molarity, 4)} M</span>
						<CopyButton 
							textToCopy={molarityResult.molarity.toFixed(4) + ' M'} 
							className="copy-value-btn"
						/>
					</div>
					<div className="result-item">
						<span className="label">Moles:</span>
						<span className="value">{formatNumber(molarityResult.moles, 4)} mol</span>
					</div>
					<div className="result-item">
						<span className="label">Volume:</span>
						<span className="value">{formatNumber(molarityResult.volumeLiters, 4)} L</span>
					</div>
				</div>
			)}
		</div>
	);

	// Render dilution calculator
	const renderDilutionCalculator = () => (
		<div className="calculator-section">
			<h3>Dilution Calculator</h3>
			<p className="calculator-description">
				Calculate how to dilute a solution: M1 * V1 = M2 * V2
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Initial Molarity (M):</label>
					<input
						type="number"
						value={initialMolarity}
						onChange={(e) => setInitialMolarity(e.target.value)}
						placeholder="e.g., 2"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>Initial Volume (mL):</label>
					<input
						type="number"
						value={initialVolume}
						onChange={(e) => setInitialVolume(e.target.value)}
						placeholder="e.g., 100"
						className="number-input"
						step="0.1"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>Final Molarity (M):</label>
					<input
						type="number"
						value={finalMolarity}
						onChange={(e) => setFinalMolarity(e.target.value)}
						placeholder="e.g., 0.5"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
			</div>
			
			<button onClick={handleCalculateDilution} className="calculate-btn">
				Calculate Dilution
			</button>
			
			{dilutionResult && (
				<div className="result-card">
					<h4>Results</h4>
					<div className="dilution-diagram">
						<div className="flask initial">
							<div className="flask-label">Stock Solution</div>
							<div className="flask-value">{dilutionResult.initialMolarity} M</div>
							<div className="flask-value">{dilutionResult.initialVolume} mL</div>
						</div>
						<div className="arrow">→</div>
						<div className="flask final">
							<div className="flask-label">Final Solution</div>
							<div className="flask-value">{dilutionResult.finalMolarity} M</div>
							<div className="flask-value">{dilutionResult.finalVolume.toFixed(2)} mL</div>
						</div>
					</div>
					
					<div className="result-item">
						<span className="label">Water to Add:</span>
						<span className="value highlight">{formatNumber(dilutionResult.volumeToAdd, 2)} mL</span>
						<CopyButton 
							textToCopy={dilutionResult.volumeToAdd.toFixed(2) + ' mL water to add'} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className="result-summary">
						Take {dilutionResult.initialVolume} mL of {dilutionResult.initialMolarity} M solution 
						and add {formatNumber(dilutionResult.volumeToAdd, 2)} mL of water to get 
						{dilutionResult.finalVolume.toFixed(2)} mL of {dilutionResult.finalMolarity} M solution.
					</div>
					
					<CopyButton 
						textToCopy={`Dilution: ${dilutionResult.initialVolume} mL of ${dilutionResult.initialMolarity} M → ${dilutionResult.finalVolume.toFixed(2)} mL of ${dilutionResult.finalMolarity} M (add ${dilutionResult.volumeToAdd.toFixed(2)} mL water)`} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render solution mixing calculator
	const renderSolutionMixingCalculator = () => (
		<div className="calculator-section">
			<h3>Solution Mixing Calculator</h3>
			<p className="calculator-description">
				Calculate final concentration after mixing two solutions
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Solution 1 Molarity (M):</label>
					<input
						type="number"
						value={molarity1}
						onChange={(e) => setMolarity1(e.target.value)}
						placeholder="e.g., 1"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>Solution 1 Volume (mL):</label>
					<input
						type="number"
						value={volume1}
						onChange={(e) => setVolume1(e.target.value)}
						placeholder="e.g., 100"
						className="number-input"
						step="0.1"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>Solution 2 Molarity (M):</label>
					<input
						type="number"
						value={molarity2}
						onChange={(e) => setMolarity2(e.target.value)}
						placeholder="e.g., 2"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>Solution 2 Volume (mL):</label>
					<input
						type="number"
						value={volume2}
						onChange={(e) => setVolume2(e.target.value)}
						placeholder="e.g., 100"
						className="number-input"
						step="0.1"
						min="0"
					/>
				</div>
			</div>
			
			<button onClick={handleCalculateMixing} className="calculate-btn">
				Calculate Final Concentration
			</button>
			
			{mixingResult && (
				<div className="result-card">
					<h4>Results</h4>
					<div className="result-item">
						<span className="label">Solution 1:</span>
						<span className="value">{mixingResult.moles1.toFixed(4)} mol in {mixingResult.finalVolume / 1000} L</span>
					</div>
					<div className="result-item">
						<span className="label">Solution 2:</span>
						<span className="value">{mixingResult.moles2.toFixed(4)} mol in {mixingResult.finalVolume / 1000} L</span>
					</div>
					<div className="result-item">
						<span className="label">Total Moles:</span>
						<span className="value">{mixingResult.totalMoles.toFixed(4)} mol</span>
					</div>
					<div className="result-item highlight">
						<span className="label">Final Molarity:</span>
						<span className="value">{formatNumber(mixingResult.finalMolarity, 4)} M</span>
						<CopyButton 
							textToCopy={mixingResult.finalMolarity.toFixed(4) + ' M'} 
							className="copy-value-btn"
						/>
					</div>
					<div className="result-item">
						<span className="label">Final Volume:</span>
						<span className="value">{mixingResult.finalVolume.toFixed(2)} mL</span>
					</div>
					
					<CopyButton 
						textToCopy={`Mixing: ${molarity1} M × ${volume1} mL + ${molarity2} M × ${volume2} mL → ${mixingResult.finalMolarity.toFixed(4)} M in ${mixingResult.finalVolume.toFixed(2)} mL`} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render concentration converter
	const renderConcentrationConverter = () => (
		<div className="calculator-section">
			<h3>Concentration Unit Converter</h3>
			<p className="calculator-description">
				Convert between different concentration units
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Value:</label>
					<input
						type="number"
						value={concentrationValue}
						onChange={(e) => setConcentrationValue(e.target.value)}
						placeholder="e.g., 1"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>From Unit:</label>
					<select 
						value={fromUnit} 
						onChange={(e) => setFromUnit(e.target.value)}
						className="unit-select"
					>
						{concentrationUnits.map(unit => (
							<option key={unit} value={unit}>{unit}</option>
						))}
					</select>
				</div>
				<div className="input-item">
					<label>To Unit:</label>
					<select 
						value={toUnit} 
						onChange={(e) => setToUnit(e.target.value)}
						className="unit-select"
					>
						{concentrationUnits.map(unit => (
							<option key={unit} value={unit}>{unit}</option>
						))}
					</select>
				</div>
				<div className="input-item">
					<label>Formula (for mass units):</label>
					<Autocomplete
						value={formula}
						onChange={setFormula}
						placeholder="e.g., NaCl"
						className="formula-input"
					/>
				</div>
			</div>
			
			<button onClick={handleConvertConcentration} className="calculate-btn">
				Convert
			</button>
			
			{conversionResult !== null && (
				<div className="result-card">
					<h4>Results</h4>
					<div className="conversion-result">
						<div className="conversion-input">
							<span className="value">{concentrationValue}</span>
							<span className="unit">{fromUnit}</span>
						</div>
						<div className="conversion-arrow">→</div>
						<div className="conversion-output">
							<span className="value">{formatNumber(conversionResult, 6)}</span>
							<span className="unit">{toUnit}</span>
							<CopyButton 
								textToCopy={conversionResult.toFixed(6)} 
								className="copy-value-btn"
							/>
						</div>
					</div>
					
					<CopyButton 
						textToCopy={`${concentrationValue} ${fromUnit} = ${conversionResult.toFixed(6)} ${toUnit} (${formula})`} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render pH calculator
	const renderPHCalculator = () => (
		<div className="calculator-section">
			<h3>pH Calculator</h3>
			<p className="calculator-description">
				Calculate pH, pOH, [H+], and [OH-]
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Temperature (°C):</label>
					<input
						type="number"
						value={temperature}
						onChange={(e) => setTemperature(e.target.value)}
						placeholder="e.g., 25"
						className="number-input"
						step="1"
					/>
				</div>
			</div>
			
			<div className="ph-input-group">
				<div className="input-item">
					<label>[H+] Concentration (M):</label>
					<input
						type="text"
						value={hPlusConcentration}
						onChange={(e) => setHPlusConcentration(e.target.value)}
						placeholder="e.g., 1e-7"
						className="number-input"
					/>
					<button onClick={handleCalculatePH} className="calculate-btn small">
						Calculate
					</button>
				</div>
				
				<div className="divider">OR</div>
				
				<div className="input-item">
					<label>pH:</label>
					<input
						type="number"
						value={pH}
						onChange={(e) => setPH(e.target.value)}
						placeholder="e.g., 7"
						className="number-input"
						step="0.01"
					/>
					<button onClick={handleCalculateFromPH} className="calculate-btn small">
						Calculate
					</button>
				</div>
				
				<div className="input-item">
					<label>pOH:</label>
					<input
						type="number"
						value={pOH}
						onChange={(e) => setPOH(e.target.value)}
						placeholder="e.g., 7"
						className="number-input"
						step="0.01"
					/>
				</div>
			</div>
			
			{(phResult || kwResult) && (
				<div className="result-card">
					<h4>Results</h4>
					
					<div className="ph-results-grid">
						{phResult && (
							<>
								{phResult.hPlus !== undefined && (
									<div className="result-item">
										<span className="label">[H+]:</span>
										<span className="value">{formatNumber(phResult.hPlus, 6)} M</span>
									</div>
								)}
								{phResult.pH !== undefined && (
									<div className="result-item">
										<span className="label">pH:</span>
										<span className="value">{formatNumber(phResult.pH, 2)}</span>
									</div>
								)}
								{phResult.poh !== undefined && (
									<div className="result-item">
										<span className="label">pOH:</span>
										<span className="value">{formatNumber(phResult.poh, 2)}</span>
									</div>
								)}
								{phResult.ohMinus !== undefined && (
									<div className="result-item">
										<span className="label">[OH-]:</span>
										<span className="value">{formatNumber(phResult.ohMinus, 6)} M</span>
									</div>
								)}
							</>
						)}
						
						{kwResult && (
							<div className="result-item">
								<span className="label">Kw at {kwResult.temperature}°C:</span>
								<span className="value">{formatNumber(kwResult.kw, 6)}</span>
							</div>
						)}
					</div>
					
					{phResult && (
						<div className="ph-indicator">
							<div 
								className={`ph-meter ${getPHColor(phResult.pH || 7)}`}
								style={{ width: '100%', height: '20px', borderRadius: '10px' }}
							/>
							<div className="ph-scale">
								{Array.from({ length: 15 }, (_, i) => i).map(num => (
									<div 
										key={num} 
										className="ph-mark"
										style={{ left: `${num * (100 / 14)}%` }}
									>
										{num}
									</div>
								))}
							</div>
						</div>
					)}
					
					<CopyButton 
						textToCopy={`pH: ${phResult?.pH?.toFixed(2)}, pOH: ${phResult?.poh?.toFixed(2)}, [H+]: ${phResult?.hPlus?.toFixed(6)} M, [OH-]: ${phResult?.ohMinus?.toFixed(6)} M, Kw: ${kwResult?.kw?.toFixed(6)}`} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Helper function to format formula
	const formatFormula = (formula) => {
		if (!formula) return formula;
		return formula.replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}');
	};

	// Helper function to get pH color
	const getPHColor = (phValue) => {
		if (phValue < 1) return 'deep-red';
		if (phValue < 2) return 'red';
		if (phValue < 4) return 'orange';
		if (phValue < 6) return 'yellow';
		if (phValue < 7) return 'light-green';
		if (phValue < 8) return 'light-green';
		if (phValue < 10) return 'light-blue';
		if (phValue < 12) return 'blue';
		if (phValue < 13) return 'dark-blue';
		return 'deep-blue';
	};

	return (
		<div className="solution-calculator-container">
			<div className="calculator-tabs">
				<button 
					className={`tab-btn ${activeTab === 'molarity' ? 'active' : ''}`}
					onClick={() => setActiveTab('molarity')}
				>
					Molarity
				</button>
				<button 
					className={`tab-btn ${activeTab === 'dilution' ? 'active' : ''}`}
					onClick={() => setActiveTab('dilution')}
				>
					Dilution
				</button>
				<button 
					className={`tab-btn ${activeTab === 'mixing' ? 'active' : ''}`}
					onClick={() => setActiveTab('mixing')}
				>
					Mixing
				</button>
				<button 
					className={`tab-btn ${activeTab === 'convert' ? 'active' : ''}`}
					onClick={() => setActiveTab('convert')}
				>
					Convert Units
				</button>
				<button 
					className={`tab-btn ${activeTab === 'ph' ? 'active' : ''}`}
					onClick={() => setActiveTab('ph')}
				>
					pH Calculator
				</button>
			</div>
			
			<div className="calculator-content">
				{activeTab === 'molarity' && renderMolarityCalculator()}
				{activeTab === 'dilution' && renderDilutionCalculator()}
				{activeTab === 'mixing' && renderSolutionMixingCalculator()}
				{activeTab === 'convert' && renderConcentrationConverter()}
				{activeTab === 'ph' && renderPHCalculator()}
			</div>
			
			{error && (
				<div className="error-message">{error}</div>
			)}
		</div>
	);
}

export default SolutionCalculator;
