import { describe, expect, it } from 'vitest';
import { orbitPlanets } from '../data/orbits';
import { physicalRadiiAU } from '../data/orbit-body-sizes';
import { eclipticPosition, eclipticToWorld, scenePosition, type Vec3 } from '../utils/orbit-model';
import { trailVisibility } from './trail-visibility';

describe('end-on trail readability', () => {
	it('fades continuously with viewing angle, preserving side-on segments in either direction', () => {
		const points: Vec3[] = [
			[-1, 0, 0],
			[0, 0, 0],
			[1, 0, 0]
		];
		for (const direction of [-1, 1]) {
			const weights = [0, 0.02, 0.07, 0.12, 0.5, 1].map((sine) =>
				trailVisibility(points, 1, undefined, [direction * Math.sqrt(1 - sine ** 2), sine, 0])
			);
			expect(weights[0]).toBe(0);
			expect(weights[1]).toBeCloseTo(0, 12);
			expect(weights[2]).toBeCloseTo(0.5, 12);
			expect(weights.slice(3)).toEqual([1, 1, 1]);
		}
	});
	it('uses the correct smooth tangent on unequal sample intervals without changing positions', () => {
		const times = [0, 1, 1.01];
		const points: Vec3[] = times.map((t) => [t, t * t, 0]);
		const before = structuredClone(points);
		const length = Math.sqrt(5),
			sine = 0.07,
			cosine = Math.sqrt(1 - sine ** 2);
		const eye: Vec3 = [1 - (cosine - 2 * sine) / length, 1 - (2 * cosine + sine) / length, 0];
		expect(trailVisibility(points, 1, times, eye)).toBeCloseTo(0.5, 10);
		const offset: Vec3 = [9, -2, 30];
		const translated: Vec3[] = points.map((p) => p.map((v, axis) => v + offset[axis]) as Vec3);
		expect(
			trailVisibility(translated, 1, times, eye.map((v, axis) => v + offset[axis]) as Vec3)
		).toBeCloseTo(0.5, 10);
		expect(points).toEqual(before);
	});
	it('suppresses the reported physical Earth hairpin while retaining its distant history', () => {
		const earth = orbitPlanets.find((p) => p.id === 'earth')!;
		const now = 8.3852055;
		const target = eclipticToWorld(eclipticPosition(earth, now));
		const direction = eclipticToWorld([0.2, -0.35, 1]);
		const distance = physicalRadiiAU.earth / (2 * Math.tan((43 * Math.PI) / 360) * 0.28);
		const length = Math.hypot(...direction);
		const eye = target.map((v, axis) => v + (direction[axis] * distance) / length) as Vec3;
		for (const [age, visibility] of [
			[0.002875366215648, 0],
			[1, 1]
		]) {
			const times = [-1e-6, 0, 1e-6].map((delta) => now - age + delta);
			const points = times.map((time) => scenePosition(earth, time, now, 'galactic', 0.05));
			expect(trailVisibility(points, 1, times, eye)).toBe(visibility);
		}
	});
});
