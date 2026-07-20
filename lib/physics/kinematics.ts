import type { KinematicsResult } from './types';

export function solveKinematics(params: {
	u?: number;
	v?: number;
	a?: number;
	s?: number;
	t?: number;
}): KinematicsResult {
	const { u = 0, a = 0, t = 0 } = params;

	const finalVelocity = u + a * t;
	const displacement = u * t + 0.5 * a * t * t;

	const points = 50;
	const tData = Array.from({ length: points }, (_, i) => (i / (points - 1)) * t);
	const posData = tData.map(ti => u * ti + 0.5 * a * ti * ti);
	const velData = tData.map(ti => u + a * ti);
	const accData = tData.map(() => a);

	return {
		displacement,
		finalVelocity,
		acceleration: a,
		time: t,
		graphs: {
			position: { t: tData, values: posData },
			velocity: { t: tData, values: velData },
			acceleration: { t: tData, values: accData }
		}
	};
}
