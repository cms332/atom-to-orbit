import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = process.env.A2O_BASE_URL || 'https://a2o.kr';
const folder = 'artifacts/deployment';
await mkdir(folder, { recursive: true });
const infoResponse = await fetch(`${origin}/build-info.json`);
assert.equal(infoResponse.status, 200);
const info = await infoResponse.json();
assert.match(info.commit, /^[a-f0-9]{40}$/);
assert.match(info.release, /^\d{8}T\d{6}Z$/);
const responses = [];
for (const route of [
	'/',
	'/scale/',
	'/orbit/',
	'/articles/',
	'/articles/why-earth-feels-still/',
	'/robots.txt',
	'/sitemap.xml',
	'/fonts/OFL.txt',
	'/licenses/orbit-textures.txt'
]) {
	const response = await fetch(origin + route);
	assert.equal(response.status, 200, route);
	assert.ok(!response.headers.get('x-robots-tag')?.includes('noindex'), route);
	if (route.endsWith('/')) assert.match(response.headers.get('cache-control') || '', /no-cache/);
	responses.push({ route, status: response.status, cache: response.headers.get('cache-control') });
}
const missing = await fetch(`${origin}/nonexistent-a2o-deployment-check/`);
assert.equal(missing.status, 404);
assert.match(missing.headers.get('cache-control') || '', /no-store/);
if (origin === 'https://a2o.kr') {
	const www = await fetch('https://www.a2o.kr/orbit/', { redirect: 'manual' });
	assert.equal(www.status, 308);
	assert.equal(www.headers.get('location'), 'https://a2o.kr/orbit/');
	const http = await fetch('http://a2o.kr/orbit/', { redirect: 'manual' });
	assert.ok([301, 302, 307, 308].includes(http.status));
	assert.equal(http.headers.get('location'), 'https://a2o.kr/orbit/');
}
const home = await (await fetch(origin)).text();
let modulePath;
for (const candidate of new Set(
	[...home.matchAll(/\/_app\/immutable\/[^"'\s]+\.js/g)].map((match) => match[0])
)) {
	const response = await fetch(origin + candidate, { headers: { 'Accept-Encoding': 'gzip' } });
	if ((await response.arrayBuffer()).byteLength <= 1024) continue;
	assert.match(response.headers.get('cache-control') || '', /immutable/);
	assert.equal(response.headers.get('content-encoding'), 'gzip');
	modulePath = candidate;
	break;
}
assert.ok(modulePath, 'A real immutable JavaScript module larger than 1KiB is compressed');
const font = await fetch(`${origin}/fonts/A2OSans-Subset.woff2`);
assert.equal(font.status, 200);
assert.match(font.headers.get('link') || '', /OFL\.txt/);
const browser = await chromium.launch();
const views = [];
try {
	for (const [width, height] of [
		[1440, 1000],
		[360, 800]
	]) {
		const page = await browser.newPage({
			viewport: { width, height },
			isMobile: width < 768,
			hasTouch: width < 768,
			reducedMotion: 'reduce'
		});
		const errors = [],
			failures = [];
		page.on('pageerror', (error) => errors.push(error.message));
		page.on('requestfailed', (request) => {
			if (request.failure()?.errorText !== 'net::ERR_ABORTED') failures.push(request.url());
		});
		for (const route of ['/', '/scale/', '/articles/']) {
			await page.goto(origin + route);
			await expect(page.locator('h1')).toBeVisible();
			assert.ok(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
				)
			);
			await page.screenshot({
				path: `${folder}/${width}-${route === '/' ? 'home' : route.replaceAll('/', '')}.png`
			});
		}
		await page.goto(`${origin}/articles/why-earth-feels-still/`);
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(
			'태양은 움직이는데, 왜 우리는 제자리에 있다고 느낄까?'
		);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			'href',
			`${origin}/articles/why-earth-feels-still/`
		);
		await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
			'content',
			'태양은 움직이는데, 왜 우리는 제자리에 있다고 느낄까? | A2O'
		);
		await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
			'content',
			'https://a2o.kr/og-default.png'
		);
		await expect(page.locator('#question-4 + p')).toContainText('지구 평균 지름의 약 18%');
		assert.equal(
			JSON.parse(await page.locator('script[type="application/ld+json"]').textContent())['@type'],
			'Article'
		);
		await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute(
			'content',
			'태양은 움직이는데, 왜 우리는 제자리에 있다고 느낄까? | A2O'
		);
		await page.evaluate(() => document.fonts.ready);
		const preload = await page.locator('link[rel="preload"][as="font"]').getAttribute('href');
		assert.match(preload, /A2OSans-Subset\.woff2\?v=[a-f0-9]{12}$/);
		const requestedFonts = await page.evaluate(() => [
			...new Set(
				performance
					.getEntriesByType('resource')
					.map((entry) => entry.name)
					.filter((url) => url.includes('A2OSans-Subset.woff2'))
			)
		]);
		assert.deepEqual(requestedFonts, [new URL(preload, origin).href]);
		await page.screenshot({ path: `${folder}/${width}-motion-article.png` });
		const motionFigure = page.getByTestId('motion-frame-comparison');
		const relativePosition = (await motionFigure.getAttribute('data-relative-position'))
			.split(',')
			.map(Number);
		await motionFigure.getByRole('button', { name: '은하 기준', exact: true }).click();
		await expect(motionFigure).toHaveAttribute('data-frame', 'galactic');
		await expect(motionFigure.locator('.frame-summary')).toContainText('태양도 이동');
		await expect(motionFigure.locator('.legend')).toContainText('태양의 이동 경로');
		const changedPosition = (await motionFigure.getAttribute('data-relative-position'))
			.split(',')
			.map(Number);
		for (let axis = 0; axis < 3; axis++)
			assert.ok(Math.abs(relativePosition[axis] - changedPosition[axis]) < 1e-10);
		await motionFigure.screenshot({ path: `${folder}/${width}-motion-galactic.png` });
		await motionFigure.getByRole('button', { name: '태양 기준', exact: true }).click();
		await expect(motionFigure).toHaveAttribute('data-frame', 'solar');
		await expect(motionFigure.locator('.frame-summary')).toContainText('태양 고정');
		await expect(page.locator('.article-sources li')).toHaveCount(10);
		await expect(page.locator('canvas')).toHaveCount(0);
		await page.goto(`${origin}/orbit/`);
		await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
		const canvas = page.getByTestId('orbit-canvas');
		const time = Number(await canvas.getAttribute('data-year'));
		await expect
			.poll(async () => Number(await canvas.getAttribute('data-year')))
			.toBeGreaterThan(time);
		await page.screenshot({ path: `${folder}/${width}-orbit.png` });
		const settings = page.getByRole('complementary', { name: '탐험 설정', exact: true });
		const settingsButton = page.getByRole('button', { name: '설정', exact: true });
		await settingsButton.click();
		await page.getByLabel('시간 배속', { exact: true }).selectOption('0.1');
		await expect(settings).toBeVisible();
		await page.getByLabel('가까이 보기', { exact: true }).selectOption('earth');
		if (width < 768) {
			await expect(settings).toHaveCount(0);
			await expect(settingsButton).toBeFocused();
		} else await expect(settings).toBeVisible();
		await expect(canvas).toHaveAttribute('data-preset', 'track-earth');
		await expect(canvas).toHaveAttribute('data-transitioning', 'false');
		await page.screenshot({ path: `${folder}/${width}-settings-selection.png` });
		if (width < 768) await settingsButton.click();
		await expect(page.getByLabel('가까이 보기', { exact: true })).toHaveValue('earth');
		await page.getByRole('button', { name: '설정 닫기', exact: true }).click();
		const story = page.getByRole('button', { name: '스토리', exact: true });
		await story.click();
		await story.click();
		for (let chapter = 2; chapter <= 5; chapter++) {
			await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
			if (chapter < 4) continue;
			await expect(canvas).toHaveAttribute('data-transitioning', 'false');
			await page.screenshot({ path: `${folder}/${width}-chapter${chapter}.png` });
		}
		assert.deepEqual(errors, []);
		assert.deepEqual(failures, []);
		views.push({ width, errors, failures });
		await page.close();
	}
} finally {
	await browser.close();
}
await writeFile(
	`${folder}/verification.json`,
	JSON.stringify(
		{ info, responses, modulePath, views, checkedAt: new Date().toISOString() },
		null,
		2
	)
);
console.log(
	JSON.stringify({
		release: info.release,
		commit: info.commit,
		routes: responses.length,
		views,
		result: 'passed'
	})
);
