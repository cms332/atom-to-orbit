import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalRedirects } from './canonical-redirects.mjs';
const sitemap = (extra = '') =>
	`<urlset>${['/', '/scale/', '/orbit/', '/articles/'].map((path) => `<url><loc>https://a2o.kr${path}</loc></url>`).join('')}${extra}</urlset>`;
test('only declared page aliases are normalized and all query bytes are retained', () => {
	const rules = canonicalRedirects(
		sitemap('<url><loc>https://a2o.kr/articles/earth-moon/</loc></url>')
	);
	assert.match(rules, /earth-moon/);
	assert.match(rules, /\$is_args\$args/);
	assert.match(rules, /https:\/\/a2o.kr\$request_uri/);
	assert.match(rules, /acme-challenge/);
	assert.doesNotMatch(rules, /licenses|robots[.]txt|sitemap[.]xml|noindex/);
	assert.equal((rules.match(/return 308/g) || []).length, 6);
	assert.equal(canonicalRedirects(sitemap(), rules), canonicalRedirects(sitemap()));
});
test('invalid or foreign sitemap data and unmanaged proxy rules fail closed', () => {
	for (const invalid of [
		'',
		'<loc>https://a2o.kr/</loc>',
		sitemap('<loc>https://other.example/article/</loc>'),
		sitemap('<loc>https://a2o.kr/scale/?at=4</loc>'),
		sitemap('<loc>https://a2o.kr/</loc>'),
		sitemap('<loc>https://a2o.kr/a;return/</loc>')
	])
		assert.throws(() => canonicalRedirects(invalid));
	assert.throws(() => canonicalRedirects(sitemap(), '# custom settings'));
});
