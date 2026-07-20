'use client';

import { useState } from 'react';
import MathDisplay from '../MathDisplay';
import CopyButton from '../CopyButton';
import {
	calculateCellPotential,
	calculateNernstPotential,
	calculateKFromCellPotential,
	calculateDeltaGFromCellPotential,
	calculateCellPotentialFromDeltaG,
	calculateFaradayLaw,
	getStandardReductionPotential,
	getElectrodeReactions,
	getTheoreticalCellVoltage,
	STANDARD_REDUCTION_POTENTIALS
} from '../../../lib/chemistry/electrochemistry';
import { calculateMolarMass } from '../../../lib/chemistry/stoichiometry';

export function ElectrochemistryCalculator() {
	const [activeTab, setActiveTab] = useState('cellPotential');
	
	// Cell potential calculator state
	const [anodeReaction, setAnodeReaction] = useState('Zn2+(aq) + 2e- → Zn(s)');
	const [cathodeReaction, setCathodeReaction] = useState('Cu2+(aq) + 2e- → Cu(s)');
	
	// Nernst equation state
	const [standardPotential, setStandardPotential] = useState('1.10');
	const [n, setN] = useState('2');
	const [Q, setQ] = useState('1');
	const [temperature, setTemperature] = useState('298.15');
	
	// Faraday's law state
	const [current, setCurrent] = useState('2');
	const [time, setTime] = useState('3600');
	const [timeUnit, setTimeUnit] = useState('seconds');
	const [formula, setFormula] = useState('Cu');
	
	// ΔG calculator state
	const [deltaG, setDeltaG] = useState('-212.3');
	
	// Results state
	const [cellPotentialResult, setCellPotentialResult] = useState(null);
	const [nernstResult, setNernstResult] = useState(null);
	const [kResult, setKResult] = useState(null);
	const [deltaGResult, setDeltaGResult] = useState(null);
	const [faradayResult, setFaradayResult] = useState(null);
	
	// Error state
	const [error, setError] = useState('');

	// Format number for display
	const formatNumber = (num, decimals = 3) => {
		if (num === null || num === undefined) return '0';
		if (Math.abs(num) < 1e-6) return num.toExponential(decimals);
		if (Math.abs(num) >= 1000) return num.toExponential(decimals);
		return num.toFixed(decimals);
	};

	// Calculate cell potential
	const handleCalculateCellPotential = () => {
		setError('');
		try {
			const result = calculateCellPotential(anodeReaction, cathodeReaction);
			setCellPotentialResult(result);
		} catch (err) {
			setError('Invalid input');
			setCellPotentialResult(null);
		}
	};

	// Calculate Nernst potential
	const handleCalculateNernst = () => {
		setError('');
		try {
			const result = calculateNernstPotential(
				parseFloat(standardPotential),
				parseInt(n),
				parseFloat(Q),
				parseFloat(temperature)
			);
			setNernstResult(result);
		} catch (err) {
			setError('Invalid input');
			setNernstResult(null);
		}
	};

	// Calculate K from cell potential
	const handleCalculateK = () => {
		setError('');
		try {
			const E = parseFloat(standardPotential);
			const nVal = parseInt(n);
			const T = parseFloat(temperature);
			const result = calculateKFromCellPotential(E, nVal, T);
			setKResult(result);
		} catch (err) {
			setError('Invalid input');
			setKResult(null);
		}
	};

	// Calculate ΔG from cell potential
	const handleCalculateDeltaG = () => {
		setError('');
		try {
			const E = parseFloat(standardPotential);
			const nVal = parseInt(n);
			const result = calculateDeltaGFromCellPotential(E, nVal);
			setDeltaGResult(result);
		} catch (err) {
			setError('Invalid input');
			setDeltaGResult(null);
		}
	};

	// Calculate cell potential from ΔG
	const handleCalculateEFromDeltaG = () => {
		setError('');
		try {
			const E = calculateCellPotentialFromDeltaG(
				parseFloat(deltaG),
				parseInt(n)
			);
			setDeltaGResult({ deltaG: parseFloat(deltaG), cellPotential: E });
		} catch (err) {
			setError('Invalid input');
			setDeltaGResult(null);
		}
	};

	// Calculate Faraday's law
	const handleCalculateFaraday = () => {
		setError('');
		try {
			const molarMass = calculateMolarMass(formula);
			const timeSeconds = timeUnit === 'seconds' ? parseFloat(time) : 
				timeUnit === 'minutes' ? parseFloat(time) * 60 : 
				parseFloat(time) * 3600;
			
			const result = calculateFaradayLaw(
				parseFloat(current),
				timeSeconds,
				molarMass.mass,
				2 // Assuming 2 electrons for simplicity
			);
			setFaradayResult(result);
		} catch (err) {
			setError('Invalid input');
			setFaradayResult(null);
		}
	};

	// Get list of reduction potentials
	const reductionPotentials = Object.keys(STANDARD_REDUCTION_POTENTIALS);

	// Format formula for display
	const formatFormula = (formula) => {
		if (!formula) return formula;
		return formula.replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}');
	};

	// Render cell potential calculator
	const renderCellPotentialCalculator = () => (
		<div className="calculator-section">
			<h3>Cell Potential Calculator</h3>
			<p className="calculator-description">
				Calculate standard cell potential from half-reactions
			</p>
			
			<div className="input-grid">
				<div className="input-item full-width">
					<label>Anode (Oxidation):</label>
					<select 
						value={anodeReaction} 
						onChange={(e) => setAnodeReaction(e.target.value)}
						className="formula-select"
					>
						{reductionPotentials.map(reaction => (
							<option key={reaction} value={reaction}>{reaction}</option>
						))}
					</select>
					<div className="potential-hint">
						E° = {formatNumber(getStandardReductionPotential(anodeReaction), 3)} V
					</div>
				</div>
				<div className="input-item full-width">
					<label>Cathode (Reduction):</label>
					<select 
						value={cathodeReaction} 
						onChange={(e) => setCathodeReaction(e.target.value)}
						className="formula-select"
					>
						{reductionPotentials.map(reaction => (
							<option key={reaction} value={reaction}>{reaction}</option>
						))}
					</select>
					<div className="potential-hint">
						E° = {formatNumber(getStandardReductionPotential(cathodeReaction), 3)} V
					</div>
				</div>
			</div>
			
			<button onClick={handleCalculateCellPotential} className="calculate-btn">
				Calculate Cell Potential
			</button>
			
			{cellPotentialResult && (
				<div className="result-card">
					<h4>Results</h4>
					
					<div className="reaction-summary">
						<div className="half-reaction">
							<div className="label">Anode (Oxidation):</div>
							<div className="reaction">{cellPotentialResult.anode}</div>
							<div className="potential">E° = {formatNumber(cellPotentialResult.standardPotentials.anode, 3)} V</div>
						</div>
						<div className="arrow">→</div>
						<div className="half-reaction">
							<div className="label">Cathode (Reduction):</div>
							<div className="reaction">{cellPotentialResult.cathode}</div>
							<div className="potential">E° = {formatNumber(cellPotentialResult.standardPotentials.cathode, 3)} V</div>
						</div>
					</div>
					
					<div className="cell-notation">
						<span className="label">Cell Notation:</span>
						<span className="value">{cellPotentialResult.cellNotation}</span>
						<CopyButton 
							textToCopy={cellPotentialResult.cellNotation} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className={`result-item ${cellPotentialResult.spontaneous ? 'spontaneous' : 'nonspontaneous'}`}>
						<span className="label">Standard Cell Potential (E°_cell):</span>
						<span className="value highlight">
							{formatNumber(cellPotentialResult.cellPotential, 3)} V
						</span>
						<CopyButton 
							textToCopy={`E°_cell = ${cellPotentialResult.cellPotential.toFixed(3)} V`} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className="result-item">
						<span className="label">Spontaneous:</span>
						<span className="value">
							{cellPotentialResult.spontaneous ? '✓ YES (Galvanic Cell)' : '✗ NO (Electrolytic Cell)'}
						</span>
					</div>
					
					<div className="electro-note">
						{cellPotentialResult.spontaneous ? 
							'✓ Cell reaction is spontaneous (produces electricity)' : 
							'✗ Cell reaction is non-spontaneous (requires electricity)'}
					</div>
				</div>
			)}
		</div>
	);

	// Render Nernst equation calculator
	const renderNernstCalculator = () => (
		<div className="calculator-section">
			<h3>Nernst Equation Calculator</h3>
			<p className="calculator-description">
				Calculate cell potential under non-standard conditions
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Standard Potential (E°) (V):</label>
					<input
						type="number"
						value={standardPotential}
						onChange={(e) => setStandardPotential(e.target.value)}
						placeholder="e.g., 1.10"
						className="number-input"
						step="0.001"
					/>
				</div>
				<div className="input-item">
					<label>Number of Electrons (n):</label>
					<input
						type="number"
						value={n}
						onChange={(e) => setN(e.target.value)}
						placeholder="e.g., 2"
						className="number-input"
						step="1"
						min="1"
					/>
				</div>
				<div className="input-item">
					<label>Reaction Quotient (Q):</label>
					<input
						type="number"
						value={Q}
						onChange={(e) => setQ(e.target.value)}
						placeholder="e.g., 1"
						className="number-input"
						step="0.001"
						min="0"
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
				<button onClick={handleCalculateNernst} className="calculate-btn">
					Calculate E
				</button>
				<button onClick={handleCalculateK} className="calculate-btn secondary">
					Calculate K
				</button>
				<button onClick={handleCalculateDeltaG} className="calculate-btn secondary">
					Calculate ΔG
				</button>
			</div>
			
			{(nernstResult || kResult || deltaGResult) && (
				<div className="result-card">
					<h4>Results</h4>
					
					{nernstResult !== null && (
						<div className="result-item">
							<span className="label">Cell Potential (E):</span>
							<span className="value highlight">{formatNumber(nernstResult, 3)} V</span>
							<CopyButton 
								textToCopy={`E = ${nernstResult.toFixed(3)} V`} 
								className="copy-value-btn"
							/>
						</div>
					)}
					
					{kResult !== null && (
						<div className="result-item">
							<span className="label">Equilibrium Constant (K):</span>
							<span className="value highlight">{formatNumber(kResult, 6)}</span>
							<CopyButton 
								textToCopy={`K = ${kResult.toFixed(6)}`} 
								className="copy-value-btn"
							/>
						</div>
					)}
					
					{deltaGResult !== null && (
						<div className="result-item">
							<span className="label">ΔG:</span>
							<span className="value highlight">{formatNumber(deltaGResult, 2)} kJ/mol</span>
							<CopyButton 
								textToCopy={`ΔG = ${deltaGResult.toFixed(2)} kJ/mol`} 
								className="copy-value-btn"
							/>
						</div>
					)}
					
					<div className="nernst-equation">
						Nernst Equation: E = E° - (RT/nF) ln Q
					</div>
					
					<CopyButton 
						textToCopy={`Nernst: E° = ${standardPotential} V, n = ${n}, Q = ${Q}, T = ${temperature} K → E = ${nernstResult?.toFixed(3) || 'N/A'} V, K = ${kResult?.toFixed(6) || 'N/A'}, ΔG = ${deltaGResult?.toFixed(2) || 'N/A'} kJ/mol`} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render Faraday's law calculator
	const renderFaradayCalculator = () => (
		<div className="calculator-section">
			<h3>Faraday's Law Calculator</h3>
			<p className="calculator-description">
				Calculate mass deposited or liberated in electrolysis
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Current (A):</label>
					<input
						type="number"
						value={current}
						onChange={(e) => setCurrent(e.target.value)}
						placeholder="e.g., 2"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>Time:</label>
					<div className="time-input-group">
						<input
							type="number"
							value={time}
							onChange={(e) => setTime(e.target.value)}
							placeholder="e.g., 3600"
							className="number-input"
							step="1"
							min="0"
						/>
						<select 
							value={timeUnit} 
							onChange={(e) => setTimeUnit(e.target.value)}
							className="unit-select"
						>
							<option value="seconds">seconds</option>
							<option value="minutes">minutes</option>
							<option value="hours">hours</option>
						</select>
					</div>
				</div>
				<div className="input-item full-width">
					<label>Substance Formula (e.g., Cu, Ag, Au):</label>
					<input
						type="text"
						value={formula}
						onChange={(e) => setFormula(e.target.value)}
						placeholder="e.g., Cu"
						className="formula-input"
					/>
				</div>
			</div>
			
			<button onClick={handleCalculateFaraday} className="calculate-btn">
				Calculate Mass Deposited
			</button>
			
			{faradayResult && (
				<div className="result-card">
					<h4>Results</h4>
					
					<div className="result-item">
						<span className="label">Current:</span>
						<span className="value">{current} A</span>
					</div>
					
					<div className="result-item">
						<span className="label">Time:</span>
						<span className="value">{time} {timeUnit}</span>
					</div>
					
					<div className="result-item">
						<span className="label">Substance:</span>
						<span className="value"><MathDisplay math={formatFormula(formula)} /></span>
					</div>
					
					<div className="result-item">
						<span className="label">Moles:</span>
						<span className="value">{formatNumber(faradayResult.moles, 6)} mol</span>
						<CopyButton 
							textToCopy={`${faradayResult.moles.toFixed(6)} mol`} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className="result-item highlight">
						<span className="label">Mass Deposited:</span>
						<span className="value">{formatNumber(faradayResult.mass, 3)} g</span>
						<CopyButton 
							textToCopy={`Mass = ${faradayResult.mass.toFixed(3)} g`} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className="faraday-note">
						✓ Faraday's Law: mass = (I * t * M) / (n * F)
						<br />
						Where F = 96485 C/mol (Faraday constant)
					</div>
					
					<CopyButton 
						textToCopy={`Faraday's Law: I = ${current} A, t = ${time} ${timeUnit}, ${formula} → mass = ${faradayResult.mass.toFixed(3)} g, moles = ${faradayResult.moles.toFixed(6)} mol`} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render battery calculator
	const renderBatteryCalculator = () => (
		<div className="calculator-section">
			<h3>Battery Calculator</h3>
			<p className="calculator-description">
				Calculate theoretical cell voltages for common battery types
			</p>
			
			<div className="input-grid">
				<div className="input-item full-width">
					<label>Battery Type:</label>
					<select 
						value={cellPotentialResult?.cellNotation || ''} 
						onChange={(e) => {
							const batteryType = e.target.value;
							const voltage = getTheoreticalCellVoltage(batteryType);
							setStandardPotential(voltage.toString());
						}}
						className="formula-select"
					>
						{Object.entries(getElectrodeReactions()).map(([name, data]) => (
							<option key={name} value={data.cellNotation}>
								{name} - {getTheoreticalCellVoltage(name).toFixed(2)} V
							</option>
						))}
						<option value="Lithium-ion">Lithium-ion - 3.70 V</option>
						<option value="LiCoO2/Li">LiCoO2/Li - 3.70 V</option>
						<option value="LiFePO4/Li">LiFePO4/Li - 3.25 V</option>
						<option value="NiMH">NiMH - 1.20 V</option>
						<option value="NiCd">NiCd - 1.20 V</option>
					</select>
				</div>
			</div>
			
			<div className="battery-list">
				<h5>Theoretical Cell Voltages:</h5>
				<table className="battery-table">
					<thead>
						<tr>
							<th>Battery Type</th>
							<th>Voltage (V)</th>
							<th>Reaction</th>
						</tr>
					</thead>
					<tbody>
						{Object.entries(getElectrodeReactions()).map(([name, data]) => (
							<tr key={name}>
								<td>{name}</td>
								<td>{getTheoreticalCellVoltage(name).toFixed(2)}</td>
								<td>
									<div className="reaction-text">{data.anode}</div>
									<div className="reaction-text">{data.cathode}</div>
								</td>
							</tr>
						))}
						<tr>
							<td>Lithium-ion</td>
							<td>3.70</td>
							<td>Li+ + e- → Li (various cathodes)</td>
						</tr>
						<tr>
							<td>NiMH</td>
							<td>1.20</td>
							<td>NiOOH + H2O + e- → Ni(OH)2 + OH-</td>
						</tr>
						<tr>
							<td>NiCd</td>
							<td>1.20</td>
							<td>Cd(OH)2 + 2e- → Cd + 2OH-</td>
						</tr>
					</tbody>
				</table>
			</div>
			
			<div className="battery-note">
				📚 Actual battery voltages may vary based on construction, temperature, and state of charge.
			</div>
		</div>
	);

	return (
		<div className="electrochemistry-calculator-container">
			<div className="calculator-tabs">
				<button 
					className={`tab-btn ${activeTab === 'cellPotential' ? 'active' : ''}`}
					onClick={() => setActiveTab('cellPotential')}
				>
					Cell Potential
				</button>
				<button 
					className={`tab-btn ${activeTab === 'nernst' ? 'active' : ''}`}
					onClick={() => setActiveTab('nernst')}
				>
					Nernst Equation
				</button>
				<button 
					className={`tab-btn ${activeTab === 'faraday' ? 'active' : ''}`}
					onClick={() => setActiveTab('faraday')}
				>
					Faraday's Law
				</button>
				<button 
					className={`tab-btn ${activeTab === 'battery' ? 'active' : ''}`}
					onClick={() => setActiveTab('battery')}
				>
					Battery Voltages
				</button>
			</div>
			
			<div className="calculator-content">
				{activeTab === 'cellPotential' && renderCellPotentialCalculator()}
				{activeTab === 'nernst' && renderNernstCalculator()}
				{activeTab === 'faraday' && renderFaradayCalculator()}
				{activeTab === 'battery' && renderBatteryCalculator()}
			</div>
			
			{error && (
				<div className="error-message">{error}</div>
			)}
		</div>
	);
}

export default ElectrochemistryCalculator;
