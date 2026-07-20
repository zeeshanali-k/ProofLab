'use client';

import { useEffect, useState } from 'react';
import CopyButton from '../CopyButton';
import {
	predictProducts,
	autoCompleteEquation,
	getReactionInfo,
	getReactionExamples
} from '../../../lib/chemistry/reactions';
import { balanceEquation } from '../../../lib/chemistry/balancer';

export function ReactionClassifier({ equation, onPredict = null }) {
	const [reactionInfo, setReactionInfo] = useState(null);
	const [predictedProducts, setPredictedProducts] = useState([]);
	const [autoCompleteResult, setAutoCompleteResult] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	
	const hasProducts = (eq) => {
		if (!eq) return false;
		const arrowIndex = eq.indexOf('->');
		if (arrowIndex === -1) return false;
		const productsPart = eq.substring(arrowIndex + 2).trim();
		return productsPart.length > 0 && !productsPart.endsWith('+');
	};
	
	const isIncomplete = !hasProducts(equation);
	
	useEffect(() => {
		if (!equation || equation.trim().length === 0) {
			setReactionInfo(null);
			setPredictedProducts([]);
			setAutoCompleteResult(null);
			setError('');
			return;
		}
		
		setLoading(true);
		
		try {
			const info = getReactionInfo(equation);
			setReactionInfo(info);
			
			if (isIncomplete) {
				const reactants = equation.split('+').map(s => s.trim()).filter(s => s.length > 0);
				const result = autoCompleteEquation(reactants);
				
				if (result.products.length > 0) {
					setAutoCompleteResult(result);
					setPredictedProducts(result.products);
					if (onPredict) {
						onPredict(result.fullEquation, result.products, result.reactionType);
					}
				} else {
					setAutoCompleteResult(null);
					setPredictedProducts([]);
				}
			} else {
				setPredictedProducts(info.products);
				setAutoCompleteResult(null);
			}
			
			setError('');
		} catch (err) {
			setError('Error analyzing reaction');
			setReactionInfo(null);
			setPredictedProducts([]);
			setAutoCompleteResult(null);
		}
		
		setLoading(false);
	}, [equation, isIncomplete, onPredict]);
	
	const getBalancedEquation = () => {
		if (!autoCompleteResult) return null;
		try {
			const balanced = balanceEquation(autoCompleteResult.fullEquation);
			if (balanced.isValid) {
				return balanced;
			}
		} catch (e) {
			return null;
		}
		return null;
	};
	
	const handleApplyPrediction = () => {
		if (autoCompleteResult && onPredict) {
			onPredict(
				autoCompleteResult.fullEquation,
				autoCompleteResult.products,
				autoCompleteResult.reactionType
			);
		}
	};
	
	const handleTryBalancing = () => {
		if (autoCompleteResult) {
			const balanced = getBalancedEquation();
			if (balanced && onPredict) {
				onPredict(balanced.equation, autoCompleteResult.products, reactionInfo?.reactionType || 'other');
			}
		}
	};
	
	const getReactionIcon = (type) => {
		switch (type) {
			case 'combustion': return '🔥';
			case 'acid-base': return '🧪';
			case 'redox': return '⚡';
			case 'precipitation': return '⬇️';
			case 'decomposition': return '💥';
			case 'synthesis': return '➕';
			case 'double-displacement': return '↔️';
			default: return '❓';
		}
	};
	
	const getReactionColor = (type) => {
		switch (type) {
			case 'combustion': return '#ff6b35';
			case 'acid-base': return '#4ecdc4';
			case 'redox': return '#ffe66d';
			case 'precipitation': return '#95e1d3';
			case 'decomposition': return '#f38181';
			case 'synthesis': return '#a8e6cf';
			case 'double-displacement': return '#ffd3b6';
			default: return '#cccccc';
		}
	};
	
	const formatFormula = (formula) => {
		if (!formula) return formula;
		return formula.replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>');
	};
	
	const getCharacteristics = (type) => {
		const chars = {
			'combustion': ['Exothermic reaction releasing heat and light', 'Oxidation of fuel with oxygen'],
			'acid-base': ['Neutralization reaction forming water', 'Produces a salt as secondary product'],
			'redox': ['Involves electron transfer', 'Oxidation and reduction occur simultaneously'],
			'precipitation': ['Forms an insoluble solid (precipitate)', 'Double displacement reaction'],
			'decomposition': ['Single compound breaks into multiple products', 'Often requires heat or electricity'],
			'synthesis': ['Multiple reactants combine to form one product', 'Often exothermic'],
			'double-displacement': ['Cations and anions switch partners', 'May form precipitate, gas, or water']
		};
		return chars[type] || [];
	};
	
	if (!equation || equation.trim().length === 0) {
		return (
			<div className="reaction-classifier">
				<div className="reaction-hint">
					Enter an equation to classify its type and predict products.
				</div>
				<div className="reaction-examples-hint">
					<small>Try: CH4 + O2, HCl + NaOH, AgNO3 + NaCl</small>
				</div>
			</div>
		);
	}
	
	if (loading) {
		return <div className="reaction-classifier"><div className="loading-indicator">Analyzing reaction...</div></div>;
	}
	
	if (error) {
		return <div className="reaction-classifier"><div className="error-message">{error}</div></div>;
	}
	
	return (
		<div className="reaction-classifier-container">
			{reactionInfo && (
				<div className="reaction-type-badge" style={{ borderColor: getReactionColor(reactionInfo.reactionType) }}>
					<span className="reaction-icon">{getReactionIcon(reactionInfo.reactionType)}</span>
					<span className="reaction-type-label">
						{reactionInfo.reactionType.charAt(0).toUpperCase() + reactionInfo.reactionType.slice(1)}
					</span>
				</div>
			)}
			
			{reactionInfo && (
				<div className="reaction-description">
					{reactionInfo.description}
					{reactionInfo.confidence < 1.0 && (
						<span className="confidence-indicator"> (Confidence: {(reactionInfo.confidence * 100).toFixed(0)}%) </span>
					)}
				</div>
			)}
			
			{reactionInfo && reactionInfo.isComplete && (
				<div className="reaction-details">
					<div className="detail-section">
						<h5>Reactants:</h5>
						<div className="formula-list">
							{reactionInfo.reactants.map((reactant, i) => (
								<span key={i} className="formula-item" dangerouslySetInnerHTML={{ __html: formatFormula(reactant) }} />
							))}
						</div>
					</div>
					<div className="detail-section">
						<h5>Products:</h5>
						<div className="formula-list">
							{reactionInfo.products.map((product, i) => (
								<span key={i} className="formula-item" dangerouslySetInnerHTML={{ __html: formatFormula(product) }} />
							))}
						</div>
					</div>
					{reactionInfo.reactionType !== 'other' && (
						<div className="reaction-characteristics">
							<h5>Characteristics:</h5>
							<ul>
								{getCharacteristics(reactionInfo.reactionType).map((char, i) => (
									<li key={i}>{char}</li>
								))}
							</ul>
						</div>
					)}
					<CopyButton textToCopy={reactionInfo.originalEquation} className="copy-reaction-btn" />
				</div>
			)}
			
			{isIncomplete && autoCompleteResult && autoCompleteResult.products.length > 0 && (
				<div className="reaction-prediction">
					<div className="prediction-header">
						<h4>Predicted Products</h4>
						<span className="prediction-type"> {autoCompleteResult.reactionType.charAt(0).toUpperCase() + autoCompleteResult.reactionType.slice(1)} Reaction </span>
					</div>
					<div className="predicted-equation">
						<div className="equation-part">
							<strong>Reactants:</strong>
							<div className="formula-list">
								{autoCompleteResult.fullEquation.split('->')[0].split('+').map((r, i) => (
									<span key={i} className="formula-item" dangerouslySetInnerHTML={{ __html: formatFormula(r.trim()) }} />
								))}
							</div>
						</div>
						<span className="arrow">→</span>
						<div className="equation-part">
							<strong>Predicted Products:</strong>
							<div className="formula-list predicted">
								{autoCompleteResult.products.map((p, i) => (
									<span key={i} className="formula-item" dangerouslySetInnerHTML={{ __html: formatFormula(p) }} />
								))}
							</div>
						</div>
					</div>
					<div className="prediction-description">{autoCompleteResult.description}</div>
					<div className="prediction-actions">
						<button onClick={handleApplyPrediction} className="prediction-btn apply-btn">Apply Prediction</button>
						{getBalancedEquation() && <button onClick={handleTryBalancing} className="prediction-btn balance-btn">Balance Equation</button>}
						<CopyButton textToCopy={autoCompleteResult.fullEquation} className="copy-prediction-btn" />
					</div>
					{getReactionExamples(autoCompleteResult.reactionType).length > 0 && (
						<div className="reaction-examples">
							<h5>Similar Reactions:</h5>
							<div className="example-buttons">
								{getReactionExamples(autoCompleteResult.reactionType).slice(0, 3).map((ex, i) => (
									<button key={i} onClick={() => { if (onPredict) onPredict(ex, [], autoCompleteResult.reactionType); }} className="example-btn">{ex}</button>
								))}
							</div>
						</div>
					)}
				</div>
			)}
			{isIncomplete && (!autoCompleteResult || autoCompleteResult.products.length === 0) && (
				<div className="no-prediction">
					<p>Unable to predict products for this reaction</p>
					<p>Try adding more reactants or check your input.</p>
				</div>
			)}
			{reactionInfo && reactionInfo.isComplete && (
				<div className="balanced-section">
					<p className="balance-hint"><small>Use the equation balancer to verify and balance this reaction.</small></p>
				</div>
			)}
		</div>
	);
}

export default ReactionClassifier;
