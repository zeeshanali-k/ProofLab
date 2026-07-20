'use client';

import { useState, useCallback } from 'react';
import { balanceWithSteps } from '../../../lib/chemistry/balancer';
import EquationInput from '../../../src/components/chemistry/EquationInput';
import BalancedEquation from '../../../src/components/chemistry/BalancedEquation';
import ReactionClassifier from '../../../src/components/chemistry/ReactionClassifier';

interface BalanceResultWithSteps {
	equation: string;
	reactants: Array<{ formula: string; coefficient: number }>;
	products: Array<{ formula: string; coefficient: number }>;
	isValid: boolean;
	error?: string;
	steps?: string[];
}

const EXAMPLE_EQUATIONS = [
	'H2 + O2 -> H2O',
	'CH4 + O2 -> CO2 + H2O',
	'HCl + NaOH -> NaCl + H2O',
	'Fe + O2 -> Fe2O3',
];

export default function BalancePage() {
	const [result, setResult] = useState<BalanceResultWithSteps | null>(null);
	const [error, setError] = useState('');
	const [showClassifier, setShowClassifier] = useState(false);
	const [selectedExample, setSelectedExample] = useState('');

	const handleBalance = (balanceResult: any) => {
		const { result: fullResult, steps } = balanceWithSteps(balanceResult.equation);
		setResult({ ...fullResult, steps } as BalanceResultWithSteps);
		setError('');
	};

	const handleExampleClick = useCallback((equation: string) => {
		setSelectedExample(equation);
		setResult(null);
		setError('');
		setShowClassifier(false);
	}, []);

	return (
		<main className="chemistry-page balance-page">
			<div className="page-header">
				<h1>⚖️ Equation Balancer</h1>
				<p className="page-description">
					Balance chemical equations with step-by-step solutions.
					Enter any valid chemical equation to get started.
				</p>
			</div>

			<div className="balance-container">
				<EquationInput onBalance={handleBalance} onError={setError} value={selectedExample} />

				{error && (
					<div className="error-message">
						⚠️ {error}
					</div>
				)}

				{result && (
					<div className="balance-results">
						<BalancedEquation result={result} steps={result.steps} />

						<button
							onClick={() => setShowClassifier(!showClassifier)}
							className="classify-btn"
						>
							{showClassifier ? 'Hide' : 'Classify'} Reaction Type
						</button>

						{showClassifier && (
							<ReactionClassifier equation={result.equation} />
						)}
					</div>
				)}

				<div className="balance-examples">
					<h3>Examples (click to load):</h3>
					<div className="example-buttons">
						{EXAMPLE_EQUATIONS.map((eq) => (
							<button
								key={eq}
								onClick={() => handleExampleClick(eq)}
								className="example-btn"
							>
								{eq}
							</button>
						))}
					</div>
				</div>
			</div>
		</main>
	);
}
