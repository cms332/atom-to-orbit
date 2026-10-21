import { describe, expect, it } from 'vitest';
import { orbitPlanets } from '../data/orbits';
import { scenePosition, solarAUPerYear } from '../utils/orbit-model';
import { createTrackingTrail } from './tracking-trail';

describe('continuous trails in a body-following view', () => {
	it('keeps both live endpoints on the model at every frame within the point budget', () => {
		for (const planet of [undefined, ...orbitPlanets]) {
			const sample = createTrackingTrail(planet);
			for (const frame of ['solar', 'galactic'] as const)
				for (const factor of [0.05, 1])
					for (const now of [0, 0.0001, 0.1, 8.01, 8.02, 39.99, 40]) {
						const points = sample(now, 4, frame, factor, 128);
						expect(points.length).toBeLessThanOrEqual(129);
						expect(points[0]).toEqual(
							scenePosition(planet, Math.max(0, now - 4), now, frame, factor)
						);
						expect(points.at(-1)).toEqual(scenePosition(planet, now, now, frame, factor));
					}
		}
	});
	it('keeps historical samples fixed instead of sliding the curve between frames', () => {
		const sample = createTrackingTrail(orbitPlanets[0]);
		const beforeTime = 8.012,
			afterTime = 8.01201;
		const before = sample(beforeTime, 4, 'galactic', 0.05).map((point) => [...point]);
		const after = sample(afterTime, 4, 'galactic', 0.05);
		expect(after).toHaveLength(before.length);
		for (let index = 1; index < before.length - 1; index++) {
			expect(after[index].slice(0, 2)).toEqual(before[index].slice(0, 2));
			expect(after[index][2] - before[index][2]).toBeCloseTo(
				solarAUPerYear(0.05) * (afterTime - beforeTime),
				10
			);
		}
		expect(after.at(-1)).not.toEqual(before.at(-1));
	});
	it('invalidates history on seek, model wrap and changes to frame, span or speed', () => {
		const planet = orbitPlanets[2];
		const sample = createTrackingTrail(planet);
		for (const [now, span, frame, factor, limit] of [
			[39.99, 4, 'galactic', 1, 1024],
			[0, 4, 'galactic', 1, 1024],
			[0.01, 4, 'galactic', 1, 1024],
			[20, 2, 'solar', 0.05, 2048],
			[8, 4, 'galactic', 0.05, 128],
			[8.01, 4, 'galactic', 1, 128]
		] as const) {
			expect(sample(now, span, frame, factor, limit)).toEqual(
				createTrackingTrail(planet)(now, span, frame, factor, limit)
			);
		}
	});
});
