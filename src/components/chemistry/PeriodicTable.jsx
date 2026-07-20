'use client';

import { useState } from 'react';

// Periodic table data - first 56 elements (up to Ba)
const PERIODIC_TABLE_DATA = [
	// Period 1
	{ symbol: 'H', name: 'Hydrogen', number: 1, group: 1, period: 1, category: 'nonmetal', mass: 1.008, color: '#FFC0CB' },
	{ symbol: 'He', name: 'Helium', number: 2, group: 18, period: 1, category: 'noble', mass: 4.0026, color: '#FFD700' },
	
	// Period 2
	{ symbol: 'Li', name: 'Lithium', number: 3, group: 1, period: 2, category: 'alkali', mass: 6.94, color: '#FF69B4' },
	{ symbol: 'Be', name: 'Beryllium', number: 4, group: 2, period: 2, category: 'alkaline', mass: 9.0122, color: '#90EE90' },
	{ symbol: 'B', name: 'Boron', number: 5, group: 13, period: 2, category: 'metalloid', mass: 10.81, color: '#FFA500' },
	{ symbol: 'C', name: 'Carbon', number: 6, group: 14, period: 2, category: 'nonmetal', mass: 12.011, color: '#808080' },
	{ symbol: 'N', name: 'Nitrogen', number: 7, group: 15, period: 2, category: 'nonmetal', mass: 14.007, color: '#00BFFF' },
	{ symbol: 'O', name: 'Oxygen', number: 8, group: 16, period: 2, category: 'nonmetal', mass: 15.999, color: '#FF0000' },
	{ symbol: 'F', name: 'Fluorine', number: 9, group: 17, period: 2, category: 'halogen', mass: 18.998, color: '#90EE90' },
	{ symbol: 'Ne', name: 'Neon', number: 10, group: 18, period: 2, category: 'noble', mass: 20.180, color: '#FFD700' },
	
	// Period 3
	{ symbol: 'Na', name: 'Sodium', number: 11, group: 1, period: 3, category: 'alkali', mass: 22.990, color: '#FF69B4' },
	{ symbol: 'Mg', name: 'Magnesium', number: 12, group: 2, period: 3, category: 'alkaline', mass: 24.305, color: '#90EE90' },
	{ symbol: 'Al', name: 'Aluminum', number: 13, group: 13, period: 3, category: 'metal', mass: 26.982, color: '#C0C0C0' },
	{ symbol: 'Si', name: 'Silicon', number: 14, group: 14, period: 3, category: 'metalloid', mass: 28.085, color: '#FFA500' },
	{ symbol: 'P', name: 'Phosphorus', number: 15, group: 15, period: 3, category: 'nonmetal', mass: 30.974, color: '#FF8C00' },
	{ symbol: 'S', name: 'Sulfur', number: 16, group: 16, period: 3, category: 'nonmetal', mass: 32.06, color: '#FFFF00' },
	{ symbol: 'Cl', name: 'Chlorine', number: 17, group: 17, period: 3, category: 'halogen', mass: 35.45, color: '#90EE90' },
	{ symbol: 'Ar', name: 'Argon', number: 18, group: 18, period: 3, category: 'noble', mass: 39.948, color: '#FFD700' },
	
	// Period 4
	{ symbol: 'K', name: 'Potassium', number: 19, group: 1, period: 4, category: 'alkali', mass: 39.098, color: '#FF69B4' },
	{ symbol: 'Ca', name: 'Calcium', number: 20, group: 2, period: 4, category: 'alkaline', mass: 40.078, color: '#90EE90' },
	{ symbol: 'Sc', name: 'Scandium', number: 21, group: 3, period: 4, category: 'transition', mass: 44.956, color: '#E0FFFF' },
	{ symbol: 'Ti', name: 'Titanium', number: 22, group: 4, period: 4, category: 'transition', mass: 47.867, color: '#E0FFFF' },
	{ symbol: 'V', name: 'Vanadium', number: 23, group: 5, period: 4, category: 'transition', mass: 50.942, color: '#E0FFFF' },
	{ symbol: 'Cr', name: 'Chromium', number: 24, group: 6, period: 4, category: 'transition', mass: 51.996, color: '#E0FFFF' },
	{ symbol: 'Mn', name: 'Manganese', number: 25, group: 7, period: 4, category: 'transition', mass: 54.938, color: '#E0FFFF' },
	{ symbol: 'Fe', name: 'Iron', number: 26, group: 8, period: 4, category: 'transition', mass: 55.845, color: '#E0FFFF' },
	{ symbol: 'Co', name: 'Cobalt', number: 27, group: 9, period: 4, category: 'transition', mass: 58.933, color: '#E0FFFF' },
	{ symbol: 'Ni', name: 'Nickel', number: 28, group: 10, period: 4, category: 'transition', mass: 58.693, color: '#E0FFFF' },
	{ symbol: 'Cu', name: 'Copper', number: 29, group: 11, period: 4, category: 'transition', mass: 63.546, color: '#E0FFFF' },
	{ symbol: 'Zn', name: 'Zinc', number: 30, group: 12, period: 4, category: 'metal', mass: 65.38, color: '#C0C0C0' },
	{ symbol: 'Ga', name: 'Gallium', number: 31, group: 13, period: 4, category: 'metal', mass: 69.723, color: '#C0C0C0' },
	{ symbol: 'Ge', name: 'Germanium', number: 32, group: 14, period: 4, category: 'metalloid', mass: 72.63, color: '#FFA500' },
	{ symbol: 'As', name: 'Arsenic', number: 33, group: 15, period: 4, category: 'metalloid', mass: 74.922, color: '#FF8C00' },
	{ symbol: 'Se', name: 'Selenium', number: 34, group: 16, period: 4, category: 'nonmetal', mass: 78.971, color: '#FFFF00' },
	{ symbol: 'Br', name: 'Bromine', number: 35, group: 17, period: 4, category: 'halogen', mass: 79.904, color: '#FF4500' },
	{ symbol: 'Kr', name: 'Krypton', number: 36, group: 18, period: 4, category: 'noble', mass: 83.798, color: '#FFD700' },
	
	// Period 5
	{ symbol: 'Rb', name: 'Rubidium', number: 37, group: 1, period: 5, category: 'alkali', mass: 85.468, color: '#FF69B4' },
	{ symbol: 'Sr', name: 'Strontium', number: 38, group: 2, period: 5, category: 'alkaline', mass: 87.62, color: '#90EE90' },
	{ symbol: 'Y', name: 'Yttrium', number: 39, group: 3, period: 5, category: 'transition', mass: 88.906, color: '#E0FFFF' },
	{ symbol: 'Zr', name: 'Zirconium', number: 40, group: 4, period: 5, category: 'transition', mass: 91.224, color: '#E0FFFF' },
	{ symbol: 'Nb', name: 'Niobium', number: 41, group: 5, period: 5, category: 'transition', mass: 92.906, color: '#E0FFFF' },
	{ symbol: 'Mo', name: 'Molybdenum', number: 42, group: 6, period: 5, category: 'transition', mass: 95.95, color: '#E0FFFF' },
	{ symbol: 'Tc', name: 'Technetium', number: 43, group: 7, period: 5, category: 'transition', mass: 98, color: '#E0FFFF' },
	{ symbol: 'Ru', name: 'Ruthenium', number: 44, group: 8, period: 5, category: 'transition', mass: 101.07, color: '#E0FFFF' },
	{ symbol: 'Rh', name: 'Rhodium', number: 45, group: 9, period: 5, category: 'transition', mass: 102.91, color: '#E0FFFF' },
	{ symbol: 'Pd', name: 'Palladium', number: 46, group: 10, period: 5, category: 'transition', mass: 106.42, color: '#E0FFFF' },
	{ symbol: 'Ag', name: 'Silver', number: 47, group: 11, period: 5, category: 'transition', mass: 107.87, color: '#E0FFFF' },
	{ symbol: 'Cd', name: 'Cadmium', number: 48, group: 12, period: 5, category: 'metal', mass: 112.41, color: '#C0C0C0' },
	{ symbol: 'In', name: 'Indium', number: 49, group: 13, period: 5, category: 'metal', mass: 114.82, color: '#C0C0C0' },
	{ symbol: 'Sn', name: 'Tin', number: 50, group: 14, period: 5, category: 'metal', mass: 118.71, color: '#C0C0C0' },
	{ symbol: 'Sb', name: 'Antimony', number: 51, group: 15, period: 5, category: 'metalloid', mass: 121.76, color: '#FF8C00' },
	{ symbol: 'Te', name: 'Tellurium', number: 52, group: 16, period: 5, category: 'metalloid', mass: 127.60, color: '#FFFF00' },
	{ symbol: 'I', name: 'Iodine', number: 53, group: 17, period: 5, category: 'halogen', mass: 126.90, color: '#9932CC' },
	{ symbol: 'Xe', name: 'Xenon', number: 54, group: 18, period: 5, category: 'noble', mass: 131.29, color: '#FFD700' },
	
	// Period 6
	{ symbol: 'Cs', name: 'Cesium', number: 55, group: 1, period: 6, category: 'alkali', mass: 132.91, color: '#FF69B4' },
	{ symbol: 'Ba', name: 'Barium', number: 56, group: 2, period: 6, category: 'alkaline', mass: 137.33, color: '#90EE90' },
];

const CATEGORY_COLORS = {
	alkali: '#FF69B4',
	alkaline: '#90EE90',
	transition: '#E0FFFF',
	metal: '#C0C0C0',
	metalloid: '#FFA500',
	nonmetal: '#FFFF00',
	halogen: '#FF4500',
	noble: '#FFD700'
};

export function PeriodicTable({ onElementSelect }) {
	const [searchQuery, setSearchQuery] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('all');

	const categories = ['all', 'alkali', 'alkaline', 'transition', 'metal', 'metalloid', 'nonmetal', 'halogen', 'noble'];

	const filteredElements = PERIODIC_TABLE_DATA.filter(element => {
		// Filter by search query
		const matchesSearch = element.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
			element.name.toLowerCase().includes(searchQuery.toLowerCase());
		
		// Filter by category
		const matchesCategory = selectedCategory === 'all' || element.category === selectedCategory;
		
		return matchesSearch && matchesCategory;
	});

	const handleElementClick = (element) => {
		if (onElementSelect) {
			onElementSelect(element.symbol);
		}
	};

	return (
		<div className="periodic-table-container">
			<div className="periodic-table-header">
				<h4>Periodic Table</h4>
				<div className="periodic-table-controls">
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search elements..."
						className="periodic-search"
					/>
					<select 
						value={selectedCategory} 
						onChange={(e) => setSelectedCategory(e.target.value)}
						className="category-select"
					>
						{categories.map(cat => (
							<option key={cat} value={cat}>
								{cat.charAt(0).toUpperCase() + cat.slice(1)}
							</option>
						))}
					</select>
				</div>
			</div>
			
			<div className="periodic-table-grid">
				{filteredElements.length === 0 ? (
					<div className="periodic-empty">No elements found</div>
				) : (
					filteredElements.map((element) => (
						<button
							key={element.symbol}
							className="periodic-element"
							onClick={() => handleElementClick(element)}
							style={{ backgroundColor: CATEGORY_COLORS[element.category] || '#CCCCCC' }}
							title={`${element.name} (${element.symbol}) - Atomic Mass: ${element.mass}`}
						>
							<div className="element-symbol">{element.symbol}</div>
							<div className="element-number">{element.number}</div>
							<div className="element-name">{element.name}</div>
						</button>
					))
				)}
			</div>
			
			<div className="periodic-legend">
				{categories.slice(1).map(cat => (
					<div key={cat} className="legend-item">
						<span 
							className="legend-color" 
							style={{ backgroundColor: CATEGORY_COLORS[cat] }}
						/>
						<span className="legend-label">{cat}</span>
					</div>
				))}
			</div>
		</div>
	);
}

export default PeriodicTable;
