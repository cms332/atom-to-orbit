import { describe, expect, it } from 'vitest';
import {
	motionPositions,
	motionScene,
	MOTION_DURATION,
	MOTION_DISPLAY_FACTOR,
	MOTION_VIEW_BOX
} from './motion-scene';
import { solarAUPerYear } from './orbit-model';
import { motionMeasurements, tenSecondTravelMeters, hourlySpeedLabel } from '$lib/data/motion';
import { motionArticle } from '$lib/content/motion-article';
import { objects, sourceById } from '$lib/data/science';

describe('article motion science and reference frames', () => {
	it('preserves the Earth–Sun relative position and projected length when changing frames', () => {
		for (let i = 0; i <= 100; i++) {
			const phase = i / 100;
			const solar = motionPositions(phase, 'solar'),
				galactic = motionPositions(phase, 'galactic');
			for (let axis = 0; axis < 3; axis++)
				expect(galactic.earth[axis] - galactic.sun[axis]).toBeCloseTo(solar.earth[axis], 12);
			const a = motionScene('solar', phase),
				b = motionScene('galactic', phase);
			for (let axis = 0; axis < 2; axis++)
				expect(a.earth[axis] - a.sun[axis]).toBeCloseTo(b.earth[axis] - b.sun[axis], 9);
		}
	});
	it('converts the elementary speed display to hourly units without changing the SI measurements', () => {
		for (const [index, value] of [1670, 107208, 828000].entries()) {
			expect(motionMeasurements[index].metersPerSecond * 3.6).toBeCloseTo(value, 8);
		}
		expect(motionMeasurements.map(hourlySpeedLabel)).toEqual(['1,670', '107,000', '828,000']);
		expect(motionMeasurements.map((item) => [item.displayValue, item.displayUnit])).toEqual([
			['1,670', 'km/h'],
			['29.78', 'km/s'],
			['230', 'km/s']
		]);
	});
	it('keeps the galactic origin fixed and opens the one-orbit path by the displayed solar displacement', () => {
		const start = motionPositions(0, 'galactic'),
			end = motionPositions(1, 'galactic');
		expect(start.sun).toEqual([0, 0, 0]);
		expect(end.sun[2]).toBeCloseTo(-solarAUPerYear(0.05) * MOTION_DURATION, 10);
		expect(MOTION_DISPLAY_FACTOR).toBe(1 / 20);
		const solarStart = motionPositions(0, 'solar'),
			solarEnd = motionPositions(1, 'solar');
		expect(Math.hypot(...solarEnd.earth.map((v, i) => v - solarStart.earth[i]))).toBeLessThan(
			0.00001
		);
		expect(Math.hypot(...end.earth.map((v, i) => v - start.earth[i]))).toBeGreaterThan(2);
	});
	it('keeps every displayed sample finite and inside the drawing without wrapping a partial path closed', () => {
		for (const frame of ['solar', 'galactic'] as const)
			for (let i = 0; i <= 100; i++) {
				const scene = motionScene(frame, i / 100);
				for (const [x, y] of [scene.sun, scene.earth, scene.start]) {
					expect(x).toBeGreaterThan(MOTION_VIEW_BOX[0] + 20);
					expect(x).toBeLessThan(MOTION_VIEW_BOX[0] + MOTION_VIEW_BOX[2] - 20);
					expect(y).toBeGreaterThan(MOTION_VIEW_BOX[1] + 20);
					expect(y).toBeLessThan(MOTION_VIEW_BOX[1] + MOTION_VIEW_BOX[3] - 20);
				}
				expect(scene.pastPath).not.toMatch(/NaN|Infinity|Z/);
			}
		expect(() => motionPositions(NaN, 'solar')).toThrow(RangeError);
	});
	it('keeps the SI speeds, units, calculation and all article citations consistent', () => {
		expect(motionMeasurements.map((m) => m.metersPerSecond)).toEqual([1670 / 3.6, 29780, 230000]);
		expect(tenSecondTravelMeters / 1000).toBe(2300);
		const earth = objects.find((object) => object.id === 'earth')!;
		expect(earth.dimensionKind).toBe('diameter');
		expect(earth.approximation).toBe('mean');
		expect(Math.round((tenSecondTravelMeters / earth.meters) * 100)).toBe(18);
		for (const item of motionMeasurements) {
			const conversion = item.displayUnit === 'km/h' ? 3.6 : 0.001;
			expect(item.metersPerSecond * conversion).toBeCloseTo(
				Number(item.displayValue.replaceAll(',', '')),
				8
			);
			expect(motionArticle.sourceIds).toContain(item.sourceId);
		}
		for (const id of motionArticle.sourceIds) expect(sourceById(id).url).toMatch(/^https:\/\//);
		for (const section of motionArticle.sections)
			for (const id of section.sourceIds ?? []) expect(motionArticle.sourceIds).toContain(id);
	});
});
