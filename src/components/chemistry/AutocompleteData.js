// Common chemical elements (first 50)
export const ELEMENTS = [
	'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
	'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
	'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
	'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
	'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn'
];

// Common polyatomic ions
export const POLYATOMIC_IONS = [
	'NH4+', 'NO3-', 'NO2-', 'SO4^2-', 'SO3^2-', 'CO3^2-',
	'HCO3-', 'PO4^3-', 'HPO4^2-', 'H2PO4-', 'OH-', 'CN-',
	'C2H3O2-', 'ClO-', 'ClO2-', 'ClO3-', 'ClO4-', 'MnO4-',
	'CrO4^2-', 'Cr2O7^2-', 'S2O3^2-', 'C4H4O6^2-'
];

// Common compounds
export const COMMON_COMPOUNDS = [
	// Water and simple compounds
	'H2O', 'H2O2', 'CO', 'CO2', 'NO', 'NO2', 'N2O', 'SO2', 'SO3',
	
	// Acids
	'HCl', 'HBr', 'HI', 'H2S', 'H2SO4', 'HNO3', 'H3PO4', 'H2CO3',
	'CH3COOH', 'HClO', 'HClO2', 'HClO3', 'HClO4',
	
	// Salts
	'NaCl', 'KCl', 'NaOH', 'KOH', 'Ca(OH)2', 'Mg(OH)2', 'Al(OH)3',
	'Na2CO3', 'K2CO3', 'CaCO3', 'NaHCO3', 'KHCO3',
	'Na2SO4', 'K2SO4', 'CaSO4', 'MgSO4', 'Al2(SO4)3',
	'NaNO3', 'KNO3', 'Ca(NO3)2', 'Mg(NO3)2', 'Al(NO3)3',
	'Na3PO4', 'K3PO4', 'Ca3(PO4)2',
	
	// Hydrocarbons
	'CH4', 'C2H6', 'C3H8', 'C4H10', 'C2H4', 'C2H2', 'C6H6',
	'CH3OH', 'C2H5OH',
	
	// Oxides
	'Fe2O3', 'Fe3O4', 'FeO', 'Al2O3', 'CuO', 'Cu2O', 'ZnO',
	'CaO', 'MgO', 'Na2O', 'K2O', 'CO', 'CO2', 'NO', 'NO2',
	
	// Other common compounds
	'NH3', 'N2H4', 'HCN', 'CS2', 'PCl3', 'PCl5', 'CCl4',
	'SiO2', 'SiC', 'BF3', 'B2H6'
];

// Common states
export const STATES = ['(s)', '(l)', '(g)', '(aq)'];

// All suggestions combined and sorted by length (shorter first for better matching)
export const ALL_SUGGESTIONS = [
	...ELEMENTS,
	...POLYATOMIC_IONS,
	...COMMON_COMPOUNDS,
	...STATES
].sort((a, b) => a.length - b.length);

// Function to get autocomplete suggestions
export function getAutocompleteSuggestions(input) {
	if (!input || input.length === 0) return [];
	
	const inputLower = input.toLowerCase();
	const suggestions = [];
	
	// Match elements first
	for (const el of ELEMENTS) {
		if (el.toLowerCase().startsWith(inputLower)) {
			suggestions.push({ type: 'element', value: el });
		}
	}
	
	// Match polyatomic ions
	for (const ion of POLYATOMIC_IONS) {
		if (ion.toLowerCase().startsWith(inputLower)) {
			suggestions.push({ type: 'ion', value: ion });
		}
	}
	
	// Match common compounds
	for (const compound of COMMON_COMPOUNDS) {
		if (compound.toLowerCase().startsWith(inputLower)) {
			suggestions.push({ type: 'compound', value: compound });
		}
	}
	
	// Match states
	for (const state of STATES) {
		if (state.toLowerCase().startsWith(inputLower)) {
			suggestions.push({ type: 'state', value: state });
		}
	}
	
	return suggestions.slice(0, 10); // Limit to 10 suggestions
}

export default { ELEMENTS, POLYATOMIC_IONS, COMMON_COMPOUNDS, STATES, ALL_SUGGESTIONS, getAutocompleteSuggestions };
