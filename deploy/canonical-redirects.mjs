// Generate only aliases of pages explicitly listed in the candidate release sitemap.
export const CANONICAL_MARKER = '# A2O managed canonical redirects v1';
export function canonicalRedirects(xml, previous = '') {
	if (previous.trim() && !previous.startsWith(CANONICAL_MARKER))
		throw new Error('Unrecognized A2O advanced configuration; refusing to overwrite');
	const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
	if (!urls.length || new Set(urls).size !== urls.length) throw new Error('Invalid sitemap');
	const paths = urls.map((url) => {
		if (!/^https:\/\/a2o\.kr\/(?:[a-z0-9-]+\/)*$/.test(url))
			throw new Error('Non-canonical sitemap URL');
		return url.slice('https://a2o.kr'.length);
	});
	for (const required of ['/', '/scale/', '/orbit/', '/articles/'])
		if (!paths.includes(required)) throw new Error('Missing core sitemap page');
	const rules = paths.map((path) => {
		const alias = path === '/' ? '/index[.]html' : `${path.slice(0, -1)}(?:/index[.]html)?`;
		return `if ($request_uri ~ "^${alias}(?:[?].*)?$") { return 308 https://a2o.kr${path}$is_args$args; }`;
	});
	return [
		CANONICAL_MARKER,
		...rules,
		'set $a2o_origin "$scheme:$host";',
		// Preserve HTTP certificate challenges handled by NPM's existing ACME location.
		'if ($uri ~ "^/[.]well-known/acme-challenge/") { set $a2o_origin "https:a2o.kr"; }',
		'if ($a2o_origin != "https:a2o.kr") { return 308 https://a2o.kr$request_uri; }',
		''
	].join('\n');
}
