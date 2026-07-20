import type { Vector2D } from './types';

export function createVector(x: number, y: number): Vector2D {
	const magnitude = Math.sqrt(x * x + y * y);
	const angle = Math.atan2(y, x) * 180 / Math.PI;
	return { x, y, magnitude, angle };
}

export function addVectors(vectors: Vector2D[]): Vector2D {
	const sumX = vectors.reduce((sum, v) => sum + v.x, 0);
	const sumY = vectors.reduce((sum, v) => sum + v.y, 0);
	return createVector(sumX, sumY);
}

export function subtractVectors(v1: Vector2D, v2: Vector2D): Vector2D {
	return createVector(v1.x - v2.x, v1.y - v2.y);
}

export function scaleVector(v: Vector2D, scalar: number): Vector2D {
	return createVector(v.x * scalar, v.y * scalar);
}

export function dotProduct(v1: Vector2D, v2: Vector2D): number {
	return v1.x * v2.x + v1.y * v2.y;
}

export function getComponents(v: Vector2D): { x: number; y: number } {
	return { x: v.x, y: v.y };
}
