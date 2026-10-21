import { describe, expect, it } from 'vitest';
import { objects } from '../data/science';
import { circleSurface, REFERENCE_PIXELS, sceneLength, sceneReference } from './scale-scene';

describe('shared physical camera scale', () => {
	it('enlarges the reference while fitting the full Saturn rings on narrow screens', () => {
		expect(sceneReference(575)).toBe(180);
		expect(sceneReference(312)).toBe(120);
		for (const width of [242, 312, 575, 714, 1400]) {
			const reference = sceneReference(width);
			expect(reference).toBeGreaterThan(92);
			expect(reference).toBeLessThanOrEqual(180);
			expect(reference * (273560 / 116464)).toBeLessThan(width - 16);
			for (const object of objects) {
				const exponent = Math.log10(object.meters);
				expect(sceneLength(object.meters, exponent, reference)).toBeCloseTo(reference, 10);
				expect(sceneLength(object.meters, exponent + 1, reference)).toBeCloseTo(reference / 10, 10);
			}
		}
		for (const invalid of [0, -1, NaN, Infinity]) {
			expect(() => sceneReference(invalid)).toThrow(RangeError);
			expect(() => sceneLength(1, 0, invalid)).toThrow(RangeError);
		}
	});
	it('shrinks a given object tenfold for each decade without resetting at object boundaries', () => {
		for (const object of objects) {
			const at = Math.log10(object.meters);
			expect(sceneLength(object.meters, at)).toBeCloseTo(REFERENCE_PIXELS, 10);
			expect(sceneLength(object.meters, at + 1)).toBeCloseTo(REFERENCE_PIXELS / 10, 10);
		}
		const boundary = (Math.log10(objects[1].meters) + Math.log10(objects[2].meters)) / 2;
		expect(
			sceneLength(objects[1].meters, boundary - 0.001) /
				sceneLength(objects[1].meters, boundary + 0.001)
		).toBeCloseTo(10 ** 0.002, 10);
	});
	it('keeps simultaneous horizontal sizes in the source-backed physical ratio', () => {
		for (const exponent of [-10, -1, 0, 7, 10]) {
			for (let i = 1; i < objects.length; i++)
				expect(
					sceneLength(objects[i].meters, exponent) / sceneLength(objects[i - 1].meters, exponent)
				).toBeCloseTo(objects[i].meters / objects[i - 1].meters, 5);
		}
	});
	it('rejects invalid scientific lengths and camera inputs', () => {
		for (const meters of [0, -1, NaN, Infinity])
			expect(() => sceneLength(meters, 0)).toThrow(RangeError);
		expect(() => sceneLength(1, NaN)).toThrow(RangeError);
	});
	it('projects enormous incoming circular surfaces without cancellation or giant SVG coordinates', () => {
		for (const radius of [1000, 1e10, 1e21]) {
			const path = circleSurface(radius, 160, 96, 320);
			expect(path).not.toMatch(/NaN|Infinity/);
			const values = path.match(/-?\d+(?:\.\d+)?(?:e[+-]?\d+)?/g)!.map(Number);
			expect(values.every((value) => Number.isFinite(value) && Math.abs(value) <= 320)).toBe(true);
		}
	});
});
