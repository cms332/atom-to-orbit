import { test, expect } from '@playwright/test';

test('sitemap pages have exactly one stable canonical in source and hydrated head', async ({
	page,
	request
}) => {
	const xml = await (await request.get('/sitemap.xml')).text();
	const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
	expect(new Set(urls).size).toBe(urls.length);
	for (const url of urls) {
		expect(url).toMatch(/^https:\/\/a2o\.kr\/(?:[a-z0-9-]+\/)*$/);
		const path = new URL(url).pathname;
		const response = await request.get(path + '?utm_source=canonical-test');
		expect(response.status()).toBe(200);
		const html = await response.text();
		await page.goto(path + '?utm_source=canonical-test');
		const source = await page.evaluate((markup) => {
			const doc = new DOMParser().parseFromString(markup, 'text/html');
			return [...doc.querySelectorAll('link[rel="canonical"]')].map((e) => ({
				href: e.getAttribute('href'),
				head: !!e.closest('head')
			}));
		}, html);
		expect(source).toEqual([{ href: url, head: true }]);
		await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
		await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', url);
		expect(response.headers()['x-robots-tag'] ?? '').not.toMatch(/noindex/i);
		await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
	}
});

test('client navigation, article filters and scale state retain page canonicals', async ({
	page,
	isMobile
}) => {
	await page.goto('/articles/?topic=micro');
	await expect(page.locator('.article-card')).toHaveCount(2);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://a2o.kr/articles/'
	);
	await page.locator('.article-card a').first().click();
	await expect(page).toHaveURL(/\/articles\/[a-z-]+\/$/);
	await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://a2o.kr' + new URL(page.url()).pathname
	);
	if (isMobile) await page.getByRole('button', { name: '메뉴', exact: true }).click();
	await page
		.getByRole('navigation', { name: isMobile ? '모바일 탐색' : '주요 탐색', exact: true })
		.getByRole('link', { name: '크기 탐험하기', exact: false })
		.click();
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://a2o.kr/scale/'
	);
	await page.goto('/scale/?object=earth&at=7.1&utm_source=canonical-test&unknown=keep');
	await expect(page.getByRole('slider', { name: '로그 눈금 탐색' })).toHaveValue('7.1');
	await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		'https://a2o.kr/scale/'
	);
	expect(new URL(page.url()).searchParams.get('unknown')).toBe('keep');
});
