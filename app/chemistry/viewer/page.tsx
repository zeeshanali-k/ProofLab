'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import MoleculeViewer to avoid SSR issues with 3Dmol
const MoleculeViewer = dynamic(
	() => import('../../../src/components/chemistry/MoleculeViewer'),
	{ ssr: false }
);

export default function ViewerPage() {
	const [pdbId, setPdbId] = useState('1CRN');
	const [style, setStyle] = useState<'cartoon' | 'stick' | 'sphere' | 'surface'>('cartoon');
	const [width, setWidth] = useState(600);
	const [height, setHeight] = useState(500);
	
	// Common PDB IDs for demo
	const pdbExamples = [
		{ id: '1CRN', name: 'Crambin (Plant Protein)' },
		{ id: '4N8T', name: 'Protein Complex' },
		{ id: '1MBA', name: 'Myoglobin' },
		{ id: '2HHB', name: 'Hemoglobin' },
		{ id: '1C8O', name: 'DNA Polymerase' },
		{ id: '3E6H', name: 'Insulin' },
	];
	
	const handleLoad = () => {
		// Just trigger a re-render with the current settings
		setPdbId(pdbId);
	};
	
	return (
		<main className="chemistry-page viewer-page">
			<div className="page-header">
				<h1>🧪 3D Molecule Viewer</h1>
				<p className="page-description">
					Explore molecular structures in 3D. Drag to rotate, scroll to zoom, and right-click for more options.
				</p>
			</div>
			
			<div className="viewer-controls">
				<div className="control-group">
					<label className="control-label">PDB ID</label>
					<div className="pdb-selector">
						<select 
							value={pdbId} 
							onChange={(e) => setPdbId(e.target.value)}
							className="pdb-select"
						>
							{pdbExamples.map((example) => (
								<option key={example.id} value={example.id}>
									{example.id} - {example.name}
								</option>
							))}
						</select>
						<button onClick={handleLoad} className="load-btn">
							Load Molecule
						</button>
					</div>
				</div>
				
				<div className="control-group">
					<label className="control-label">Visualization Style</label>
					<select 
						value={style} 
						onChange={(e) => setStyle(e.target.value as 'cartoon' | 'stick' | 'sphere' | 'surface')}
						className="style-select"
					>
						<option value="cartoon">Cartoon</option>
						<option value="stick">Stick</option>
						<option value="sphere">Sphere</option>
						<option value="surface">Surface</option>
					</select>
				</div>
				
				<div className="control-group">
					<label className="control-label">Dimensions</label>
					<div className="dimension-controls">
						<div className="dimension-input">
							<label>Width (px)</label>
							<input 
								type="number" 
								value={width} 
								onChange={(e) => setWidth(parseInt(e.target.value) || 600)}
								min="300"
								max="1200"
							/>
						</div>
						<div className="dimension-input">
							<label>Height (px)</label>
							<input 
								type="number" 
								value={height} 
								onChange={(e) => setHeight(parseInt(e.target.value) || 500)}
								min="300"
								max="1000"
							/>
						</div>
					</div>
				</div>
			</div>
			
			<div className="viewer-container">
				<MoleculeViewer 
					pdbId={pdbId} 
					style={style} 
					width={width} 
					height={height}
				/>
			</div>
			
			<div className="viewer-info">
				<h3>📚 About PDB Files</h3>
				<p>
					The Protein Data Bank (PDB) is a repository for 3D structural data of proteins, nucleic acids, and complex assemblies.
					Each structure has a unique 4-character identifier (PDB ID).
				</p>
				
				<h4>Controls:</h4>
				<ul className="controls-list">
					<li><strong>Left-click + drag:</strong> Rotate the molecule</li>
					<li><strong>Scroll:</strong> Zoom in/out</li>
					<li><strong>Right-click:</strong> Show context menu</li>
					<li><strong>Double-click:</strong> Center the view</li>
				</ul>
				
				<h4>Common PDB IDs:</h4>
				<div className="pdb-examples">
					{pdbExamples.map((example) => (
						<button 
							key={example.id} 
							onClick={() => setPdbId(example.id)}
							className="pdb-example-btn"
						>
							{example.id} - {example.name}
						</button>
					))}
				</div>
			</div>
		</main>
	);
}
