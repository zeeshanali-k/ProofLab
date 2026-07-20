'use client';

interface ErrorDisplayProps {
	errors: Array<{ field: string; message: string; type: string }>;
}

export function ErrorDisplay({ errors }: ErrorDisplayProps) {
	if (errors.length === 0) return null;

	return (
		<div className="bio-errors">
			<div className="bio-errors-title">⚠️ Issues Found:</div>
			{errors.map((error, i) => (
				<div key={i} className="bio-error-item">
					<span className="bio-error-bullet">•</span>
					<div>
						{error.field !== 'general' && (
							<span className="bio-error-field">{error.field}</span>
						)}
						<span className="bio-error-msg">{error.message}</span>
					</div>
				</div>
			))}
		</div>
	);
}

export default ErrorDisplay;
