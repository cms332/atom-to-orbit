import { describe, expect, it } from 'vitest';
import { eligible, cleanReferrer } from './analytics';
describe('analytics collection boundary', () => {
	it('collects only the public site, excluding development, automation and opted-out visits', () => {
		expect(eligible('a2o.kr', false, false, false)).toBe(true);
		expect(eligible('www.a2o.kr', false, false, false)).toBe(true);
		for (const host of ['localhost', '127.0.0.1', 'preview.a2o.kr', 'a2o.kr.example.com'])
			expect(eligible(host, false, false, false)).toBe(false);
		expect(eligible('a2o.kr', true, false, false)).toBe(false);
		expect(eligible('a2o.kr', false, true, false)).toBe(false);
		expect(eligible('a2o.kr', false, false, true)).toBe(false);
	});
	it('removes query strings and fragments from referrers and rejects non-web values', () => {
		expect(cleanReferrer('https://example.com/page?email=private#name')).toBe(
			'https://example.com/page'
		);
		expect(cleanReferrer('javascript:alert(1)')).toBe('');
		expect(cleanReferrer('')).toBe('');
	});
});
