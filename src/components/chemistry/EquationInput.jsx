'use client';

import { useState, useEffect } from 'react';
import CopyButton from '../CopyButton';
import EquationTemplates from './EquationTemplates';
import { balanceEquation } from '../../../lib/chemistry/balancer';

export function EquationInput({ onBalance, onError, value: externalValue }) {
	const [input, setInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showTemplates, setShowTemplates] = useState(false);

	useEffect(() => {
		if (externalValue !== undefined && externalValue !== '') {
			setInput(externalValue);
		}
	}, [externalValue]);
	
	const handleBalance = async () => {
		if (!input.trim()) return;
		
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
	
	const handleKeyDown = (e) => {
		if (e.key === 'Enter' && !isLoading && input.trim()) {
			handleBalance();
		}
	};

	const handleTemplateSelect = (equation) => {
		setInput(equation);
		setShowTemplates(false);
	};
	
	return (
		<div className="equation-input-container">
			<div className="input-group">
				<input
					type="text"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="e.g., H2 + O2 -> H2O"
					className="equation-input-field"
					onKeyDown={handleKeyDown}
					aria-label="Enter chemical equation"
				/>
				<button
					onClick={handleBalance}
					disabled={isLoading || !input.trim()}
					className="equation-balance-btn"
				>
					{isLoading ? (
						<>
							<span className="spinner" /> Balancing...
						</>
					) : (
						'Balance →'
					)}
				</button>
				{input && (
					<CopyButton 
						textToCopy={input} 
						className="copy-input-btn"
					/>
				)}
			</div>
			<div className="equation-hint">
				Supports: →, ⇌, =, (s), (l), (g), (aq), nested parentheses, ionic charges
				<button 
					className="templates-toggle" 
					onClick={() => setShowTemplates(!showTemplates)}
				>
					{showTemplates ? 'Hide Templates' : 'Show Templates'}
				</button>
			</div>
			
			{showTemplates && (
				<EquationTemplates onSelect={handleTemplateSelect} />
			)}
		</div>
	);
}

export default EquationInput;
