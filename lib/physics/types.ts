export interface PhysicsEquation {
	id: string;
	name: string;
	latex: string;
	variables: Variable[];
	solveFor: (target: string, known: Record<string, number>) => number | null;
	validate: (inputs: Record<string, number>) => ValidationResult;
}

export interface Variable {
	symbol: string;
	name: string;
	unit: string;
	min?: number;
	max?: number;
	default?: number;
}

export interface ValidationResult {
	isValid: boolean;
	errors: ValidationError[];
}

export interface ValidationError {
	field: string;
	message: string;
	type: 'missing' | 'out_of_range' | 'unit_mismatch' | 'inconsistent' | 'syntax';
}

export interface KinematicsResult {
	displacement: number;
	finalVelocity: number;
	acceleration: number;
	time: number;
	graphs: {
		position: { t: number[]; values: number[] };
		velocity: { t: number[]; values: number[] };
		acceleration: { t: number[]; values: number[] };
	};
}

export interface EnergyResult {
	kinetic: number;
	potential: number;
	total: number;
}

export interface Vector2D {
	x: number;
	y: number;
	magnitude: number;
	angle: number;
}

export interface VectorResult {
	vectors: Vector2D[];
	resultant: Vector2D;
	components: { x: number[]; y: number[] };
}

export interface CircuitResult {
	totalResistance: number;
	totalCurrent: number;
	voltageDrops: { component: string; voltage: number }[];
	power: number;
}
