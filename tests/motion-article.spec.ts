import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const route = '/articles/why-earth-feels-still/';
const title = '태양은 움직이는데, 왜 우리는 제자리에 있다고 느낄까?';

test('motion article is discoverable, sourced and has valid article metadata', async ({
	page,
	request
}) => {
	const fontRequests: string[] = [];
	page.on('request', (request) => {
		if (request.url().includes('A2OSans-Subset.woff2')) fontRequests.push(request.url());
	});
	await page.goto('/');
	await page.evaluate(() => document.fonts.ready);
	await page.locator('.article-card').getByRole('link', { name: title }).click();
	await expect(page).toHaveURL(new RegExp(`${route}$`));
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		`https://a2o.kr${route}`
	);
	const schema = JSON.parse(
		(await page.locator('script[type="application/ld+json"]').textContent())!
	);
	expect(schema['@type']).toBe('Article');
	expect(schema.headline).toBe(title);
	expect(schema.datePublished).toBe('2026-10-21');
	expect(schema.mainEntityOfPage).toBe(`https://a2o.kr${route}`);
	await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
	await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
		'content',
		`${title} | A2O`
	);
	await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
		'content',
		'summary_large_image'
	);
	const fontPreload = (await page.locator('link[rel="preload"][as="font"]').getAttribute('href'))!;
	expect(fontPreload).toMatch(/A2OSans-Subset\.woff2\?v=[a-f0-9]{12}$/);
	expect([...new Set(fontRequests)]).toEqual([new URL(fontPreload, page.url()).href]);
	for (const value of ['1,670', '29.78', '230'])
		await expect(page.locator('.motion-speeds')).toContainText(value);
	await expect(page.locator('.motion-speeds')).toContainText('적도 지표면');
	await expect(page.locator('.motion-speeds')).toContainText('단순히 더할 수 없습니다');
	await expect(page.locator('.article-sources li')).toHaveCount(10);
	for (const link of await page.locator('.article-sources li > a').all())
		expect(await link.getAttribute('href')).toMatch(/^https:\/\//);
	await page.getByRole('link', { name: '지구 자전 수치의 출처', exact: true }).click();
	await expect(page.locator('#source-motion-rotation')).toBeInViewport();
	await expect(
		page.getByRole('link', { name: '궤도 탐험에서 직접 보기 ↗', exact: true })
	).toHaveAttribute('href', '/orbit/');
	expect(await (await request.get('/sitemap.xml')).text()).toContain(`https://a2o.kr${route}`);
	await page.goto('/articles/?topic=cosmos');
	await expect(page.locator('.article-card')).toHaveCount(2);
	await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
});

test('reference-frame toggle keeps time and relative geometry, supports keyboard and reduced motion', async ({
	page
}, info) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(route);
	const figure = page.getByTestId('motion-frame-comparison');
	const slider = figure.getByRole('slider');
	await slider.focus();
	await slider.press('Home');
	await slider.press('ArrowRight');
	await expect(figure).toHaveAttribute('data-phase', '0.01');
	const relative = await figure.getAttribute('data-relative-position');
	const solarPath = await figure.locator('svg > path').nth(2).getAttribute('d');
	const galaxy = figure.getByRole('button', { name: '은하 기준', exact: true });
	await galaxy.focus();
	await galaxy.press('Enter');
	await expect(galaxy).toHaveAttribute('aria-pressed', 'true');
	await expect(galaxy).toBeFocused();
	await expect(figure).toHaveAttribute('data-phase', '0.01');
	const changedRelative = (await figure.getAttribute('data-relative-position'))!
		.split(',')
		.map(Number);
	const originalRelative = relative!.split(',').map(Number);
	for (let i = 0; i < 3; i++) expect(changedRelative[i]).toBeCloseTo(originalRelative[i], 10);
	expect(await figure.locator('svg > path').nth(2).getAttribute('d')).not.toBe(solarPath);
	await expect(figure.locator('figcaption')).toContainText('1/20');
	await expect(figure.locator('figcaption')).toContainText('실시간 위치가 아닙니다');
	await slider.press('End');
	await expect(figure).toHaveAttribute('data-phase', '1');
	await figure.screenshot({ path: `artifacts/motion-article/${info.project.name}-galactic.png` });
	await figure.getByRole('button', { name: '태양 기준', exact: true }).click();
	await figure.screenshot({ path: `artifacts/motion-article/${info.project.name}-solar.png` });
	await expect(page.locator('canvas')).toHaveCount(0);
	expect(
		(await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
			.violations
	).toEqual([]);
	expect(errors).toEqual([]);
});

test('article stays readable at narrow widths and enlarged text', async ({ page }, info) => {
	await page.goto(route);
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({
		path: `artifacts/motion-article/${info.project.name}-article.png`,
		fullPage: true
	});
	for (const width of info.project.name === 'desktop' ? [1440, 768, 390, 320] : [390, 320]) {
		await page.setViewportSize({ width, height: 900 });
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
	}
	await page.evaluate(() => {
		const elements = Array.from(document.querySelectorAll<HTMLElement>('body *')).filter(
			(element) => element.namespaceURI === 'http://www.w3.org/1999/xhtml'
		);
		const sizes = elements.map((element) => parseFloat(getComputedStyle(element).fontSize));
		elements.forEach((element, i) => {
			element.style.fontSize = `${sizes[i] * 2}px`;
		});
	});
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('article and both frame diagrams remain available without JavaScript', async ({
	browser
}, info) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: info.project.use.viewport
	});
	const page = await context.newPage();
	await page.goto(`http://127.0.0.1:4173${route}`);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
	await expect(page.getByTestId('motion-solar-diagram')).toBeVisible();
	await expect(page.getByTestId('motion-galactic-diagram')).toBeVisible();
	await expect(page.getByRole('heading', { name: '자료 및 출처', exact: true })).toBeVisible();
	await context.close();
});
