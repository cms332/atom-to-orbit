import { articles } from '$lib/content/articles';
export const prerender = true;
export function GET() {
	const paths = [
		'/',
		'/scale/',
		'/orbit/',
		'/articles/',
		...articles.map((a) => `/articles/${a.slug}/`)
	];
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((path) => `<url><loc>https://a2o.kr${path}</loc></url>`).join('')}</urlset>`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
}
