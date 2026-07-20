'use client';

interface ErrorDisplayProps {
	errors: Array<{ field: string; message: string; type: string }>;
	onFix?: (field: string) => void;
}

export function ErrorDisplay({ errors, onFix }: ErrorDisplayProps) {
	if (errors.length === 0) return null;

	return (
		<div className="physics-errors">
			<div className="physics-errors-title">⚠️ Issues Found:</div>
			{errors.map((error, i) => (
				<div key={i} className="physics-error-item">
					<span className="physics-error-bullet">•</span>
					<div className="physics-error-content">
						{error.field !== 'general' && (
							<span className="physics-error-field">{error.field}</span>
						)}
						<span className="physics-error-msg">{error.message}</span>
						{onFix && (
							<button
								onClick={() => onFix(error.field)}
								className="physics-error-fix"
							>
								Suggest fix
							</button>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

export default ErrorDisplay;
