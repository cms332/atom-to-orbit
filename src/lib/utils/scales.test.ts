import { describe, expect, it } from 'vitest';
import { objects, sources, BOHR_RADIUS, EARTH_MOON_METERS } from '../data/science';
import { articles } from '../content/articles';
import {
	MAX_EXPONENT,
	MAX_METERS,
	MIN_EXPONENT,
	converted,
	fromPosition,
	nearestObject,
	scientific,
	toPosition
} from './scales';

describe('SI data and provenance', () => {
	it('contains 27 distinct, finite, sourced measurements inside the axis', () => {
		expect(objects.length).toBe(27);
		expect(new Set(objects.map((o) => o.id)).size).toBe(objects.length);
		for (const object of objects) {
			expect(Number.isFinite(object.meters)).toBe(true);
			expect(object.meters).toBeGreaterThan(0);
			expect(toPosition(object.meters)).toBeGreaterThanOrEqual(0);
			expect(toPosition(object.meters)).toBeLessThanOrEqual(1);
			expect(sources.find((s) => s.id === object.sourceId)).toBeDefined();
			if (object.articleSlug)
				expect(articles.some((a) => a.slug === object.articleSlug)).toBe(true);
		}
		for (const source of sources) {
			expect(new URL(source.url).protocol).toBe('https:');
			expect(source.accessedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		}
	});
	it('preserves radius-to-diameter derivations and excludes separation from size data', () => {
		expect(objects.find((o) => o.id === 'earth')?.meters).toBe(6371 * 2 * 1000);
		expect(objects.find((o) => o.id === 'moon')?.meters).toBe(1737.4 * 2 * 1000);
		expect(objects.find((o) => o.id === 'jupiter')?.meters).toBe(69911 * 2 * 1000);
		expect(objects.find((o) => o.id === 'sun')?.meters).toBe(695700 * 2 * 1000);
		expect(objects[0].meters).toBe(2 * BOHR_RADIUS);
		expect(objects.every((o) => o.dimensionKind !== 'distance')).toBe(true);
		expect(EARTH_MOON_METERS / objects.find((o) => o.id === 'earth')!.meters).toBeCloseTo(30.17, 2);
	});
	it('connects article citations to real registered sources', () => {
		for (const article of articles)
			for (const id of article.sourceIds) expect(sources.some((s) => s.id === id)).toBe(true);
	});
});
describe('logarithmic coordinate contract', () => {
	it('ends at the measured Sun diameter while preserving equal logarithmic decades', () => {
		expect(toPosition(1e-10)).toBe(0);
		expect(MAX_METERS).toBe(objects.find((object) => object.id === 'sun')!.meters);
		expect(toPosition(MAX_METERS)).toBe(1);
		expect(fromPosition(1) / MAX_METERS).toBeCloseTo(1, 12);
		expect(toPosition(10 ** ((MIN_EXPONENT + MAX_EXPONENT) / 2))).toBeCloseTo(0.5, 12);
		const decade = 1 / (MAX_EXPONENT - MIN_EXPONENT);
		expect(toPosition(10) - toPosition(1)).toBeCloseTo(decade, 12);
		expect(toPosition(100) - toPosition(10)).toBeCloseTo(decade, 12);
		for (const object of objects)
			expect(fromPosition(toPosition(object.meters)) / object.meters).toBeCloseTo(1, 12);
	});
	it('rejects invalid scientific lengths', () => {
		for (const value of [0, -1, NaN, Infinity]) expect(() => toPosition(value)).toThrow(RangeError);
	});
	it('uses log distance rather than linear distance for selection', () => {
		expect(nearestObject([{ meters: 1 }, { meters: 1000 }], 2).meters).toBe(1000);
		expect(() => nearestObject([], 1)).toThrow();
	});
	it('keeps objects monotonically ordered and exact at their positions', () => {
		objects.forEach((object, i) => {
			if (i) expect(toPosition(object.meters)).toBeGreaterThan(toPosition(objects[i - 1].meters));
			expect(nearestObject(objects, Math.log10(object.meters)).id).toBe(object.id);
		});
	});
});
describe('human-readable units', () => {
	it('converts scientific notation, nanometers, millimeters and kilometers', () => {
		expect(converted(0.04)).toBe('40 mm');
		expect(converted(2 * BOHR_RADIUS)).toBe('0.106 nm');
		expect(converted(12742000)).toBe('12,742 km');
		expect(scientific(12742000)).toBe('1.27 × 10⁷ m');
		expect(scientific(2 * BOHR_RADIUS)).toBe('1.06 × 10⁻¹⁰ m');
		expect(scientific(9.999e5)).toBe('1 × 10⁶ m');
	});
});
