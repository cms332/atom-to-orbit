import { test, expect } from '@playwright/test';
import { ENLARGED_BALL_METERS, moonReference } from '../src/lib/data/atomic-scale-comparison';

const route = '/articles/atomic-scale/';

test('revised atomic story introduces units, keeps sources and expands the detailed calculation on request', async ({
	page
}, info) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto(route);
	await expect(page.locator('h1')).toHaveText('원자의 크기는 어떻게 읽을까?');
	await expect(page.locator('.article-header')).toContainText('탁구공 하나');
	await expect(page.locator('.article-nav a')).toHaveCount(4);
	await expect(page.locator('.article-body')).toContainText('10억 개');
	const figure = page.locator('.atom-ball-moon');
	await expect(figure).toContainText('3,800');
	await expect(figure).toContainText('3,475');
	const calculation = figure.locator('.model-notes');
	await expect(calculation).not.toHaveAttribute('open');
	await expect(page.locator('.sources-disclosure')).not.toHaveAttribute('open');
	const visible = await page.locator('article').innerText();
	expect(visible).not.toMatch(/a₀|유효숫자|5\.291772/);
	await page.evaluate(() => document.fonts.ready);
	await page.screenshot({
		path: `artifacts/atomic-scale-reading-level/${info.project.name}-article.png`,
		fullPage: true
	});
	await figure.screenshot({
		path: `artifacts/atomic-scale-reading-level/${info.project.name}-comparison.png`
	});
	await calculation.locator('summary').click();
	await expect(calculation).toContainText('3.78억');
	await expect(calculation).toContainText('3779.45km');
	await calculation.locator('a[href="#source-ittf"]').click();
	const sources = page.locator('.sources-disclosure');
	await expect(sources).toHaveAttribute('open');
	await expect(page.locator('#source-ittf a')).toHaveAttribute('href', /2025_ITTF_Statutes/);
	await expect(page.locator('#source-nist a')).toHaveAttribute('href', /wall_2022\.pdf$/);
	await expect(page.locator('#source-moon a')).toHaveAttribute('href', /moonfact\.html$/);
	await expect(sources.locator('li')).toHaveCount(5);
	await expect(page.locator('.explorer-invitation a')).toHaveAttribute(
		'href',
		'/scale/?object=atom'
	);
	for (const link of await page.locator('.article-nav a').all()) {
		const href = (await link.getAttribute('href'))!;
		await link.click();
		await expect(page.locator(href)).toBeInViewport();
	}
	expect(errors).toEqual([]);
});

test('Moon and enlarged ball retain the scientific diameter ratio at desktop and narrow widths', async ({
	page
}, info) => {
	await page.goto(route);
	const figure = page.locator('.atom-ball-moon');
	for (const width of [1440, 390, 320]) {
		await page.setViewportSize({ width, height: 900 });
		await figure.scrollIntoViewIfNeeded();
		const ball = (await figure.locator('[data-body="model-ball"]').boundingBox())!;
		const moon = (await figure.locator('[data-body="moon"]').boundingBox())!;
		expect(moon.width / ball.width).toBeCloseTo(moonReference.meters / ENLARGED_BALL_METERS, 5);
		expect(moon.height / ball.height).toBeCloseTo(moon.width / ball.width, 6);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		await figure.screenshot({
			path: `artifacts/atomic-scale-reading-level/${info.project.name}-${width}-comparison.png`
		});
	}
	await page.addStyleTag({
		content: 'article p, article h4, article figcaption { font-size: 200% !important; }'
	});
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
