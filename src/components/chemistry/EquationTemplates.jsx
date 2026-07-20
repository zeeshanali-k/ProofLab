'use client';

import { useState } from 'react';

const TEMPLATE_CATEGORIES = [
	{
		name: 'Combustion',
		templates: [
			{ name: 'Methane', equation: 'CH4 + O2 -> CO2 + H2O' },
			{ name: 'Ethane', equation: 'C2H6 + O2 -> CO2 + H2O' },
			{ name: 'Propane', equation: 'C3H8 + O2 -> CO2 + H2O' },
			{ name: 'Butane', equation: 'C4H10 + O2 -> CO2 + H2O' },
			{ name: 'Glucose', equation: 'C6H12O6 + O2 -> CO2 + H2O' },
		]
	},
	{
		name: 'Acid-Base',
		templates: [
			{ name: 'HCl + NaOH', equation: 'HCl + NaOH -> NaCl + H2O' },
			{ name: 'H2SO4 + NaOH', equation: 'H2SO4 + NaOH -> Na2SO4 + H2O' },
			{ name: 'HCl + Ca(OH)2', equation: 'HCl + Ca(OH)2 -> CaCl2 + H2O' },
			{ name: 'Acetic Acid', equation: 'CH3COOH + NaOH -> CH3COONa + H2O' },
		]
	},
	{
		name: 'Decomposition',
		templates: [
			{ name: 'Water', equation: 'H2O -> H2 + O2' },
			{ name: 'Hydrogen Peroxide', equation: 'H2O2 -> H2O + O2' },
			{ name: 'Calcium Carbonate', equation: 'CaCO3 -> CaO + CO2' },
			{ name: 'Ammonium Nitrate', equation: 'NH4NO3 -> N2O + H2O' },
		]
	},
	{
		name: 'Synthesis',
		templates: [
			{ name: 'Water Formation', equation: 'H2 + O2 -> H2O' },
			{ name: 'Ammonia', equation: 'N2 + H2 -> NH3' },
			{ name: 'Iron(III) Oxide', equation: 'Fe + O2 -> Fe2O3' },
			{ name: 'Calcium Oxide', equation: 'Ca + O2 -> CaO' },
		]
	},
	{
		name: 'Redox',
		templates: [
			{ name: 'Iron + Copper Sulfate', equation: 'Fe + CuSO4 -> FeSO4 + Cu' },
			{ name: 'Zinc + Hydrochloric Acid', equation: 'Zn + HCl -> ZnCl2 + H2' },
			{ name: 'Copper + Silver Nitrate', equation: 'Cu + AgNO3 -> Cu(NO3)2 + Ag' },
		]
	},
	{
		name: 'Precipitation',
		templates: [
			{ name: 'Lead Iodide', equation: 'Pb(NO3)2 + KI -> PbI2 + KNO3' },
			{ name: 'Silver Chloride', equation: 'AgNO3 + NaCl -> AgCl + NaNO3' },
			{ name: 'Calcium Carbonate', equation: 'CaCl2 + Na2CO3 -> CaCO3 + NaCl' },
		]
	},
	{
		name: 'Equilibrium',
		templates: [
			{ name: 'Ammonia (Haber)', equation: 'N2 + H2 ⇌ NH3' },
			{ name: 'SO2 to SO3', equation: 'SO2 + O2 ⇌ SO3' },
			{ name: 'Hydrogen Iodide', equation: 'H2 + I2 ⇌ HI' },
		]
	}
];

export function EquationTemplates({ onSelect }) {
	const [expandedCategory, setExpandedCategory] = useState(null);
	const [searchQuery, setSearchQuery] = useState('');

	const toggleCategory = (categoryName) => {
		setExpandedCategory(expandedCategory === categoryName ? null : categoryName);
	};

	const filteredTemplates = TEMPLATE_CATEGORIES.map(category => ({
		...category,
		templates: category.templates.filter(template =>
			template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			template.equation.toLowerCase().includes(searchQuery.toLowerCase())
		)
	})).filter(category => category.templates.length > 0);

	return (
		<div className="equation-templates-container">
			<div className="templates-header">
				<h4>Equation Templates</h4>
				<input
					type="text"
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					placeholder="Search templates..."
					className="templates-search"
				/>
			</div>
			
			<div className="templates-list">
				{filteredTemplates.length === 0 ? (
					<div className="templates-empty">No templates found</div>
				) : (
					filteredTemplates.map((category) => (
						<div key={category.name} className="template-category">
							<div 
								className="category-header"
								onClick={() => toggleCategory(category.name)}
							>
								<span className="category-name">{category.name}</span>
								<span className="category-toggle">
									{expandedCategory === category.name ? '▼' : '▶'}
								</span>
							</div>
							
							{expandedCategory === category.name && (
								<div className="category-templates">
									{category.templates.map((template) => (
										<button
											key={template.equation}
											className="template-item"
											onClick={() => onSelect(template.equation)}
										>
											<span className="template-name">{template.name}</span>
											<span className="template-equation">{template.equation}</span>
										</button>
									))}
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
}

export default EquationTemplates;
