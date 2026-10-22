import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const route = '/articles/empty-space-in-atoms/';

test('atomic story connects the catalogue, sources, scale explorer and truthful metadata', async ({
	page,
	request
}, info) => {
	await page.goto('/articles/?topic=micro');
	await expect(page.locator('.article-card')).toHaveCount(2);
	await page
		.getByRole('link', { name: '원자는 거의 빈 공간인데, 왜 책상은 단단할까?', exact: true })
		.click();
	await expect(page).toHaveURL(new RegExp(`${route}$`));
	await expect(page.locator('h1')).toHaveText('원자는 거의 빈 공간인데, 왜 책상은 단단할까?');
	await expect(page.locator('.article-header')).not.toContainText(/분 읽기|2026\./);
	await expect(page.locator('.sources-disclosure')).not.toHaveAttribute('open');
	// Technical definitions remain available in closed model/source notes.
	expect(await page.locator('article').innerText()).not.toMatch(
		/RMS|a₀|rₚ|비상대론|확률밀도|구껍질|오비탈/
	);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		`https://a2o.kr${route}`
	);
	const schema = JSON.parse(
		(await page.locator('script[type="application/ld+json"]').textContent())!
	);
	expect(schema['@type']).toBe('Article');
	expect(schema).not.toHaveProperty('datePublished');
	await expect(
		page.locator('.explorer-invitation a[href="/articles/atomic-scale/"]')
	).toBeVisible();
	await expect(page.locator('.explorer-invitation a[href="/scale/?object=atom"]')).toBeVisible();
	expect(await (await request.get('/sitemap.xml')).text()).toContain(`https://a2o.kr${route}`);
	await page.evaluate(() => document.fonts.ready);
	await page
		.locator('.article-header')
		.screenshot({ path: `artifacts/atomic-space-reading-level/${info.project.name}-header.png` });
	await page.screenshot({
		path: `artifacts/atomic-space-reading-level/${info.project.name}-article.png`,
		fullPage: true
	});
	await page.goto('/');
	await expect(
		page
			.locator('.stories-band')
			.getByRole('link', { name: '원자는 거의 빈 공간인데, 왜 책상은 단단할까?', exact: true })
	).toBeVisible();
	for (const art of await page.locator('.stories-band .article-art').all()) {
		const frame = (await art.boundingBox())!;
		const graphic = (await art.locator('svg').first().boundingBox())!;
		expect(graphic.height).toBeLessThanOrEqual(frame.height + 1);
		expect(graphic.width).toBeLessThanOrEqual(frame.width + 1);
	}
	await page.locator('.stories-band').screenshot({
		path: `artifacts/atomic-space-reading-level/${info.project.name}-home-stories.png`
	});
});

test('distance exploration preserves a linear ruler and switches between tiny and visible nucleus', async ({
	page
}, info) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto(route);
	await page.evaluate(() => document.fonts.ready);
	const figure = page.locator('.atomic-distance');
	const status = figure.locator('.scale-status');
	const slider = figure.getByRole('slider');
	const nucleus = figure.locator('circle.nucleus');
	const marker = figure.locator('.nucleus-marker');
	await expect(figure).toContainText('약 315');
	await expect(status).toContainText('십자');
	await expect(marker).toHaveCount(1);
	await expect(nucleus).toHaveCount(0);
	await figure.screenshot({
		path: `artifacts/atomic-space-reading-level/${info.project.name}-distance-wide.png`
	});
	await slider.fill('0.8');
	await expect(marker).toHaveCount(0);
	await expect(nucleus).toBeVisible();
	await expect(status).toContainText('서서히 눈에 보이기 시작');
	await expect(status).not.toContainText('1cm');
	await expect(figure.locator('svg text').filter({ hasText: /^핵$/ })).toHaveCount(1);
	await figure.screenshot({
		path: `artifacts/atomic-space-reading-level/${info.project.name}-distance-emerging.png`
	});
	await figure.getByRole('button', { name: '핵 가까이', exact: true }).click();
	await expect(slider).toHaveValue('1');
	await expect(status).toContainText('1cm 구슬 모형');
	await expect(status).toContainText('같은 비율');
	await expect(marker).toHaveCount(0);
	expect((await nucleus.boundingBox())!.width).toBeCloseTo(96 / 2.54, 1);
	// A responsive layout must still draw the endpoint at the browser's 1cm size.
	const viewport = page.viewportSize()!;
	await page.setViewportSize({ width: 320, height: viewport.height });
	await expect(async () => {
		expect((await nucleus.boundingBox())!.width).toBeCloseTo(96 / 2.54, 1);
	}).toPass();
	await expect(status).toContainText('1cm 구슬 모형');
	await page.setViewportSize(viewport);
	await expect(figure.getByRole('img')).toContainText('315m 지점은 화면 밖');
	await figure.screenshot({
		path: `artifacts/atomic-space-reading-level/${info.project.name}-distance-close.png`
	});
	await slider.focus();
	await slider.press('ArrowLeft');
	await expect(slider).toHaveValue('0.999');
	await expect(status).toContainText('서서히 눈에 보이기 시작');
	await expect(status).not.toContainText('1cm');
	await figure.getByRole('button', { name: '315m까지 보기' }).click();
	await expect(slider).toHaveValue('0');
	await expect(marker).toHaveCount(1);
	await expect(nucleus).toHaveCount(0);
	await expect(status).toContainText('십자');
	await expect(figure.locator('svg')).not.toHaveAttribute('viewBox', /NaN|Infinity/);
	expect(errors).toEqual([]);
});

test('linked electron cloud and radial graph report integrated probabilities at the selected distance', async ({
	page
}, info) => {
	await page.goto(route);
	await page.evaluate(() => document.fonts.ready);
	const figure = page.locator('.atomic-probability');
	const slider = figure.getByRole('slider');
	await expect(figure.locator('output')).toHaveText('약 315m');
	await expect(figure.locator('.measurement')).toContainText('1cm 구슬');
	await expect(figure.locator('.probability-result')).toContainText('10.8%');
	await figure.screenshot({
		path: `artifacts/atomic-space-reading-level/${info.project.name}-probability-default.png`
	});
	await slider.focus();
	await slider.press('End');
	await expect(figure.locator('output')).toHaveText('약 1,574m');
	await expect(figure.locator('.probability-result')).toContainText('0.1%');
	await expect(figure.locator('svg').first()).toContainText('1,574m');
	await slider.press('Home');
	await expect(figure.locator('.probability-result')).toContainText('0~31m');
	await expect(figure.locator('.probability-result')).toContainText('0.1%');
	await expect(figure.locator('path[d*="NaN"], path[d*="Infinity"]')).toHaveCount(0);
});

test('atomic figures fit narrow and enlarged text layouts and pass accessibility checks', async ({
	page
}, info) => {
	await page.goto(route);
	for (const width of [390, 320]) {
		await page.setViewportSize({ width, height: 900 });
		await page.locator('.atomic-probability').scrollIntoViewIfNeeded();
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		await page.locator('.atomic-probability').screenshot({
			path: `artifacts/atomic-space-reading-level/${info.project.name}-${width}-probability.png`
		});
	}
	await page.addStyleTag({
		content: 'article p, article label, article button { font-size: 200% !important; }'
	});
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	await page.locator('.atomic-distance').screenshot({
		path: `artifacts/atomic-space-reading-level/${info.project.name}-enlarged-text.png`
	});
	const results = await new AxeBuilder({ page })
		.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
		.analyze();
	expect(results.violations).toEqual([]);
});
