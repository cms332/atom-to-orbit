import { expect, it } from 'vitest';
import {
	atomReference,
	tableTennisBall,
	moonReference,
	ATOM_BALL_LENGTH_RATIO,
	ATOM_MODEL_FACTOR,
	ENLARGED_BALL_METERS,
	MOON_TO_ENLARGED_BALL_RATIO
} from './atomic-scale-comparison';

it('enlarges the atom reference and ball with one factor, preserving SI units and sources', () => {
	expect(atomReference.sourceId).toBe('nist');
	expect(tableTennisBall.sourceId).toBe('ittf');
	expect(moonReference.sourceId).toBe('moon');
	expect(tableTennisBall.meters).toBe(0.04);
	expect(atomReference.meters * ATOM_MODEL_FACTOR).toBeCloseTo(0.01, 14);
	expect(ATOM_BALL_LENGTH_RATIO / 1e8).toBeCloseTo(3.77945, 5);
	expect(ENLARGED_BALL_METERS / 1000).toBeCloseTo(3779.45, 2);
	expect(ENLARGED_BALL_METERS).toBeGreaterThan(moonReference.meters);
});

it('uses a diameter ratio for the two circles rather than an area or volume ratio', () => {
	expect(moonReference.dimensionKind).toBe('diameter');
	expect(moonReference.meters).toBe(2 * 1737.4 * 1000);
	expect(MOON_TO_ENLARGED_BALL_RATIO * ENLARGED_BALL_METERS).toBeCloseTo(3_474_800, 6);
	expect(MOON_TO_ENLARGED_BALL_RATIO).toBeGreaterThan(0.91);
	expect(MOON_TO_ENLARGED_BALL_RATIO).toBeLessThan(0.93);
});
