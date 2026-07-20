'use client';

import { useState } from 'react';
import MathDisplay from '../MathDisplay';
import CopyButton from '../CopyButton';

export function BalancedEquation({ result, steps }) {
	const [showSteps, setShowSteps] = useState(false);
	
	// Convert plain text equation to LaTeX for display
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
			.replace(/→/g, '\\rightarrow ')
			.replace(/⇌/g, '\\rightleftharpoons ')
			.replace(/⇒/g, '\\Rightarrow ')
			.replace(/=>/g, '\\rightarrow ')
			.replace(/<->/g, '\\rightleftharpoons ')
			.replace(/↔/g, '\\leftrightarrow ')
			.replace(/=/g, '\\=');
		
		// Step 5: Clean up spacing
		result = result
			.replace(/\s+/g, ' ')
			.replace(/\s+(\+|\\rightarrow|\\rightleftharpoons|\\Rightarrow|\\leftrightarrow|\\=)/g, ' $1 ')
			.trim();
		
		return result;
	};
	
	return (
		<div className="balanced-equation-card">
			<div className="equation-display">
				<MathDisplay math={toLatex(result.equation)} />
				<CopyButton textToCopy={result.equation} className="copy-equation-btn" />
			</div>
			
			<div className="equation-details">
				<div className="equation-side">
					<div className="side-header">
						<h4>Reactants</h4>
						<CopyButton 
							textToCopy={result.reactants.map(r => r.coefficient !== 1 ? `${r.coefficient}${r.formula}` : r.formula).join(' + ')} 
							className="copy-side-btn"
						/>
					</div>
					{result.reactants.map((r, i) => (
						<div key={i} className="equation-species">
							<MathDisplay math={r.coefficient !== 1 ? `${r.coefficient} ${r.formula}` : r.formula} />
						</div>
					))}
				</div>
				<div className="equation-side">
					<div className="side-header">
						<h4>Products</h4>
						<CopyButton 
							textToCopy={result.products.map(p => p.coefficient !== 1 ? `${p.coefficient}${p.formula}` : p.formula).join(' + ')} 
							className="copy-side-btn"
						/>
					</div>
					{result.products.map((p, i) => (
						<div key={i} className="equation-species">
							<MathDisplay math={p.coefficient !== 1 ? `${p.coefficient} ${p.formula}` : p.formula} />
						</div>
					))}
				</div>
			</div>
			
			{steps && steps.length > 0 && (
				<button
					onClick={() => setShowSteps(!showSteps)}
					className="steps-toggle"
				>
					{showSteps ? 'Hide' : 'Show'} step-by-step solution
				</button>
			)}
			
			{showSteps && steps && (
				<div className="steps-container">
					<div className="steps-header">
						<h5>Step-by-Step Solution</h5>
						<CopyButton 
							textToCopy={steps.join('\n')} 
							className="copy-steps-btn"
						/>
					</div>
					{steps.map((step, i) => (
						<div key={i} className="step-item">
							<span className="step-number">Step {i + 1}:</span>
							<span className="step-text">{step}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

export default BalancedEquation;
