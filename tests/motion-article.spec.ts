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
	await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
		'content',
		`${title} | A2O`
	);
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
		'content',
		'https://a2o.kr/og-default.png'
	);
	expect((await request.get('/og-default.png')).headers()['content-type']).toContain('image/png');
	await expect(page.locator('#question-4 + p')).toContainText('2,300km');
	await expect(page.locator('#question-4 + p')).toContainText('5분의 1에 가까운');
	await expect(page.locator('.sources-disclosure')).toContainText('약 18%');
	await expect(page.locator('.sources-disclosure')).toContainText('107,208km/h');
	const visibleArticle = await page.locator('article').innerText();
	expect(visibleArticle).not.toMatch(/자유낙하|가속 운동|조석 효과|코리올리|푸코|기준계|투영/);
	await expect(page.locator('article')).toContainText('중력은 물체끼리 서로 끌어당기는 힘');
	await expect(page.locator('article')).toContainText('태어나던 순간부터 지금까지 지구와 함께');
	const toc = page.getByRole('navigation', { name: '이 글의 순서' }).getByRole('link');
	await expect(toc).toHaveCount(4);
	for (let i = 0; i < 4; i++) {
		await toc.nth(i).click();
		await expect(page.locator(`#question-${i + 1}`)).toBeInViewport();
	}
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
	for (const value of ['1,670', '107,000', '828,000'])
		await expect(page.locator('.motion-speeds')).toContainText(value);
	await expect(page.locator('.motion-speeds .approx')).toHaveText([
		'시속 약',
		'시속 약',
		'시속 약'
	]);
	await expect(page.locator('.motion-speeds')).not.toContainText('km/s');
	await expect(page.locator('.motion-speeds')).toContainText('적도 지표면');
	await expect(page.locator('.motion-speeds')).toContainText('단순히 더할 수 없습니다');
	await expect(page.locator('.article-sources li')).toHaveCount(13);
	const advanced = page.locator('.inertia-figure .model-notes');
	await expect(advanced).not.toHaveAttribute('open');
	await advanced.locator('summary').click();
	await expect(advanced).toHaveAttribute('open');
	await expect(advanced).toContainText('자유낙하');
	await expect(advanced).toContainText('가속 운동');
	await expect(advanced).toContainText('코리올리 효과');
	await advanced.locator('summary').click();
	for (const link of await page.locator('.article-sources li > a').all())
		expect(await link.getAttribute('href')).toMatch(/^https:\/\//);
	await expect(page.locator('.motion-speeds details')).toHaveCount(0);
	await page.getByRole('link', { name: '지구 자전 출처 1', exact: true }).click();
	await expect(page.locator('.sources-disclosure')).toHaveAttribute('open');
	await expect(page.locator('#source-motion-rotation')).toBeInViewport();
	await expect(
		page.getByRole('link', { name: '궤도 탐험에서 직접 보기 ↗', exact: true })
	).toHaveAttribute('href', '/orbit/');
	expect(await (await request.get('/sitemap.xml')).text()).toContain(`https://a2o.kr${route}`);
	await page.goto('/articles/?topic=cosmos');
	await expect(page.locator('.article-card')).toHaveCount(3);
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
	const notes = figure.locator('.model-notes');
	const explanation = notes.locator('summary');
	const calculationSource = notes.getByRole('link', { name: '계산의 출처 ↗', exact: true });
	await expect(notes).not.toHaveAttribute('open');
	await expect(calculationSource).not.toBeVisible();
	const initialDrawing = (await figure.locator('.drawing').boundingBox())!;
	expect(initialDrawing.height).toBeCloseTo(initialDrawing.width * (310 / 640) * 1.7, 1);
	await expect(figure.locator('.frame-summary')).toContainText('태양 고정');
	await expect(figure.locator('.frame-summary')).toContainText('태양을 따라가며 보면');
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
	await expect(figure.locator('.frame-summary')).toContainText('태양도 이동');
	await expect(figure.locator('.frame-summary')).toContainText('길게 이어져요');
	await expect(figure.locator('.legend')).toContainText('태양의 이동 경로');
	const summaryBottom = (await figure.locator('.frame-summary').boundingBox())!;
	const drawingTop = (await figure.locator('.drawing').boundingBox())!;
	expect(summaryBottom.y + summaryBottom.height).toBeLessThanOrEqual(drawingTop.y);
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
	await expect(figure.locator('.simple-model-note')).toBeVisible();
	await expect(figure.locator('.simple-model-note')).toContainText(
		'그림 크기는 실제 비율이 아니에요'
	);
	await slider.press('End');
	await expect(figure).toHaveAttribute('data-phase', '1');
	await figure.screenshot({ path: `artifacts/motion-article/${info.project.name}-galactic.png` });
	await figure.getByRole('button', { name: '태양 기준', exact: true }).click();
	await expect(figure.locator('.frame-summary')).toContainText('태양 고정');
	await figure.screenshot({ path: `artifacts/motion-article/${info.project.name}-solar.png` });
	await explanation.focus();
	await explanation.press('Enter');
	await expect(notes).toHaveAttribute('open');
	await expect(calculationSource).toBeVisible();
	await figure.screenshot({ path: `artifacts/motion-article/${info.project.name}-notes-open.png` });
	await explanation.press('Space');
	await expect(notes).not.toHaveAttribute('open');
	await expect(calculationSource).not.toBeVisible();
	await explanation.click();
	await expect(calculationSource).toBeVisible();
	await explanation.click();
	await expect(calculationSource).not.toBeVisible();
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
	await page.locator('.motion-speeds').screenshot({
		path: `artifacts/motion-reading-level/${info.project.name}-speeds.png`
	});
	await page.locator('.inertia-figure').screenshot({
		path: `artifacts/motion-reading-level/${info.project.name}-train.png`
	});
	await page.screenshot({
		path: `artifacts/motion-reading-level/${info.project.name}-article.png`,
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

test('both frames play, pause in place, resume, scrub and restart after completion', async ({
	page
}, info) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.clock.install({ time: new Date('2026-10-21T00:00:00Z') });
	await page.goto(route);
	await page.clock.pauseAt(new Date('2026-10-21T00:01:00Z'));
	const figure = page.getByTestId('motion-frame-comparison');
	const playback = figure.getByTestId('motion-playback');
	const slider = figure.getByRole('slider');
	const phase = async () => Number(await figure.getAttribute('data-phase'));
	await expect(figure).toHaveAttribute('data-playing', 'false');
	await page.clock.runFor(1000);
	expect(await phase()).toBe(1);
	for (const [frame, other, reducedMotion] of [
		['태양', '은하', 'no-preference'],
		['은하', '태양', 'reduce']
	] as const) {
		await page.emulateMedia({ reducedMotion });
		await figure.getByRole('button', { name: `${frame} 기준`, exact: true }).click();
		await expect(playback).toHaveAccessibleName(`${frame} 기준 재생하기`);
		await playback.focus();
		await playback.press('Enter');
		await expect(playback).toHaveAccessibleName(`${frame} 기준 일시 정지`);
		await expect(playback).toHaveAttribute('aria-pressed', 'true');
		await expect(playback.locator('svg path')).toHaveCount(1);
		expect(await phase()).toBe(0);
		await page.clock.runFor(1200);
		const progressed = await phase();
		expect(progressed).toBeCloseTo(reducedMotion === 'reduce' ? 0.1 : 0.15, 2);
		await playback.click();
		const paused = await phase();
		await expect(playback.locator('svg polygon')).toHaveCount(1);
		await page.clock.runFor(1200);
		expect(await phase()).toBe(paused);
		await playback.focus();
		await playback.press('Space');
		await page.clock.runFor(600);
		expect(await phase()).toBeGreaterThan(paused);
		const beforeSwitch = await phase();
		await figure.getByRole('button', { name: `${other} 기준`, exact: true }).click();
		expect(await phase()).toBe(beforeSwitch);
		await expect(figure).toHaveAttribute('data-playing', 'true');
		await figure.getByRole('button', { name: `${frame} 기준`, exact: true }).click();
		await slider.fill('0.42');
		await expect(figure).toHaveAttribute('data-playing', 'false');
		await page.clock.runFor(500);
		expect(await phase()).toBe(0.42);
		await playback.click();
		await page.clock.runFor(120);
		await figure.screenshot({
			path: `artifacts/motion-playback/${info.project.name}-${frame}-playing.png`
		});
		await playback.press('Escape');
		const escaped = await phase();
		await page.clock.runFor(500);
		expect(await phase()).toBe(escaped);
		await playback.click();
		await page.clock.fastForward(20_000);
		await expect(figure).toHaveAttribute('data-phase', '1');
		await expect(figure).toHaveAttribute('data-playing', 'false');
		await expect(playback).toHaveAccessibleName(`${frame} 기준 재생하기`);
		await playback.click();
		expect(await phase()).toBe(0);
		await playback.click();
		await slider.fill('1');
	}
	await playback.click();
	await page.goto('/articles/');
	await page.clock.runFor(1200);
	await page.goto(route);
	await expect(figure).toHaveAttribute('data-playing', 'false');
	await expect(figure).toHaveAttribute('data-phase', '1');
	expect(errors).toEqual([]);
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
	const notes = page.getByTestId('motion-frame-comparison').locator('.model-notes');
	await expect(notes).not.toHaveAttribute('open');
	await notes.locator('summary').click();
	await expect(notes.getByRole('link', { name: '계산의 출처 ↗', exact: true })).toBeVisible();
	await expect(page.locator('.sources-disclosure > summary')).toHaveText('자료 및 출처');
	await context.close();
});
