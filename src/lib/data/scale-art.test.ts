import { describe, expect, it } from 'vitest';
import { objects } from './science';
import { additionalObjects } from './science-expansion';
import {
	PLANET_IDS,
	planetObjects,
	SATURN_DIAMETER_METERS,
	SATURN_RINGS_KM
} from './science-planets';
import { ringBand, ringRadius } from '../utils/planet-geometry';
import { cameraSlot, scaleArt } from './scale-art';
import references from '../../../docs/scale-illustration-references.json';

describe('expanded catalogue and measurement directions', () => {
	it('connects all 20 added subjects to a visual reference and a normalized measured dimension', () => {
		expect(additionalObjects).toHaveLength(15);
		expect(references.map((r) => r.id).sort()).toEqual(
			[...additionalObjects, ...planetObjects].map((o) => o.id).sort()
		);
		for (const object of objects) {
			const art = scaleArt[object.id];
			expect(art).toBeDefined();
			expect(art[art.axis === 'x' ? 'width' : 'height']).toBe(100);
			expect(object.measurement.length).toBeGreaterThan(3);
			if (object.rangeMeters) {
				expect(object.meters).toBeGreaterThanOrEqual(object.rangeMeters[0]);
				expect(object.meters).toBeLessThanOrEqual(object.rangeMeters[1]);
			}
		}
		expect(scaleArt.tower.axis).toBe('y');
		expect(scaleArt.battery.width / 100).toBeCloseTo(50.5 / 14.5, 10);
		expect(scaleArt.phobos.height / 100).toBeCloseTo(22 / 27, 10);
	});
	it('includes all eight planets in mean-diameter order with consistent radius conversions', () => {
		const planets = objects.filter((object) =>
			(PLANET_IDS as readonly string[]).includes(object.id)
		);
		expect(planets.map((object) => object.id)).toEqual([
			'mercury',
			'mars',
			'venus',
			'earth',
			'neptune',
			'uranus',
			'saturn',
			'jupiter'
		]);
		const radii: Record<string, number> = {
			mercury: 2439.7,
			venus: 6051.8,
			earth: 6371,
			mars: 3389.5,
			jupiter: 69911,
			saturn: 58232,
			uranus: 25362,
			neptune: 24622
		};
		for (const object of planets) {
			expect(object.meters).toBe(radii[object.id] * 2 * 1000);
			expect(object.approximation).toBe('mean');
			expect(object.dimensionKind).toBe('diameter');
		}
	});
	it('scales Saturn rings from centre radii while preserving the separate body diameter', () => {
		expect(SATURN_DIAMETER_METERS).toBe(116464000);
		expect((ringRadius(SATURN_RINGS_KM.aOuter) * 2) / 100).toBeCloseTo(273560 / 116464, 12);
		for (const front of [false, true])
			expect(ringBand(SATURN_RINGS_KM.aInner, SATURN_RINGS_KM.aOuter, front)).not.toMatch(
				/NaN|Infinity/
			);
		for (const n of [0, -1, NaN, Infinity]) expect(() => ringRadius(n)).toThrow(RangeError);
		expect(() => ringBand(2, 1)).toThrow(RangeError);
	});
	it('preserves the distinct source definitions, reference midpoints and conversions', () => {
		const byId = (id: string) => objects.find((o) => o.id === id)!;
		expect(byId('football').meters * Math.PI).toBeCloseTo(0.69, 12);
		expect(byId('hair').meters).toBe(90e-6);
		expect(byId('battery').approximation).toBe('maximum');
		expect(byId('whale').approximation).toBe('maximum');
		expect(byId('lead').approximation).toBe('nominal');
		expect(byId('tower').measurement).toContain('최고점');
		expect(byId('neptune').meters).toBe(24622 * 2 * 1000);
	});
	it('keeps camera spacing continuous on both sides of every selection boundary', () => {
		objects.forEach((object, i) => {
			const at = Math.log10(object.meters);
			expect(cameraSlot(objects, at)).toBeCloseTo(i, 12);
			expect(
				Math.abs(cameraSlot(objects, at + 0.000001) - cameraSlot(objects, at - 0.000001))
			).toBeLessThan(0.0001);
		});
		expect(cameraSlot(objects, -10)).toBe(0);
		expect(cameraSlot(objects, 10)).toBe(objects.length - 1);
	});
});
