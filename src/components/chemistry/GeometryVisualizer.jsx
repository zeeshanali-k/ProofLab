'use client';

import { useState } from 'react';
import { calculateMolecularGeometry, getGeometryExamples, getAllGeometries } from '../../../lib/chemistry/geometry';
import CopyButton from '../CopyButton';

export function GeometryVisualizer() {
	const [formula, setFormula] = useState('H2O');
	const [geometryResult, setGeometryResult] = useState(null);
	const [error, setError] = useState('');
	const [selectedGeometry, setSelectedGeometry] = useState(null);
	const [showAllGeometries, setShowAllGeometries] = useState(false);

	const geometryExamples = getGeometryExamples();
	const allGeometries = getAllGeometries();

	const handleFormulaChange = (e) => {
		const value = e.target.value;
		setFormula(value);
		if (value.trim()) {
			try {
				const result = calculateMolecularGeometry(value);
				setGeometryResult(result);
				setError('');
			} catch (err) {
				setError('Invalid formula. Use format like H2O, CH4, NH3, CO2');
				setGeometryResult(null);
			}
		} else {
			setGeometryResult(null);
			setError('');
		}
	};

	const loadExample = (exampleFormula) => {
		setFormula(exampleFormula);
		try {
			const result = calculateMolecularGeometry(exampleFormula);
			setGeometryResult(result);
			setError('');
		} catch (err) {
			setError('Could not analyze this example');
			setGeometryResult(null);
		}
	};

	const getGeometryInfo = (geometry) => {
		const info = allGeometries.find(g => g.name === geometry);
		return info || null;
	};

	const formatFormula = (formula) => {
		if (!formula) return formula;
		// Convert subscripts to HTML sub tags
		return formula.replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>');
	};

	const getGeometryAsciiArt = (geometryName) => {
		const art = {
			'Linear': (
				<div className="ascii-art">
					<pre>A — B</pre>
					<p className="art-label">Linear: 180°</p>
				</div>
			),
			'Bent': (
				<div className="ascii-art">
					<pre>\   /<br />  A<br /> /   \\</pre>
					<p className="art-label">Bent: ~104.5° or ~117°</p>
				</div>
			),
			'Trigonal Planar': (
				<div className="ascii-art">
					<pre>    B<br />   / \<br />A — B<br />   \\ /<br />    B</pre>
					<p className="art-label">Trigonal Planar: 120°</p>
				</div>
			),
			'Trigonal Pyramidal': (
				<div className="ascii-art">
					<pre>    B<br />   / \<br />A — B<br />   \\ /<br />    B</pre>
					<p className="art-label">Trigonal Pyramidal: ~107°</p>
				</div>
			),
			'Tetrahedral': (
				<div className="ascii-art">
					<pre>   B<br />  /|\<br /> / | \<br />A  |<br />  \|/<br />   B</pre>
					<p className="art-label">Tetrahedral: 109.5°</p>
				</div>
			),
			'Seesaw': (
				<div className="ascii-art">
					<pre>  B   B<br />   \ /<br />A — B<br />   / \<br />  B   B</pre>
					<p className="art-label">Seesaw</p>
				</div>
			),
			'T-shaped': (
				<div className="ascii-art">
					<pre>B — A — B<br />    |<br />    B</pre>
					<p className="art-label">T-shaped: 90°, 180°</p>
				</div>
			),
			'Trigonal Bipyramidal': (
				<div className="ascii-art">
					<pre>    B<br />   / \<br />A — B<br />   / \<br />    B<br />    |<br />    B</pre>
					<p className="art-label">Trigonal Bipyramidal</p>
				</div>
			),
			'Square Pyramidal': (
				<div className="ascii-art">
					<pre>  B B<br /> B A B<br />  B B</pre>
					<p className="art-label">Square Pyramidal</p>
				</div>
			),
			'Square Planar': (
				<div className="ascii-art">
					<pre>  B A B<br />  | | |<br />  B A B</pre>
					<p className="art-label">Square Planar: 90°</p>
				</div>
			),
			'Octahedral': (
				<div className="ascii-art">
					<pre>  B<br /> /|\<br />B | B<br /> \|/<br />  B<br />  |<br />  B</pre>
					<p className="art-label">Octahedral: 90°, 180°</p>
				</div>
			)
		};

		return art[geometryName] || (
			<div className="ascii-art">
				<pre>Geometry: {geometryName}</pre>
			</div>
		);
	};

	return (
		<div className="geometry-visualizer">
			<div className="visualizer-header">
				<h2>Molecular Geometry Visualizer</h2>
				<p className="subtitle">Using VSEPR Theory to predict molecular shape, hybridization, and polarity</p>
			</div>

			<div className="input-section">
				<div className="formula-input-group">
					<label htmlFor="formula-input">Chemical Formula:</label>
					<input
						type="text"
						id="formula-input"
						value={formula}
						onChange={handleFormulaChange}
						placeholder="Enter formula (e.g., H2O, CH4, NH3, CO2)"
						className="formula-input"
					/>
					<CopyButton textToCopy={formula} className="copy-formula-btn" />
				</div>

				<div className="example-buttons">
					<h4>Quick Examples:</h4>
					<div className="examples-grid">
						{Object.entries(geometryExamples).slice(0, 8).map(([geometry, formulas]) => (
							<button key={geometry} onClick={() => loadExample(formulas[0])} className="example-btn">
								{geometry}
							</button>
						))}
					</div>
				</div>
			</div>

			{error && <div className="error-message">{error}</div>}

			{geometryResult && (
				<div className="geometry-result">
					<div className="result-header">
						<h3>Results for: <span dangerouslySetInnerHTML={{ __html: formatFormula(formula) }} /></h3>
					</div>

					<div className="result-grid">
						<div className="geometry-card">
							<h4>Molecular Geometry</h4>
							<div className="geometry-name">
								{geometryResult.molecularGeometry.name.replace(/\s*\([^)]*\)/, '')}
							</div>
							{getGeometryAsciiArt(geometryResult.molecularGeometry.name.replace(/\s*\([^)]*\)/, ''))}
							<p className="geometry-description">{geometryResult.molecularGeometry.description}</p>
						</div>

						<div className="vsepr-card">
							<h4>VSEPR Theory</h4>
							<p>{geometryResult.vseprTheory}</p>
							<div className="vsepr-details">
								<div className="vsepr-stat">
									<span className="stat-label">Steric Number:</span>
									<span className="stat-value">{geometryResult.stericNumber}</span>
								</div>
								<div className="vsepr-stat">
									<span className="stat-label">Bonding Pairs:</span>
									<span className="stat-value">{geometryResult.bondingPairs}</span>
								</div>
								<div className="vsepr-stat">
									<span className="stat-label">Lone Pairs:</span>
									<span className="stat-value">{geometryResult.lonePairs}</span>
								</div>
							</div>
						</div>

						<div className="properties-card">
							<h4>Molecular Properties</h4>
							<div className="property-list">
								<div className="property-item">
									<span className="property-label">Hybridization:</span>
									<span className="property-value">
										{(geometryResult.stericNumber === 2 && 'sp') ||
										 (geometryResult.stericNumber === 3 && 'sp2') ||
										 (geometryResult.stericNumber === 4 && 'sp3') ||
										 (geometryResult.stericNumber === 5 && 'sp3d') ||
										 (geometryResult.stericNumber === 6 && 'sp3d2') ||
										 'Unknown'}
									</span>
								</div>
								<div className="property-item">
									<span className="property-label">Polarity:</span>
									<span className="property-value">
										{geometryResult.molecularGeometry.name.includes('Polar') ? 'Polar' : 'Non-polar'}
									</span>
								</div>
								<div className="property-item">
									<span className="property-label">Electron Pairs:</span>
									<span className="property-value">{geometryResult.electronPairs}</span>
								</div>
								<div className="property-item">
									<span className="property-label">Bond Angles:</span>
									<span className="property-value">
										{geometryResult.molecularGeometry.bondAngles.join(', ') + '°'}
									</span>
								</div>
							</div>
						</div>
					</div>

					{!showAllGeometries && (
						<div className="more-info">
							<button onClick={() => setShowAllGeometries(true)} className="show-all-btn">
								Show All VSEPR Geometries
							</button>
						</div>
					)}

					{showAllGeometries && (
						<div className="all-geometries">
							<h3>All VSEPR Geometries</h3>
							<div className="geometries-grid">
								{allGeometries.map((geo, index) => (
									<div key={index} className="geometry-tile">
										<h4>{geo.name}</h4>
										<p><small>SN: {geo.stericNumber}, LP: {geo.lonePairs}</small></p>
										<p className="geo-description">{geo.description}</p>
									</div>
								))}
							</div>
							<button onClick={() => setShowAllGeometries(false)} className="hide-all-btn">
								Hide Geometries
							</button>
						</div>
					)}
				</div>
			)}

			{!geometryResult && !error && formula.trim() && (
				<div className="no-result">
					<p>Enter a chemical formula to analyze its molecular geometry.</p>
				</div>
			)}
		</div>
	);
}

export default GeometryVisualizer;
