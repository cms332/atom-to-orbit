import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { earthMoonArticle } from '../src/lib/content/earth-moon-article';
import {
	MODEL_MOON_DIAMETER,
	MODEL_EARTH_DIAMETER,
	MODEL_CENTER_DISTANCE
} from '../src/lib/data/earth-moon-comparison';

const route = '/articles/earth-moon/';

test('Moon story introduces familiar comparisons before exact calculations and preserves its identity', async ({
	page
}, info) => {
	await page.goto(route);
	await expect(page.locator('h1')).toHaveText(earthMoonArticle.title);
	await expect(page.locator('.article-header')).not.toContainText(/분 읽기|2026\./);
	expect(await page.locator('article').innerText()).not.toMatch(
		/체적 평균|긴반지름|30\.2배|29\.5배/
	);
	await expect(page.locator('article')).toContainText('태양빛을 받아');
	await expect(page.locator('article')).toContainText('약 1.3초 전의 모습');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		`https://a2o.kr${route}`
	);
	const schema = JSON.parse(
		(await page.locator('script[type="application/ld+json"]').textContent())!
	);
	expect(schema.datePublished).toBe('2026-10-19');
	const toc = page.getByRole('navigation', { name: '이 글의 순서' }).getByRole('link');
	await expect(toc).toHaveCount(4);
	for (let i = 0; i < 4; i++) {
		await toc.nth(i).click();
		await expect(page.locator(`#question-${i + 1}`)).toBeInViewport();
	}
	const calculation = page.locator('.distance-figure .model-notes');
	await expect(calculation).not.toHaveAttribute('open');
	await calculation.getByText('정확한 계산 살펴보기', { exact: true }).click();
	await expect(calculation).toContainText('30.2배');
	await expect(calculation).toContainText('29.5배');
	await expect(calculation).toContainText('3,474.8km');
	await expect(calculation).toContainText('1.282초');
	await calculation.locator('summary').click();
	const sources = page.locator('.sources-disclosure');
	await sources.locator('summary').click();
	await expect(sources.locator('li')).toHaveCount(7);
	for (const id of [
		'earth-facts',
		'earth',
		'moon',
		'moon-space-place',
		'moon-jpl-model',
		'moon-webb-light',
		'moon-light-speed'
	]) {
		await expect(page.locator(`#source-${id} a`)).toHaveAttribute('href', /^https:\/\//);
	}
	await sources.locator('summary').click();
	await expect(page.locator('.explorer-invitation a.primary')).toHaveAttribute(
		'href',
		'/scale/?object=earth'
	);
	await page.evaluate(() => document.fonts.ready);
	await page
		.locator('.distance-figure')
		.screenshot({ path: `artifacts/earth-moon-reading-level/${info.project.name}-distance.png` });
	await page.screenshot({
		path: `artifacts/earth-moon-reading-level/${info.project.name}-article.png`,
		fullPage: true
	});
});

test('ball-distance question supports wrong answers, keyboard selection and proportionate solution', async ({
	page
}, info) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(route);
	const figure = page.locator('.earth-moon-balls');
	const solution = figure.locator('.solution');
	await expect(solution).toBeHidden();
	await figure.getByRole('button', { name: '1m', exact: true }).click();
	await expect(figure.getByRole('status')).toContainText('1m는 너무 가까워요');
	await expect(solution).toBeHidden();
	await figure.getByRole('button', { name: '3m', exact: true }).click();
	await expect(figure.getByRole('status')).toContainText('3m는 너무 가까워요');
	await figure.getByRole('button', { name: '약 7.2m', exact: true }).focus();
	await page.keyboard.press('Space');
	await expect(figure.getByRole('status')).toContainText('맞았어요');
	await expect(solution).toBeVisible();
	await expect(figure.getByRole('button', { name: '약 7.2m', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	const earth = solution.locator('[data-scaled-ball="earth"]');
	const moon = solution.locator('[data-scaled-ball="moon"]');
	const separation = Number(await moon.getAttribute('cx')) - Number(await earth.getAttribute('cx'));
	expect(separation / (2 * Number(await earth.getAttribute('r')))).toBeCloseTo(
		MODEL_CENTER_DISTANCE / MODEL_EARTH_DIAMETER,
		10
	);
	expect(Number(await moon.getAttribute('r')) / Number(await earth.getAttribute('r'))).toBeCloseTo(
		MODEL_MOON_DIAMETER / MODEL_EARTH_DIAMETER,
		12
	);
	for (const width of [info.project.use.viewport!.width, 390, 320]) {
		await page.setViewportSize({ width, height: 900 });
		await expect(figure).toContainText('간격은 실제 비례가 아니에요');
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		const earthBox = (await figure.locator('[data-ball="earth"]').boundingBox())!;
		const moonBox = (await figure.locator('[data-ball="moon"]').boundingBox())!;
		expect(moonBox.width / earthBox.width).toBeCloseTo(
			MODEL_MOON_DIAMETER / MODEL_EARTH_DIAMETER,
			4
		);
		for (const button of await figure.getByRole('button').all()) {
			expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
		}
		await page.evaluate(() => document.fonts.ready);
		await figure.screenshot({
			path: `artifacts/earth-moon-reading-level/${info.project.name}-${width}-balls-answer.png`
		});
	}
	await page.addStyleTag({
		content: 'article p, article button, article legend { font-size: 200% !important; }'
	});
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	const audit = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
		.analyze();
	expect(audit.violations).toEqual([]);
	expect(errors).toEqual([]);
});

test('Moon story retains the answer and native source disclosure without JavaScript', async ({
	browser
}, info) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: info.project.use.viewport
	});
	const page = await context.newPage();
	await page.goto(`http://127.0.0.1:4173${route}`);
	await expect(page.locator('.earth-moon-balls button:disabled')).toHaveCount(3);
	await expect(page.locator('.no-script-answer')).toContainText('정답은 약 7.2m');
	await expect(page.locator('.distance-figure')).toBeVisible();
	await page.locator('.sources-disclosure summary').click();
	await expect(page.locator('#source-moon-jpl-model a')).toBeVisible();
	await context.close();
});
