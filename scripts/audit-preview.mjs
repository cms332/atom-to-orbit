import { chromium, request } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

// Run after a fresh build, with the local preview server already running.
const baseURL = process.env.A2O_PREVIEW_URL ?? 'http://127.0.0.1:4173';
const output = 'artifacts/verification-2026-10-19';
const routes = [
	['/', 'home'],
	['/scale/?object=earth', 'scale'],
	['/articles/', 'articles'],
	['/articles/earth-moon/', 'article'],
	['/articles/atomic-scale/', 'atomic-article'],
	['/404/', '404']
];
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const client = await request.newContext({ baseURL });
const localLinks = new Set([
	'/robots.txt',
	'/sitemap.xml',
	'/favicon.svg',
	'/og-default.png',
	'/fonts/A2OSans-Subset.woff2'
]);
const externalLinks = new Set();
const pages = [];
try {
	for (const [device, viewport] of [
		['desktop', { width: 1440, height: 1000 }],
		['mobile', { width: 390, height: 844 }]
	]) {
		const context = await browser.newContext({
			viewport,
			isMobile: device === 'mobile',
			hasTouch: device === 'mobile'
		});
		const page = await context.newPage();
		for (const [route, name] of routes) {
			const failures = [];
			const onFailure = (req) => failures.push({ url: req.url(), error: req.failure()?.errorText });
			page.on('requestfailed', onFailure);
			const response = await page.goto(new URL(route, baseURL).href);
			await page.evaluate(() => document.fonts.ready);
			const details = await page.evaluate(() => ({
				width: document.documentElement.clientWidth,
				scrollWidth: document.documentElement.scrollWidth,
				fontLoaded: [...document.fonts].some(
					(font) => font.family === 'A2OSans' && font.status === 'loaded'
				),
				links: [...document.querySelectorAll('a[href]')].map((link) => link.href),
				assets: [...document.querySelectorAll('script[src],link[rel="stylesheet"]')].map(
					(el) => el.src ?? el.href
				)
			}));
			for (const href of details.links) {
				const url = new URL(href);
				if (url.origin === new URL(baseURL).origin) localLinks.add(url.pathname + url.search);
				else if (url.protocol === 'https:') externalLinks.add(href);
			}
			for (const href of details.assets) localLinks.add(new URL(href).pathname);
			await page.screenshot({ path: `${output}/${device}-${name}-viewport.png` });
			delete details.links;
			delete details.assets;
			pages.push({ device, route, status: response.status(), ...details, failures });
			page.off('requestfailed', onFailure);
		}
		await context.close();
	}
	const internal = [];
	for (const href of [...localLinks].sort()) {
		const response = await client.get(href);
		internal.push({ href, status: response.status() });
	}
	const external = [];
	for (const url of [...externalLinks].sort()) {
		try {
			const response = await client.get(url, { timeout: 20000 });
			external.push({ url, status: response.status(), finalURL: response.url() });
		} catch (error) {
			external.push({ url, error: error.message.split('\n')[0] });
		}
	}
	const result = { checkedAt: new Date().toISOString(), baseURL, pages, internal, external };
	await writeFile(`${output}/link-and-display-audit.json`, JSON.stringify(result, null, 2));
	console.log(
		JSON.stringify(
			{
				pages: pages.length,
				internal: internal.length,
				internalFailures: internal.filter((link) => link.status !== 200),
				displayFailures: pages.filter(
					(page) => page.width < page.scrollWidth || !page.fontLoaded || page.failures.length
				),
				external
			},
			null,
			2
		)
	);
	if (
		internal.some((link) => link.status !== 200) ||
		pages.some((page) => page.width < page.scrollWidth || !page.fontLoaded || page.failures.length)
	)
		process.exitCode = 1;
} finally {
	await client.dispose();
	await browser.close();
}
