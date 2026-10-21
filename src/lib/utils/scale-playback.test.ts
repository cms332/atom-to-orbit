import { describe, expect, it } from 'vitest';
import { objects } from '../data/science';
import { MIN_EXPONENT, MAX_EXPONENT } from './scales';
import { OBJECT_HOLD_MS, playbackFrame, playbackPlan } from './scale-playback';

const stops = objects.map((object) => Math.log10(object.meters));

describe('object-paced logarithmic playback', () => {
	it('arrives at every exact scientific size and holds it long enough to inspect', () => {
		const plan = playbackPlan(MIN_EXPONENT, stops);
		expect(plan).toHaveLength(objects.length);
		for (const [index, leg] of plan.entries()) {
			expect(leg.arrival - leg.start).toBeGreaterThanOrEqual(700);
			expect(leg.end - leg.arrival).toBe(OBJECT_HOLD_MS);
			for (const offset of [0, 500, OBJECT_HOLD_MS - 1])
				expect(playbackFrame(plan, leg.arrival + offset).exponent).toBe(stops[index]);
		}
		expect(playbackFrame(plan, plan.at(-1)!.end + 100)).toEqual({
			exponent: MAX_EXPONENT,
			done: true
		});
	});
	it('moves continuously forward through each transition without changing log measurements', () => {
		const plan = playbackPlan(MIN_EXPONENT, stops);
		let previous = MIN_EXPONENT;
		for (const leg of plan) {
			const middle = playbackFrame(plan, (leg.start + leg.arrival) / 2);
			expect(middle.exponent).toBeCloseTo((leg.from + leg.to) / 2, 12);
			for (const t of [0, 0.1, 0.5, 0.9, 1]) {
				const frame = playbackFrame(plan, leg.start + t * (leg.arrival - leg.start));
				expect(frame.exponent).toBeGreaterThanOrEqual(previous - 1e-10);
				expect(frame.exponent).toBeLessThanOrEqual(MAX_EXPONENT);
				previous = frame.exponent;
			}
		}
	});
	it('can resume between objects and reduces motion speed without skipping transitions', () => {
		const from = (stops[4] + stops[5]) / 2;
		const resumed = playbackPlan(from, stops);
		expect(resumed[0].from).toBe(from);
		expect(resumed[0].to).toBe(stops[5]);
		const reduced = playbackPlan(MIN_EXPONENT, stops, true);
		const normal = playbackPlan(MIN_EXPONENT, stops);
		for (const [i, leg] of reduced.entries()) {
			expect(leg.arrival - leg.start).toBeGreaterThan(normal[i].arrival - normal[i].start);
			expect(leg.end - leg.arrival).toBe(OBJECT_HOLD_MS);
			expect(playbackFrame(reduced, (leg.start + leg.arrival) / 2).exponent).toBeGreaterThan(
				leg.from
			);
			expect(playbackFrame(reduced, (leg.start + leg.arrival) / 2).exponent).toBeLessThan(leg.to);
		}
	});
	it('never jumps from one object to the next in either motion preference', () => {
		for (const reduced of [false, true]) {
			const plan = playbackPlan(MIN_EXPONENT, stops, reduced);
			for (const leg of plan) {
				let previous = leg.from;
				const positions = new Set<number>();
				for (let time = leg.start; time < leg.arrival; time += 16) {
					const current = playbackFrame(plan, time).exponent;
					expect(current).toBeGreaterThanOrEqual(previous - 1e-10);
					expect(current - previous).toBeLessThan(0.03);
					positions.add(current);
					previous = current;
				}
				expect(positions.size).toBeGreaterThan(20);
				expect(leg.to - previous).toBeLessThan(0.03);
			}
		}
	});
	it('rejects invalid timing inputs and unordered measurements', () => {
		for (const invalid of [NaN, Infinity]) {
			expect(() => playbackPlan(invalid, stops)).toThrow(RangeError);
			expect(() => playbackFrame(playbackPlan(MIN_EXPONENT, stops), invalid)).toThrow(RangeError);
		}
		for (const invalid of [[], [0, 0], [1, 0], [0, NaN]])
			expect(() => playbackPlan(MIN_EXPONENT, invalid)).toThrow(RangeError);
		expect(() => playbackFrame([], 0)).toThrow(RangeError);
	});
});
