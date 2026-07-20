export interface EquationInput {
	raw: string;
	arrowType: '->' | '⇌' | '=';
}

export interface EquationResult {
	balanced: string;
	reactants: Reactant[];
	products: Product[];
	reactionType?: 'combustion' | 'acid-base' | 'redox' | 'precipitation' | 'decomposition';
	isReversible: boolean;
}

export interface Reactant {
	formula: string;
	coefficient: number;
	state?: 's' | 'l' | 'g' | 'aq';
}

export interface Product {
	formula: string;
	coefficient: number;
	state?: 's' | 'l' | 'g' | 'aq';
}

export interface ValidationError {
	type: 'unbalanced' | 'invalid_formula' | 'missing_state' | 'invalid_arrow';
	message: string;
	location?: string;
}

export interface BalanceResult {
	equation: string;
	reactants: Array<{ formula: string; coefficient: number }>;
	products: Array<{ formula: string; coefficient: number }>;
	isValid: boolean;
	error?: string;
}

export interface ParsedFormula {
	elements: Record<string, number>;
	molecularWeight: number;
	formulaString: string;
}

export interface MolarMassResult {
	formula: string;
	molarMass: number;
	breakdown: Array<{ element: string; count: number; mass: number }>;
}

export interface OxidationStateResult {
	formula: string;
	oxidationStates: Record<string, number>;
}

export interface GasLawParams {
	pressure: number;
	moles: number;
	temperature: number;
}

export interface GasLawResult {
	volume: number;
}

export type ViewerStyle = 'cartoon' | 'stick' | 'sphere' | 'surface';

export interface MoleculeViewerProps {
	pdbId?: string;
	smiles?: string;
	style?: ViewerStyle;
	width?: number;
	height?: number;
}

// Suggestion for auto-correction
export interface Suggestion {
	corrected: string;
	message: string;
	type: 'arrow' | 'formula' | 'state' | 'typo';
}

// Stoichiometry Types
export interface StoichiometryResult {
	isValid: boolean;
	equation?: string;
	givenSpecies?: string;
	givenMass?: number;
	molesGiven?: number;
	molarMass?: number;
	results?: Record<string, { mass: number; moles: number; formula: string }>;
	reactants?: Array<{ formula: string; coefficient: number }>;
	products?: Array<{ formula: string; coefficient: number }>;
	error?: string;
}

export interface LimitingReactantResult {
	isValid: boolean;
	equation?: string;
	limitingReactant?: string;
	excessReactants?: Array<{ species: string; moles: number; mass: number; molesRequired: number }>;
	reactantMoles?: Record<string, number>;
	reactantMolarMasses?: Record<string, number>;
	error?: string;
}

export interface TheoreticalYieldResult {
	isValid: boolean;
	equation?: string;
	limitingReactant?: string;
	limitingReactantMass?: number;
	targetProduct?: string;
	theoreticalYield?: number;
	moleRatio?: number;
	limitingMolarMass?: number;
	productMolarMass?: number;
	error?: string;
}

// Solution Chemistry Types
export interface MolarityResult {
	molarity: number;
	moles: number;
	volumeLiters: number;
	formula: string;
}

export interface DilutionResult {
	initialMolarity: number;
	initialVolume: number;
	finalVolume: number;
	finalMolarity: number;
	volumeToAdd: number;
}

export interface SolutionMixingResult {
	moles1: number;
	moles2: number;
	totalMoles: number;
	finalMolarity: number;
	finalVolume: number;
}

// Thermochemistry Types
export interface ThermochemistryResult {
	reactionEnthalpy: number; // kJ/mol
	formationEnthalpies: Record<string, number>;
	bondEnergies?: Record<string, number>;
}

// Standard enthalpies of formation (kJ/mol)
export type EnthalpyData = Record<string, number>;

// Equilibrium Types
export interface EquilibriumResult {
	Keq: number;
	Q: number;
	reactionQuotient: number;
	reactionDirection: 'forward' | 'reverse' | 'at equilibrium';
}

// Electrochemistry Types
export interface ElectrochemistryResult {
	cellPotential: number; // V
	standardPotentials: Record<string, number>;
	anode: string;
	cathode: string;
	cellNotation: string;
	spontaneous: boolean;
}

// Standard reduction potentials (V)
export type ReductionPotentialData = Record<string, number>;

// Geometry Types
export interface MolecularGeometry {
	name: string;
	bondAngles: number[];
	bondLengths?: number[];
	description: string;
	image?: string;
}

export interface GeometryResult {
	molecularGeometry: MolecularGeometry;
	electronPairs: number;
	bondingPairs: number;
	lonePairs: number;
	stericNumber: number;
	vseprTheory: string;
}
