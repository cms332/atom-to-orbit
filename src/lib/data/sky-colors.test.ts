import { describe, expect, it } from 'vitest';
import {
	directTransmission,
	rayGeometry,
	relativeAirmass,
	relativeRayleigh,
	sampleDirectBeam,
	skyBands,
	skyGeometry
} from './sky-colors';

describe('educational direct-beam model', () => {
	it('matches Kasten–Young reference elevations without forcing zenith to exactly one', () => {
		for (const [height, expected] of [
			[5, 10.305791327930303],
			[30, 1.9942928525292503],
			[70, 1.063699987068631],
			[90, 0.9997119918558381]
		])
			expect(relativeAirmass(height)).toBeCloseTo(expected, 12);
	});
	it('retains the fourth-power wavelength relationship in SI units', () => {
		expect(relativeRayleigh(450e-9) / relativeRayleigh(650e-9)).toBeCloseTo(4.353147386069196, 12);
		expect(relativeRayleigh(550e-9)).toBe(1);
	});
	it('matches all three independent normalized reference transmissions', () => {
		const low = sampleDirectBeam(5).bands.map((band) => band.transmission);
		const high = sampleDirectBeam(70).bands.map((band) => band.transmission);
		[0.10028315751892879, 0.3568002659885236, 0.5896078367518606].forEach((value, i) =>
			expect(low[i]).toBeCloseTo(value, 12)
		);
		[0.7887019900201938, 0.8990919236768097, 0.9469323609803779].forEach((value, i) =>
			expect(high[i]).toBeCloseTo(value, 12)
		);
	});
	it('attenuates every color more on longer paths, with blue reduced relatively more', () => {
		let previous = sampleDirectBeam(5);
		for (let h = 6; h <= 80; h++) {
			const next = sampleDirectBeam(h);
			expect(next.airmass).toBeLessThan(previous.airmass);
			const [b, g, r] = next.bands.map((band) => band.transmission);
			expect(b).toBeGreaterThan(0);
			expect(b).toBeLessThan(g);
			expect(g).toBeLessThan(r);
			expect(r).toBeLessThan(1);
			next.bands.forEach((band, i) =>
				expect(band.transmission).toBeGreaterThan(previous.bands[i].transmission)
			);
			expect(b / r).toBeGreaterThan(
				previous.bands[0].transmission / previous.bands[2].transmission
			);
			previous = next;
		}
	});
	it('handles zero path or zero optical depth but rejects invalid scientific inputs', () => {
		for (const band of skyBands) {
			expect(directTransmission(0, band.wavelengthM)).toBe(1);
			expect(directTransmission(5, band.wavelengthM, 0)).toBe(1);
		}
		for (const value of [NaN, Infinity, -Infinity, 0, 4.9, 90.1])
			expect(() => relativeAirmass(value)).toThrow();
		for (const value of [NaN, Infinity, 0, -1, Number.MIN_VALUE])
			expect(() => relativeRayleigh(value)).toThrow();
		for (const value of [NaN, Infinity, -1]) {
			expect(() => directTransmission(value, 550e-9)).toThrow();
			expect(() => directTransmission(1, 550e-9, value)).toThrow();
		}
		expect(() => directTransmission(0, -1)).toThrow();
	});
	it('keeps the drawn air layer fixed, entry on its boundary and scattering inside air', () => {
		const { centerX, centerY, airRadius, groundRadius } = skyGeometry;
		const distance = (p: { x: number; y: number }) => Math.hypot(p.x - centerX, p.y - centerY);
		let lastLength = Infinity;
		for (let h = 5; h <= 80; h++) {
			const ray = rayGeometry(h);
			expect(distance(ray.entry)).toBeCloseTo(airRadius, 10);
			expect(distance(ray.target)).toBeCloseTo(groundRadius, 10);
			expect(distance(ray.scatter)).toBeGreaterThan(groundRadius);
			expect(distance(ray.scatter)).toBeLessThan(airRadius);
			expect(ray.length).toBeLessThan(lastLength);
			expect(
				(Math.atan2(ray.target.y - ray.entry.y, ray.target.x - ray.entry.x) * 180) / Math.PI
			).toBeCloseTo(h, 10);
			lastLength = ray.length;
		}
	});
});
