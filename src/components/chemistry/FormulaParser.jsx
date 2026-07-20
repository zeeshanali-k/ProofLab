'use client';

import { useState } from 'react';
import MathDisplay from '../MathDisplay';
import CopyButton from '../CopyButton';
import { parseFormula } from '../../../lib/chemistry/formula';

export function FormulaParser() {
	const [input, setInput] = useState('');
	const [result, setResult] = useState(null);
	const [error, setError] = useState('');
	
	const handleParse = () => {
		if (!input.trim()) return;
		
		try {
			const parsed = parseFormula(input);
			setResult(parsed);
			setError('');
		} catch (err) {
			setError('Invalid formula');
			setResult(null);
		}
	};
	
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && input.trim()) {
			handleParse();
		}
	};
	
	// Format formula for display
	const formatFormula = (formula) => {
		if (!formula) return formula;
		// Add subscripts for numbers
		return formula.replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}');
	};
	
	return (
		<div className="formula-parser-container">
			<div className="input-group">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="e.g., C2H5OH"
					className="formula-input-field"
					onKeyDown={handleKeyDown}
					aria-label="Enter chemical formula"
				/>
				<button onClick={handleParse} className="formula-parse-btn">
					Parse
				</button>
			</div>
			
			{error && <div className="formula-error">{error}</div>}
			
			{result && (
				<div className="formula-result-card">
					<div className="formula-section">
						<div className="formula-header">
							<div className="formula-label">Standardized Formula:</div>
							<CopyButton textToCopy={result.formulaString} className="copy-formula-btn" />
						</div>
						<div className="formula-value">
							<MathDisplay math={formatFormula(result.formulaString)} />
						</div>
					</div>
					
					<div className="formula-grid">
						<div className="formula-column">
							<div className="column-title">Elements</div>
							{Object.entries(result.elements).map(([el, count]) => (
								<div key={el} className="formula-element">
									<span className="element-symbol">{el}:</span>
									<span className="element-count">{count}</span>
								</div>
							))}
						</div>
						
						<div className="formula-column">
							<div className="column-title">Molecular Weight</div>
							<div className="formula-molecular-weight">
								{result.molecularWeight.toFixed(3)} g/mol
								<CopyButton 
									textToCopy={result.molecularWeight.toFixed(3) + ' g/mol'} 
									className="copy-mw-btn"
								/>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default FormulaParser;
