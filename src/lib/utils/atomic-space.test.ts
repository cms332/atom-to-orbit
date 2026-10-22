import { describe, expect, it } from 'vitest';
import {
	BOHR_RADIUS,
	PROTON_CHARGE_RMS_RADIUS,
	MODEL_BOHR_DISTANCE,
	ATOMIC_LENGTH_RATIO
} from '../data/atomic-space';
import {
	radialDensity,
	radialCdf,
	shellProbability,
	spatialDensity,
	scaleViewSpan
} from './atomic-space';

describe('source-backed hydrogen length comparison', () => {
	it('compares radii with radii and preserves the nucleus diameter conversion', () => {
		expect(BOHR_RADIUS).toBe(5.29177210544e-11);
		expect(PROTON_CHARGE_RMS_RADIUS).toBe(8.4075e-16);
		expect(ATOMIC_LENGTH_RATIO).toBeCloseTo(62941.089568, 5);
		expect(MODEL_BOHR_DISTANCE).toBeCloseTo(314.70544784, 7);
		expect(2 * MODEL_BOHR_DISTANCE).toBeCloseTo(629.41089568, 7);
		expect(MODEL_BOHR_DISTANCE / BOHR_RADIUS).toBeCloseTo(
			0.01 / (2 * PROTON_CHARGE_RMS_RADIUS),
			-1
		);
	});
	it('zooms across four orders of magnitude without changing physical scale ratios', () => {
		expect(scaleViewSpan(0)).toBe(400);
		expect(scaleViewSpan(1)).toBeCloseTo(0.04);
		expect(scaleViewSpan(0.75) / scaleViewSpan(1)).toBeCloseTo(10);
		expect(scaleViewSpan(-1)).toBe(400);
	});
	it('adapts the close-up span to the viewport while keeping proportional distances', () => {
		for (const rulerWidth of [180, 270, 500]) {
			const targetDiameter = 96 / 2.54;
			const closeUpSpan = (rulerWidth * 0.01) / targetDiameter;
			expect(scaleViewSpan(0, closeUpSpan)).toBe(400);
			expect((0.01 * rulerWidth) / scaleViewSpan(1, closeUpSpan)).toBeCloseTo(targetDiameter);
			expect(scaleViewSpan(0.5, closeUpSpan)).toBeCloseTo(Math.sqrt(400 * closeUpSpan));
			expect(scaleViewSpan(2, closeUpSpan)).toBeCloseTo(closeUpSpan);
		}
	});
});

describe('hydrogen 1s probability, per unit dimensionless radius', () => {
	it('distinguishes the central spatial maximum from the radial maximum', () => {
		expect(spatialDensity(0)).toBe(1);
		expect(spatialDensity(1)).toBeLessThan(spatialDensity(0));
		expect(radialDensity(0)).toBe(0);
		expect(radialDensity(1)).toBeCloseTo(4 / Math.E ** 2, 14);
		expect(radialDensity(1)).toBeGreaterThan(radialDensity(0.999));
		expect(radialDensity(1)).toBeGreaterThan(radialDensity(1.001));
	});
	it('normalizes over all space and integrates finite shells rather than exact points', () => {
		expect(radialCdf(0)).toBe(0);
		expect(radialCdf(50)).toBeCloseTo(1, 14);
		let integral = 0;
		const dx = 0.001;
		for (let x = dx / 2; x < 25; x += dx) integral += radialDensity(x) * dx;
		expect(integral).toBeCloseTo(1, 8);
		let shellIntegral = 0;
		for (let x = 0.90005; x < 1.1; x += 0.0001) shellIntegral += radialDensity(x) * 0.0001;
		expect(shellProbability(1)).toBeCloseTo(shellIntegral, 8);
		expect(shellProbability(0)).toBeCloseTo(radialCdf(0.1), 14);
		expect(shellProbability(1, 0)).toBe(0);
		const x = 2;
		expect((radialCdf(x + dx) - radialCdf(x - dx)) / (2 * dx)).toBeCloseTo(radialDensity(x), 6);
	});
});
