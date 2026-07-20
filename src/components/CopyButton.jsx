'use client';

import { useState } from 'react';

/**
 * @param {{ textToCopy: string, children?: React.ReactNode, className?: string, onCopy?: (text: string) => void, onError?: (err: any) => void }} props
 */
export function CopyButton({ textToCopy, children, className = '', onCopy, onError }) {
	const [copied, setCopied] = useState(false);
	const [copyError, setCopyError] = useState(null);
	
	const handleCopy = async () => {
		if (!textToCopy) {
			const errorMsg = 'No text to copy';
			setCopyError(errorMsg);
			if (onError) onError(errorMsg);
			setTimeout(() => setCopyError(null), 2000);
			return;
		}
		
		try {
			await navigator.clipboard.writeText(textToCopy);
			setCopied(true);
			setCopyError(null);
			if (onCopy) onCopy(textToCopy);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			const errorMsg = 'Failed to copy to clipboard';
			setCopyError(errorMsg);
			if (onError) onError(err);
			setTimeout(() => setCopyError(null), 2000);
		}
	};
	
	return (
		<button
			onClick={handleCopy}
			className={`copy-btn ${className}`}
			aria-label={copied ? 'Copied to clipboard' : copyError || 'Copy to clipboard'}
			title={copied ? 'Copied!' : copyError || 'Copy to clipboard'}
			disabled={!textToCopy}
		>
			{copied ? '✓ Copied!' : copyError || children || 'Copy'}
		</button>
	);
}

export default CopyButton;
