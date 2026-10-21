import { describe, expect, it } from 'vitest';
import { objects } from '../data/science';
import { DEFAULT_EXPONENT, explorerUrl, readExplorerExponent } from './navigation-state';
import { MAX_EXPONENT, MIN_EXPONENT } from './scales';

describe('shareable explorer state', () => {
	it('restores exact measurements and falls back safely for unknown objects', () => {
		for (const object of objects) {
			expect(readExplorerExponent(new URLSearchParams({ object: object.id }))).toBe(
				Math.log10(object.meters)
			);
		}
		for (const query of ['', 'object=unknown', 'object=<script>']) {
			expect(readExplorerExponent(new URLSearchParams(query))).toBe(DEFAULT_EXPONENT);
		}
	});
	it('preserves exact endpoints and rounds shared intermediate cursors', () => {
		for (const at of [MIN_EXPONENT, 0, MAX_EXPONENT])
			expect(readExplorerExponent(new URLSearchParams({ at: String(at) }))).toBe(at);
		expect(readExplorerExponent(new URLSearchParams('at=2.345'))).toBe(2.35);
	});
	it('ignores empty, nonfinite and out-of-range cursors without changing science data', () => {
		const moon = Math.log10(objects.find((object) => object.id === 'moon')!.meters);
		for (const at of ['', ' ', 'NaN', 'Infinity', '1e99', '-10.01', String(MAX_EXPONENT + 0.01)]) {
			expect(readExplorerExponent(new URLSearchParams({ object: 'moon', at }))).toBe(moon);
		}
	});
	it('canonicalizes object choices and round-trips arbitrary cursor positions', () => {
		const current = new URL('https://example.test/scale/?ref=reader&at=0#data-title');
		for (const object of objects) {
			const url = explorerUrl(current, Math.log10(object.meters));
			expect(url.searchParams.get('object')).toBe(object.id);
			expect(url.searchParams.has('at')).toBe(false);
			expect(url.searchParams.get('ref')).toBe('reader');
			expect(url.hash).toBe('');
			expect(readExplorerExponent(url.searchParams)).toBe(Math.log10(object.meters));
		}
		for (const at of [MIN_EXPONENT, -3.75, 0, 5.12, MAX_EXPONENT]) {
			expect(readExplorerExponent(explorerUrl(current, at).searchParams)).toBe(at);
		}
		expect(current.hash).toBe('#data-title');
	});
	it('rejects nonfinite and out-of-axis state writes', () => {
		for (const at of [NaN, Infinity, -Infinity, -11, 11]) {
			expect(() => explorerUrl(new URL('https://example.test/scale/'), at)).toThrow(RangeError);
		}
	});
});
