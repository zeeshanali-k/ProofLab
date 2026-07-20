'use client';

import { useState, useRef, useEffect } from 'react';
import { getAutocompleteSuggestions } from './AutocompleteData';

export function Autocomplete({ value, onChange, placeholder = 'Enter formula...', className = '' }) {
	const [inputValue, setInputValue] = useState(value || '');
	const [suggestions, setSuggestions] = useState([]);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [activeSuggestion, setActiveSuggestion] = useState(0);
	const wrapperRef = useRef(null);

	useEffect(() => {
		setInputValue(value || '');
	}, [value]);

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setShowSuggestions(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleChange = (e) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		
		// Get suggestions
		if (newValue.length > 0) {
			const newSuggestions = getAutocompleteSuggestions(newValue);
			setSuggestions(newSuggestions);
			setShowSuggestions(newSuggestions.length > 0);
		} else {
			setSuggestions([]);
			setShowSuggestions(false);
		}
		
		// Notify parent of change
		if (onChange) {
			onChange(newValue);
		}
	};

	const handleSelectSuggestion = (suggestionValue) => {
		// Replace the current word/partial with the suggestion
		const parts = inputValue.split(/([\s\+->⇌=])/);
		const lastPart = parts[parts.length - 1];
		
		// Find where the current input matches the beginning of the suggestion
		if (lastPart && suggestionValue.startsWith(lastPart)) {
			const newParts = [...parts];
			newParts[newParts.length - 1] = suggestionValue;
			const newValue = newParts.join('');
			setInputValue(newValue);
			if (onChange) {
				onChange(newValue);
			}
		} else {
			// Just append the suggestion
			const newValue = inputValue + suggestionValue;
			setInputValue(newValue);
			if (onChange) {
				onChange(newValue);
			}
		}
		
		setShowSuggestions(false);
		setActiveSuggestion(0);
	};

	const handleKeyDown = (e) => {
		if (!showSuggestions) {
			return;
		}

		switch (e.key) {
			case 'ArrowDown':
				e.preventDefault();
				setActiveSuggestion((prev) => 
					prev < suggestions.length - 1 ? prev + 1 : prev
				);
				break;
			case 'ArrowUp':
				e.preventDefault();
				setActiveSuggestion((prev) => 
					prev > 0 ? prev - 1 : prev
				);
				break;
			case 'Enter':
				e.preventDefault();
				if (suggestions.length > 0) {
					handleSelectSuggestion(suggestions[activeSuggestion].value);
				}
				break;
			case 'Escape':
				e.preventDefault();
				setShowSuggestions(false);
				break;
			default:
				break;
		}
	};

	return (
		<div className={`autocomplete-wrapper ${className}`} ref={wrapperRef}>
			<input
				type="text"
				value={inputValue}
				onChange={handleChange}
				onKeyDown={handleKeyDown}
				placeholder={placeholder}
				className="autocomplete-input"
			/>
			
			{showSuggestions && suggestions.length > 0 && (
				<ul className="autocomplete-suggestions">
					{suggestions.map((suggestion, index) => (
						<li
							key={suggestion.value}
							className={`suggestion-item ${index === activeSuggestion ? 'active' : ''}`}
							onClick={() => handleSelectSuggestion(suggestion.value)}
						>
							<span className="suggestion-type">{suggestion.type}</span>
							<span className="suggestion-value">{suggestion.value}</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

export default Autocomplete;
