import { describe, it, expect } from 'vitest';
import {
	LIGHT_YEAR_M,
	JULIAN_YEAR_SECONDS,
	lightTargets,
	lightTravelSeconds,
	clampLightProgress,
	lightElapsedLabel
} from './starlight';
import { sourceById } from './science';

describe('source-backed light travel model', () => {
	it('uses the exact SI speed and Julian year, without display rounding', () => {
		expect(JULIAN_YEAR_SECONDS).toBe(31_557_600);
		expect(LIGHT_YEAR_M).toBe(9_460_730_472_580_800);
		expect(lightTravelSeconds(lightTargets[0])).toBeCloseTo(1.2822203819, 9);
		expect(lightTravelSeconds(lightTargets[1])).toBeCloseTo(499.004783836, 8);
		expect(lightTravelSeconds(lightTargets[2]) / JULIAN_YEAR_SECONDS).toBeCloseTo(4.24, 10);
		expect(lightTravelSeconds(lightTargets[3]) / JULIAN_YEAR_SECONDS).toBeCloseTo(8.6, 10);
		expect(lightTravelSeconds(lightTargets[4]) / JULIAN_YEAR_SECONDS).toBeCloseTo(2_500_000, 6);
		expect(lightTargets[2].timeLabel).toBe('약 4.2년');
		expect(lightElapsedLabel(lightTargets[1], 1)).toBe('8분 19초');
		expect(lightTargets[1].timeLabel).toBe('약 8분 20초');
	});
	it('maps the endpoints and midpoint linearly for every target, with finite bounded values', () => {
		for (const target of lightTargets) {
			const total = lightTravelSeconds(target);
			expect(Number.isFinite(total)).toBe(true);
			expect(lightTravelSeconds(target, 0)).toBe(0);
			expect(lightTravelSeconds(target, 0.5)).toBe(total / 2);
			expect(lightTravelSeconds(target, 2)).toBe(total);
			expect(lightTravelSeconds(target, -1)).toBe(0);
			for (const id of target.sourceIds) expect(sourceById(id).url).toMatch(/^https:\/\//);
		}
		for (const invalid of [NaN, Infinity, -Infinity]) expect(clampLightProgress(invalid)).toBe(0);
		expect(
			lightTargets.filter((target) => target.kind === '은하').map((target) => target.id)
		).toEqual(['andromeda']);
	});
});
