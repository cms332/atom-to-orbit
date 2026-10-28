import { describe, it, expect } from 'vitest';
import {
	LIGHT_YEAR_M,
	JULIAN_YEAR_SECONDS,
	lightTargets,
	lightTravelSeconds,
	clampLightProgress,
	lightElapsedLabel,
	lightElapsedReading,
	lightElapsedParts
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
	it('keeps the moving time readout proportional and consistent with arrival cards', () => {
		const halfway = ['약 0.6초', '약 4분 10초', '약 2.1년', '약 4.3년', '약 125.0만 년'];
		const starts = ['약 0.0초', '약 0분 00초', '약 0.0년', '약 0.0년', '약 0.0만 년'];
		for (const [index, target] of lightTargets.entries()) {
			expect(lightElapsedReading(target, 0)).toBe(starts[index]);
			expect(lightElapsedReading(target, 0.5)).toBe(halfway[index]);
			expect(lightElapsedReading(target, 1)).toBe(index === 4 ? '약 250.0만 년' : target.timeLabel);
		}
		expect(lightElapsedLabel(lightTargets[1], 1)).toBe('8분 19초');
		expect(lightTravelSeconds(lightTargets[1], 0.5)).toBeCloseTo(249.502391918, 8);
	});
	it('keeps the same numeric slots, decimal precision and unit across readout changes', () => {
		const andromeda = lightTargets[4];
		for (const amount of [0, 0.1, 9.9, 10, 79.6, 80, 99.9, 100, 250]) {
			const parts = lightElapsedParts(andromeda, amount / 250);
			expect(parts).toEqual({ value: amount.toFixed(1), unit: '만 년', widthCh: 5 });
		}
		expect(lightElapsedReading(lightTargets[1], 240 / lightTravelSeconds(lightTargets[1]))).toBe(
			'약 4분 00초'
		);
	});
});
