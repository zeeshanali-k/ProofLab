'use client';

import { useState } from 'react';
import MathDisplay from '../MathDisplay';
import CopyButton from '../CopyButton';
import {
	calculateReactionQuotient,
	determineReactionDirection,
	calculateEquilibriumConcentrations,
	calculateWeakAcidPH,
	calculateWeakBasePH,
	calculateBufferPH,
	calculateBufferCapacity,
	calculateCommonIonEffect,
	analyzeLeChatelier,
	getKa,
	getKb,
	getEquilibriumConstant,
	WEAK_ACIDS,
	WEAK_BASES,
	EQUILIBRIUM_CONSTANTS
} from '../../../lib/chemistry/equilibrium';

export function EquilibriumCalculator() {
	const [activeTab, setActiveTab] = useState('reactionQuotient');
	
	// Reaction quotient calculator state
	const [reaction, setReaction] = useState('N2(g) + 3H2(g) ⇌ 2NH3(g)');
	const [concentrationInput, setConcentrationInput] = useState('N2:1,H2:1,NH3:1');
	const [Kc, setKc] = useState('0.040');
	
	// Weak acid/base calculator state
	const [acid, setAcid] = useState('Acetic Acid (CH3COOH)');
	const [acidConcentration, setAcidConcentration] = useState('0.1');
	const [base, setBase] = useState('Ammonia (NH3)');
	const [baseConcentration, setBaseConcentration] = useState('0.1');
	
	// Buffer calculator state
	const [pKa, setPKa] = useState('4.74');
	const [acidBufferConcentration, setAcidBufferConcentration] = useState('0.1');
	const [baseBufferConcentration, setBaseBufferConcentration] = useState('0.1');
	
	// Solubility calculator state
	const [salt, setSalt] = useState('AgCl');
	const [Ksp, setKsp] = useState('1.8e-10');
	const [commonIon, setCommonIon] = useState('Cl-');
	const [commonIonConcentration, setCommonIonConcentration] = useState('0.1');
	
	// Le Chatelier state
	const [leChatelierReaction, setLeChatelierReaction] = useState('N2 + 3H2 ⇌ 2NH3');
	const [change, setChange] = useState('increase pressure');
	
	// Results state
	const [QResult, setQResult] = useState(null);
	const [directionResult, setDirectionResult] = useState(null);
	const [equilibriumResult, setEquilibriumResult] = useState(null);
	const [acidResult, setAcidResult] = useState(null);
	const [baseResult, setBaseResult] = useState(null);
	const [bufferResult, setBufferResult] = useState(null);
	const [solubilityResult, setSolubilityResult] = useState(null);
	const [leChatelierResult, setLeChatelierResult] = useState(null);
	
	// Error state
	const [error, setError] = useState('');

	// Format number for display
	const formatNumber = (num, decimals = 4) => {
		if (num === null || num === undefined) return '0';
		if (Math.abs(num) < 1e-6) return num.toExponential(decimals);
		if (Math.abs(num) >= 1000) return num.toExponential(decimals);
		return num.toFixed(decimals);
	};

	// Parse reaction to get reactants and products
	const parseReaction = (reactionString) => {
		const arrowIndex = reactionString.indexOf('⇌');
		if (arrowIndex === -1) return { reactants: [], products: [] };
		
		const reactantsStr = reactionString.substring(0, arrowIndex).trim();
		const productsStr = reactionString.substring(arrowIndex + 2).trim();
		
		const parseSide = (side) => {
			return side.split('+')
				.map(s => s.trim())
				.filter(s => s.length > 0)
				.map(species => {
					const match = species.match(/^(\d*)(.+)$/);
					const coefficient = match?.[1] ? parseInt(match[1]) : 1;
					const formula = match?.[2] || species;
					return { species: formula, coefficient };
				});
		};
		
		return {
			reactants: parseSide(reactantsStr),
			products: parseSide(productsStr)
		};
	};

	// Calculate reaction quotient
	const handleCalculateQ = () => {
		setError('');
		try {
			const { reactants, products } = parseReaction(reaction);
			
			// Parse concentrations
			const concentrationPairs = concentrationInput.split(',').map(s => s.trim());
			const concentrations = {};
			for (const pair of concentrationPairs) {
				const [species, concentration] = pair.split(':');
				if (species && concentration) {
					concentrations[species.trim()] = parseFloat(concentration.trim());
				}
			}
			
			const Q = calculateReactionQuotient(reactants, products, concentrations);
			const K = parseFloat(Kc);
			const direction = determineReactionDirection(Q, K);
			
			setQResult(Q);
			setDirectionResult(direction);
		} catch (err) {
			setError('Invalid input');
			setQResult(null);
			setDirectionResult(null);
		}
	};

	// Calculate equilibrium concentrations
	const handleCalculateEquilibrium = () => {
		setError('');
		try {
			const { reactants, products } = parseReaction(reaction);
			
			// Parse concentrations with initial values
			const concentrationPairs = concentrationInput.split(',').map(s => s.trim());
			const reactantSpecies = reactants.map(r => r.species);
			const productSpecies = products.map(p => p.species);
			
			const reactantsWithInitial = reactants.map(r => {
				const pair = concentrationPairs.find(p => p.startsWith(r.species));
				const initial = pair ? parseFloat(pair.split(':')[1]) : 1;
				return { ...r, initial };
			});
			
			const productsWithInitial = products.map(p => {
				const pair = concentrationPairs.find(p => p.startsWith(p.species));
				const initial = pair ? parseFloat(pair.split(':')[1]) : 1;
				return { ...p, initial };
			});
			
			const result = calculateEquilibriumConcentrations(
				reactantsWithInitial,
				productsWithInitial,
				parseFloat(Kc)
			);
			
			setEquilibriumResult(result);
		} catch (err) {
			setError('Invalid input');
			setEquilibriumResult(null);
		}
	};

	// Calculate weak acid pH
	const handleCalculateWeakAcid = () => {
		setError('');
		try {
			const ka = getKa(acid);
			const result = calculateWeakAcidPH(ka, parseFloat(acidConcentration));
			setAcidResult(result);
		} catch (err) {
			setError('Invalid input');
			setAcidResult(null);
		}
	};

	// Calculate weak base pH
	const handleCalculateWeakBase = () => {
		setError('');
		try {
			const kb = getKb(base);
			const result = calculateWeakBasePH(kb, parseFloat(baseConcentration));
			setBaseResult(result);
		} catch (err) {
			setError('Invalid input');
			setBaseResult(null);
		}
	};

	// Calculate buffer pH
	const handleCalculateBuffer = () => {
		setError('');
		try {
			const ratio = parseFloat(acidBufferConcentration) / parseFloat(baseBufferConcentration);
			const ph = calculateBufferPH(parseFloat(pKa), ratio);
			const capacity = calculateBufferCapacity(
				parseFloat(acidBufferConcentration),
				parseFloat(baseBufferConcentration)
			);
			setBufferResult({ ph, capacity });
		} catch (err) {
			setError('Invalid input');
			setBufferResult(null);
		}
	};

	// Calculate solubility with common ion effect
	const handleCalculateSolubility = () => {
		setError('');
		try {
			const result = calculateCommonIonEffect(
				parseFloat(Ksp),
				parseFloat(commonIonConcentration)
			);
			setSolubilityResult(result);
		} catch (err) {
			setError('Invalid input');
			setSolubilityResult(null);
		}
	};

	// Analyze Le Chatelier's principle
	const handleAnalyzeLeChatelier = () => {
		setError('');
		try {
			const result = analyzeLeChatelier(leChatelierReaction, change);
			setLeChatelierResult(result);
		} catch (err) {
			setError('Invalid input');
			setLeChatelierResult(null);
		}
	};

	// Format formula for display
	const formatFormula = (formula) => {
		if (!formula) return formula;
		return formula.replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}');
	};

	// Render reaction quotient calculator
	const renderReactionQuotientCalculator = () => (
		<div className="calculator-section">
			<h3>Reaction Quotient Calculator</h3>
			<p className="calculator-description">
				Calculate Q and determine reaction direction
			</p>
			
			<div className="input-grid">
				<div className="input-item full-width">
					<label>Reaction (use ⇌ for equilibrium arrow):</label>
					<input
						type="text"
						value={reaction}
						onChange={(e) => setReaction(e.target.value)}
						placeholder="e.g., N2(g) + 3H2(g) ⇌ 2NH3(g)"
						className="equation-input"
					/>
				</div>
				<div className="input-item full-width">
					<label>Concentrations (format: species1:value1,species2:value2):</label>
					<input
						type="text"
						value={concentrationInput}
						onChange={(e) => setConcentrationInput(e.target.value)}
						placeholder="e.g., N2:1,H2:1,NH3:1"
						className="concentrations-input"
					/>
				</div>
				<div className="input-item">
					<label>Kc (equilibrium constant):</label>
					<input
						type="number"
						value={Kc}
						onChange={(e) => setKc(e.target.value)}
						placeholder="e.g., 0.040"
						className="number-input"
						step="0.001"
					/>
				</div>
			</div>
			
			<div className="button-group">
				<button onClick={handleCalculateQ} className="calculate-btn">
					Calculate Q
				</button>
				<button onClick={handleCalculateEquilibrium} className="calculate-btn secondary">
					Calculate Equilibrium
				</button>
			</div>
			
			{QResult !== null && (
				<div className="result-card">
					<h4>Results</h4>
					
					<div className="result-item">
						<span className="label">Reaction Quotient (Q):</span>
						<span className="value highlight">{formatNumber(QResult, 6)}</span>
						<CopyButton 
							textToCopy={`Q = ${QResult.toFixed(6)}`} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className="result-item">
						<span className="label">Equilibrium Constant (K):</span>
						<span className="value">{formatNumber(parseFloat(Kc), 6)}</span>
					</div>
					
					{directionResult && (
						<div className={`result-item direction-${directionResult.replace(/\s+/g, '-')}`}>
							<span className="label">Reaction Direction:</span>
							<span className="value highlight">{directionResult}</span>
						</div>
					)}
					
					<div className="equilibrium-note">
						{QResult < parseFloat(Kc) && '✓ Reaction proceeds FORWARD (Q < K)'}
						{QResult > parseFloat(Kc) && '✗ Reaction proceeds REVERSE (Q > K)'}
						{QResult === parseFloat(Kc) && '⚖ Reaction is AT EQUILIBRIUM (Q = K)'}
					</div>
				</div>
			)}
			
			{equilibriumResult && (
				<div className="result-card">
					<h4>Equilibrium Concentrations</h4>
					
					<div className="result-item">
						<span className="label">Initial Q:</span>
						<span className="value">{formatNumber(equilibriumResult.Q, 6)}</span>
					</div>
					
					<div className="result-item">
						<span className="label">Direction:</span>
						<span className="value">{equilibriumResult.direction}</span>
					</div>
					
					<div className="result-item">
						<span className="label">Change (x):</span>
						<span className="value">{formatNumber(equilibriumResult.change, 6)}</span>
					</div>
					
					<h5>Equilibrium Concentrations:</h5>
					<table className="concentration-table">
						<thead>
							<tr>
								<th>Species</th>
								<th>Concentration</th>
							</tr>
						</thead>
						<tbody>
							{Object.entries(equilibriumResult.concentrations).map(([species, conc]) => (
								<tr key={species}>
									<td><MathDisplay math={formatFormula(species)} /></td>
									<td>{formatNumber(conc, 6)} M</td>
								</tr>
							))}
						</tbody>
					</table>
					
					<CopyButton 
						textToCopy={formatEquilibriumResults(equilibriumResult)} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render weak acid/base calculator
	const renderWeakAcidBaseCalculator = () => (
		<div className="calculator-section">
			<h3>Weak Acid/Base pH Calculator</h3>
			<p className="calculator-description">
				Calculate pH for weak acid or base solutions
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Weak Acid:</label>
					<select 
						value={acid} 
						onChange={(e) => setAcid(e.target.value)}
						className="formula-select"
					>
						{Object.entries(WEAK_ACIDS).map(([name, ka]) => (
							<option key={name} value={name}>{name} (Ka = {ka.toExponential(2)})</option>
						))}
					</select>
				</div>
				<div className="input-item">
					<label>Concentration (M):</label>
					<input
						type="number"
						value={acidConcentration}
						onChange={(e) => setAcidConcentration(e.target.value)}
						placeholder="e.g., 0.1"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>Weak Base:</label>
					<select 
						value={base} 
						onChange={(e) => setBase(e.target.value)}
						className="formula-select"
					>
						{Object.entries(WEAK_BASES).map(([name, kb]) => (
							<option key={name} value={name}>{name} (Kb = {kb.toExponential(2)})</option>
						))}
					</select>
				</div>
				<div className="input-item">
					<label>Concentration (M):</label>
					<input
						type="number"
						value={baseConcentration}
						onChange={(e) => setBaseConcentration(e.target.value)}
						placeholder="e.g., 0.1"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
			</div>
			
			<div className="button-group">
				<button onClick={handleCalculateWeakAcid} className="calculate-btn">
					Calculate Weak Acid pH
				</button>
				<button onClick={handleCalculateWeakBase} className="calculate-btn secondary">
					Calculate Weak Base pH
				</button>
			</div>
			
			{(acidResult || baseResult) && (
				<div className="result-card">
					<h4>Results</h4>
					
					{acidResult && (
						<div className="acid-results">
							<h5>Weak Acid: {acid}</h5>
							<div className="result-item">
								<span className="label">[H+]:</span>
								<span className="value">{formatNumber(acidResult.hPlus, 6)} M</span>
							</div>
							<div className="result-item">
								<span className="label">pH:</span>
								<span className="value highlight">{formatNumber(acidResult.pH, 2)}</span>
								<CopyButton 
									textToCopy={`pH = ${acidResult.pH.toFixed(2)}`} 
									className="copy-value-btn"
								/>
							</div>
							<div className="result-item">
								<span className="label">Degree of Ionization (α):</span>
								<span className="value">{formatNumber(acidResult.alpha * 100, 2)}%</span>
							</div>
						</div>
					)}
					
					{baseResult && (
						<div className="base-results">
							<h5>Weak Base: {base}</h5>
							<div className="result-item">
								<span className="label">[OH-]:</span>
								<span className="value">{formatNumber(baseResult.ohMinus, 6)} M</span>
							</div>
							<div className="result-item">
								<span className="label">pOH:</span>
								<span className="value">{formatNumber(baseResult.pOH, 2)}</span>
							</div>
							<div className="result-item">
								<span className="label">pH:</span>
								<span className="value highlight">{formatNumber(baseResult.pH, 2)}</span>
								<CopyButton 
									textToCopy={`pH = ${baseResult.pH.toFixed(2)}`} 
									className="copy-value-btn"
								/>
							</div>
							<div className="result-item">
								<span className="label">Degree of Ionization (α):</span>
								<span className="value">{formatNumber(baseResult.alpha * 100, 2)}%</span>
							</div>
						</div>
					)}
					
					<CopyButton 
						textToCopy={`Weak Acid: ${acid} [${acidConcentration} M] → pH = ${acidResult?.pH.toFixed(2)}
Weak Base: ${base} [${baseConcentration} M] → pH = ${baseResult?.pH.toFixed(2)}`} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render buffer calculator
	const renderBufferCalculator = () => (
		<div className="calculator-section">
			<h3>Buffer pH Calculator</h3>
			<p className="calculator-description">
				Calculate buffer pH using Henderson-Hasselbalch equation
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>pKa of Acid:</label>
					<input
						type="number"
						value={pKa}
						onChange={(e) => setPKa(e.target.value)}
						placeholder="e.g., 4.74"
						className="number-input"
						step="0.01"
					/>
				</div>
				<div className="input-item">
					<label>Concentration of Acid (M):</label>
					<input
						type="number"
						value={acidBufferConcentration}
						onChange={(e) => setAcidBufferConcentration(e.target.value)}
						placeholder="e.g., 0.1"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
				<div className="input-item">
					<label>Concentration of Conjugate Base (M):</label>
					<input
						type="number"
						value={baseBufferConcentration}
						onChange={(e) => setBaseBufferConcentration(e.target.value)}
						placeholder="e.g., 0.1"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
			</div>
			
			<button onClick={handleCalculateBuffer} className="calculate-btn">
				Calculate Buffer pH
			</button>
			
			{bufferResult && (
				<div className="result-card">
					<h4>Results</h4>
					
					<div className="result-item">
						<span className="label">pKa:</span>
						<span className="value">{formatNumber(parseFloat(pKa), 2)}</span>
					</div>
					
					<div className="result-item">
						<span className="label">[A-]/[HA] Ratio:</span>
						<span className="value">
							{(parseFloat(acidBufferConcentration) / parseFloat(baseBufferConcentration)).toFixed(2)}
						</span>
					</div>
					
					<div className="result-item highlight">
						<span className="label">Buffer pH:</span>
						<span className="value">{formatNumber(bufferResult.ph, 2)}</span>
						<CopyButton 
							textToCopy={`Buffer pH = ${bufferResult.ph.toFixed(2)}`} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className="result-item">
						<span className="label">Buffer Capacity:</span>
						<span className="value">{formatNumber(bufferResult.capacity, 2)} M</span>
					</div>
					
					<div className="buffer-note">
						✓ Henderson-Hasselbalch: pH = pKa + log([A-]/[HA])
					</div>
					
					<CopyButton 
						textToCopy={`Buffer: pKa = ${pKa}, [HA] = ${acidBufferConcentration} M, [A-] = ${baseBufferConcentration} M → pH = ${bufferResult.ph.toFixed(2)}`} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render solubility calculator
	const renderSolubilityCalculator = () => (
		<div className="calculator-section">
			<h3>Solubility Calculator</h3>
			<p className="calculator-description">
				Calculate solubility with common ion effect
			</p>
			
			<div className="input-grid">
				<div className="input-item">
					<label>Salt Formula:</label>
					<select 
						value={salt} 
						onChange={(e) => setSalt(e.target.value)}
						className="formula-select"
					>
						{Object.entries(EQUILIBRIUM_CONSTANTS)
							.filter(([key]) => !key.includes('⇌') && !key.includes('+') && !key.includes('/') && key.length <= 6)
							.map(([formula, ksp]) => (
								<option key={formula} value={formula}>{formula} (Ksp = {ksp.toExponential(2)})</option>
							))}
					</select>
				</div>
				<div className="input-item">
					<label>Ksp:</label>
					<input
						type="text"
						value={Ksp}
						onChange={(e) => setKsp(e.target.value)}
						placeholder="e.g., 1.8e-10"
						className="number-input"
					/>
				</div>
				<div className="input-item">
					<label>Common Ion:</label>
					<input
						type="text"
						value={commonIon}
						onChange={(e) => setCommonIon(e.target.value)}
						placeholder="e.g., Cl-"
						className="ion-input"
					/>
				</div>
				<div className="input-item">
					<label>Common Ion Concentration (M):</label>
					<input
						type="number"
						value={commonIonConcentration}
						onChange={(e) => setCommonIonConcentration(e.target.value)}
						placeholder="e.g., 0.1"
						className="number-input"
						step="0.01"
						min="0"
					/>
				</div>
			</div>
			
			<button onClick={handleCalculateSolubility} className="calculate-btn">
				Calculate Solubility
			</button>
			
			{solubilityResult && (
				<div className="result-card">
					<h4>Results</h4>
					
					<div className="result-item">
						<span className="label">Salt:</span>
						<span className="value">{salt}</span>
					</div>
					
					<div className="result-item">
						<span className="label">Ksp:</span>
						<span className="value">{Ksp}</span>
					</div>
					
					<div className="result-item">
						<span className="label">Common Ion:</span>
						<span className="value">{commonIon}</span>
					</div>
					
					<div className="result-item">
						<span className="label">[Common Ion]:</span>
						<span className="value">{commonIonConcentration} M</span>
					</div>
					
					<div className="result-item">
						<span className="label">Solubility without Common Ion:</span>
						<span className="value">{formatNumber(solubilityResult.withoutCommonIon, 6)} M</span>
					</div>
					
					<div className="result-item highlight">
						<span className="label">Solubility with Common Ion:</span>
						<span className="value">{formatNumber(solubilityResult.solubility, 6)} M</span>
						<CopyButton 
							textToCopy={`Solubility = ${solubilityResult.solubility.toFixed(6)} M`} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className="solubility-note">
						✓ Common ion effect reduces solubility
						<br />
						Decrease: {formatNumber(
							(solubilityResult.withoutCommonIon - solubilityResult.solubility) / solubilityResult.withoutCommonIon * 100,
							2
						)}%
					</div>
					
					<CopyButton 
						textToCopy={`Solubility of ${salt}: Ksp = ${Ksp}, without common ion = ${solubilityResult.withoutCommonIon.toFixed(6)} M, with ${commonIon} [${commonIonConcentration} M] = ${solubilityResult.solubility.toFixed(6)} M`} 
						className="copy-all-btn"
					/>
				</div>
			)}
		</div>
	);

	// Render Le Chatelier's principle analyzer
	const renderLeChatelierAnalyzer = () => (
		<div className="calculator-section">
			<h3>Le Chatelier's Principle Analyzer</h3>
			<p className="calculator-description">
				Analyze how changes affect equilibrium position
			</p>
			
			<div className="input-grid">
				<div className="input-item full-width">
					<label>Reaction:</label>
					<select 
						value={leChatelierReaction} 
						onChange={(e) => setLeChatelierReaction(e.target.value)}
						className="formula-select"
					>
						{Object.keys(EQUILIBRIUM_CONSTANTS)
							.filter(key => key.includes('⇌') || key.includes('<->'))
							.map(reaction => (
								<option key={reaction} value={reaction}>{reaction}</option>
							))}
					</select>
				</div>
				<div className="input-item full-width">
					<label>Change:</label>
					<select 
						value={change} 
						onChange={(e) => setChange(e.target.value)}
						className="formula-select"
					>
						<option value="increase pressure">Increase Pressure</option>
						<option value="decrease pressure">Decrease Pressure</option>
						<option value="increase temperature">Increase Temperature</option>
						<option value="decrease temperature">Decrease Temperature</option>
						<option value="add N2">Add N2</option>
						<option value="add H2">Add H2</option>
						<option value="add NH3">Add NH3</option>
						<option value="remove N2">Remove N2</option>
						<option value="remove H2">Remove H2</option>
						<option value="remove NH3">Remove NH3</option>
					</select>
				</div>
			</div>
			
			<button onClick={handleAnalyzeLeChatelier} className="calculate-btn">
				Analyze Effect
			</button>
			
			{leChatelierResult && (
				<div className="result-card">
					<h4>Results</h4>
					
					<div className="result-item">
						<span className="label">Reaction:</span>
						<span className="value">{leChatelierReaction}</span>
					</div>
					
					<div className="result-item">
						<span className="label">Change:</span>
						<span className="value">{change}</span>
					</div>
					
					<div className="result-item highlight">
						<span className="label">Effect:</span>
						<span className="value">{leChatelierResult}</span>
						<CopyButton 
							textToCopy={`${leChatelierReaction} | ${change} → ${leChatelierResult}`} 
							className="copy-value-btn"
						/>
					</div>
					
					<div className="le-chatelier-note">
						📚 Le Chatelier's Principle: If a dynamic equilibrium is disturbed by changing the conditions, 
						the position of equilibrium moves to counteract the change.
					</div>
				</div>
			)}
		</div>
	);

	// Helper function to format equilibrium results
	const formatEquilibriumResults = (result) => {
		const lines = [
			`Reaction: ${reaction}`,
			`Initial Q: ${result.Q.toFixed(6)}`,
			`K: ${Kc}`,
			`Direction: ${result.direction}`,
			`Change (x): ${result.change.toFixed(6)}`,
			'',
			'Equilibrium Concentrations:'
		];
		
		for (const [species, conc] of Object.entries(result.concentrations)) {
			lines.push(`  ${species}: ${conc.toFixed(6)} M`);
		}
		
		return lines.join('\n');
	};

	return (
		<div className="equilibrium-calculator-container">
			<div className="calculator-tabs">
				<button 
					className={`tab-btn ${activeTab === 'reactionQuotient' ? 'active' : ''}`}
					onClick={() => setActiveTab('reactionQuotient')}
				>
					Reaction Quotient
				</button>
				<button 
					className={`tab-btn ${activeTab === 'weakAcid' ? 'active' : ''}`}
					onClick={() => setActiveTab('weakAcid')}
				>
					Weak Acid/Base
				</button>
				<button 
					className={`tab-btn ${activeTab === 'buffer' ? 'active' : ''}`}
					onClick={() => setActiveTab('buffer')}
				>
					Buffer pH
				</button>
				<button 
					className={`tab-btn ${activeTab === 'solubility' ? 'active' : ''}`}
					onClick={() => setActiveTab('solubility')}
				>
					Solubility
				</button>
				<button 
					className={`tab-btn ${activeTab === 'leChatelier' ? 'active' : ''}`}
					onClick={() => setActiveTab('leChatelier')}
				>
					Le Chatelier
				</button>
			</div>
			
			<div className="calculator-content">
				{activeTab === 'reactionQuotient' && renderReactionQuotientCalculator()}
				{activeTab === 'weakAcid' && renderWeakAcidBaseCalculator()}
				{activeTab === 'buffer' && renderBufferCalculator()}
				{activeTab === 'solubility' && renderSolubilityCalculator()}
				{activeTab === 'leChatelier' && renderLeChatelierAnalyzer()}
			</div>
			
			{error && (
				<div className="error-message">{error}</div>
			)}
		</div>
	);
}

export default EquilibriumCalculator;
