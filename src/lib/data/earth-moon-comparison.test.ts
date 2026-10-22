import { describe, expect, it } from 'vitest';
import { sourceById } from './science';
import { lightSpeed } from './earth-moon-sources';
import {
	earthReference,
	moonReference,
	earthMoonDistance,
	MODEL_EARTH_DIAMETER,
	MODEL_MOON_DIAMETER,
	MODEL_CENTER_DISTANCE,
	CENTER_DISTANCE_IN_EARTHS,
	SURFACE_GAP_METERS,
	SURFACE_GAP_IN_EARTHS,
	MOONLIGHT_SECONDS
} from './earth-moon-comparison';

describe('Earth–Moon classroom comparison', () => {
	it('preserves the sourced diameters and distinguishes centre distance from surface gap', () => {
		expect(earthReference.meters).toBe(12_742_000);
		expect(moonReference.meters).toBe(3_474_800);
		expect(earthMoonDistance.meters).toBe(384_400_000);
		expect(CENTER_DISTANCE_IN_EARTHS).toBeCloseTo(30.2, 1);
		expect(SURFACE_GAP_IN_EARTHS).toBeCloseTo(29.5, 1);
		expect(SURFACE_GAP_METERS).toBe(376_291_600);
		expect(SURFACE_GAP_METERS + earthReference.meters / 2 + moonReference.meters / 2).toBe(
			earthMoonDistance.meters
		);
		for (const reference of [earthReference, moonReference, earthMoonDistance]) {
			expect(sourceById(reference.sourceId).url).toMatch(/^https:\/\//);
		}
	});
	it('shrinks the Moon and centre distance with the same 24cm Earth model', () => {
		expect(MODEL_EARTH_DIAMETER).toBe(0.24);
		expect(MODEL_MOON_DIAMETER * 100).toBeCloseTo(6.545, 2);
		expect(MODEL_CENTER_DISTANCE).toBeCloseTo(7.24, 2);
		expect(MODEL_CENTER_DISTANCE / MODEL_EARTH_DIAMETER).toBeCloseTo(CENTER_DISTANCE_IN_EARTHS, 12);
		expect(MODEL_MOON_DIAMETER / MODEL_CENTER_DISTANCE).toBeCloseTo(
			moonReference.meters / earthMoonDistance.meters,
			14
		);
	});
	it('uses a one-way vacuum travel time, excluding the Sun-to-Moon leg', () => {
		expect(lightSpeed.metersPerSecond).toBe(299_792_458);
		expect(sourceById(lightSpeed.sourceId).label).toContain('NIST');
		expect(MOONLIGHT_SECONDS).toBeCloseTo(1.28222, 5);
		expect(MOONLIGHT_SECONDS.toFixed(1)).toBe('1.3');
	});
});
