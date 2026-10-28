import { chromium, expect } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const origin = process.env.A2O_BASE_URL || 'https://a2o.kr';
const folder = process.env.A2O_ARTIFACT_DIR || 'artifacts/deployment';
await mkdir(folder, { recursive: true });
const infoResponse = await fetch(`${origin}/build-info.json`);
assert.equal(infoResponse.status, 200);
const info = await infoResponse.json();
assert.match(info.commit, /^[a-f0-9]{40}$/);
assert.match(info.release, /^\d{8}T\d{6}Z$/);
if (process.env.A2O_EXPECTED_COMMIT) assert.equal(info.commit, process.env.A2O_EXPECTED_COMMIT);
const responses = [];
const articleSources = [
	['why-sky-blue-sunset-red', 9],
	['how-old-is-starlight', 11],
	['why-earth-feels-still', 13],
	['earth-moon', 7],
	['atomic-scale', 5],
	['empty-space-in-atoms', 5]
];
for (const route of [
	'/',
	'/scale/',
	'/orbit/',
	'/articles/',
	...articleSources.map(([slug]) => `/articles/${slug}/`),
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
			await expect(page.locator('footer .back-to-top')).toHaveClass(/floating/);
			await expect(page.getByText('방문 통계 안내', { exact: true })).toHaveCount(0);
			await expect(page.getByRole('button', { name: /이 브라우저의 통계 수집/ })).toHaveCount(0);
			assert.ok(
				await page.evaluate(
					() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
				)
			);
			await page.screenshot({
				path: `${folder}/${width}-${route === '/' ? 'home' : route.replaceAll('/', '')}.png`
			});
			if (route === '/') {
				await expect(page.locator('.stories-band .article-card')).toHaveCount(
					articleSources.length
				);
				await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
				await page.screenshot({ path: `${folder}/${width}-footer.png` });
			}
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
		await expect(page.locator('#question-4 + p')).toContainText('2,300km');
		await expect(page.locator('.sources-disclosure')).toContainText('약 18%');
		for (const speed of ['1,670', '107,000', '828,000']) {
			await expect(page.locator('.motion-speeds')).toContainText(speed);
		}
		await expect(page.locator('.motion-speeds .approx')).toHaveText([
			'시속 약',
			'시속 약',
			'시속 약'
		]);
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
		const playback = motionFigure.getByTestId('motion-playback');
		for (const frame of ['태양', '은하']) {
			await motionFigure.getByRole('button', { name: `${frame} 기준`, exact: true }).click();
			await playback.click();
			await expect(playback).toHaveAccessibleName(`${frame} 기준 일시 정지`);
			await expect
				.poll(async () => Number(await motionFigure.getAttribute('data-phase')))
				.toBeGreaterThan(0.02);
			await motionFigure.screenshot({ path: `${folder}/${width}-motion-${frame}-playing.png` });
			await playback.click();
			const pausedPhase = await motionFigure.getAttribute('data-phase');
			await expect(playback).toHaveAccessibleName(`${frame} 기준 재생하기`);
			await motionFigure.screenshot({ path: `${folder}/${width}-motion-${frame}-paused.png` });
			assert.equal(await motionFigure.getAttribute('data-phase'), pausedPhase);
			await playback.click();
			await expect
				.poll(async () => Number(await motionFigure.getAttribute('data-phase')))
				.toBeGreaterThan(Number(pausedPhase) + 0.01);
			await motionFigure.getByRole('slider').fill('1');
			await expect(motionFigure).toHaveAttribute('data-playing', 'false');
		}
		await expect(page.locator('.article-sources li')).toHaveCount(13);
		await expect(page.locator('canvas')).toHaveCount(0);
		for (const [slug, sourceCount] of articleSources) {
			await page.goto(`${origin}/articles/${slug}/`);
			await expect(page.locator('.article-header time')).toHaveCount(0);
			await expect(page.locator('article summary').filter({ hasText: '자료 및 출처' })).toHaveCount(
				1
			);
			await expect(page.locator('.section-sources, .explorer-invitation details')).toHaveCount(0);
			const sources = page.locator('.sources-disclosure');
			await expect(sources).not.toHaveAttribute('open');
			await expect(sources.locator('li')).toHaveCount(sourceCount);
			if (slug === 'why-earth-feels-still') {
				const drawing = await page.locator('.motion-frames .drawing').boundingBox();
				assert.ok(Math.abs(drawing.height / drawing.width - (310 / 640) * 1.7) < 0.01);
				await expect(page.locator('.motion-speeds .source-ref')).toHaveText(['[1]', '[2]', '[3]']);
				await page.getByRole('link', { name: '지구 자전 출처 1', exact: true }).click();
				await expect(sources).toHaveAttribute('open');
				await expect(page.locator('#source-motion-rotation')).toBeInViewport();
				await sources.locator('summary').click();
			}
			await page
				.locator('.explorer-invitation')
				.evaluate((element) =>
					window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 24)
				);
			await page.screenshot({ path: `${folder}/${width}-${slug}-reading-flow.png` });
		}
		await page.goto(`${origin}/articles/empty-space-in-atoms/`);
		await expect(page.locator('h1')).toHaveText('원자는 거의 빈 공간인데, 왜 책상은 단단할까?');
		const atomicDistance = page.locator('.atomic-distance');
		await expect(atomicDistance.locator('.scale-status')).toContainText('십자');
		await atomicDistance.getByRole('slider').fill('0.8');
		await expect(atomicDistance.locator('.nucleus-marker')).toHaveCount(0);
		await expect(atomicDistance.locator('.scale-status')).toContainText('서서히 눈에 보이기 시작');
		await atomicDistance.screenshot({ path: `${folder}/${width}-nucleus-emerging.png` });
		await atomicDistance.getByRole('button', { name: '핵 가까이', exact: true }).click();
		await expect(atomicDistance.locator('.scale-status')).toContainText('1cm 구슬 모형');
		assert.ok(
			Math.abs((await atomicDistance.locator('circle.nucleus').boundingBox()).width - 96 / 2.54) <
				0.1
		);
		await atomicDistance.screenshot({ path: `${folder}/${width}-nucleus-close.png` });
		await atomicDistance.getByRole('button', { name: '315m까지 보기', exact: true }).click();
		await expect(atomicDistance.locator('.scale-status')).toContainText('십자');
		const probability = page.locator('.atomic-probability');
		await expect(probability.locator('output')).toHaveText('약 315m');
		await expect(probability.locator('.probability-result')).toContainText('10.8%');
		await probability.getByRole('slider').fill('5');
		await expect(probability.locator('.probability-result')).toContainText('0.1%');
		await probability.screenshot({ path: `${folder}/${width}-electron-probability.png` });
		await page.goto(`${origin}/articles/earth-moon/`);
		const balls = page.locator('.earth-moon-balls');
		await balls.getByRole('button', { name: '1m', exact: true }).click();
		await expect(balls.getByRole('status')).toContainText('너무 가까워요');
		await balls.getByRole('button', { name: '약 7.2m', exact: true }).click();
		await expect(balls.getByRole('status')).toContainText('맞았어요');
		await expect(balls.locator('.solution')).toBeVisible();
		await balls.screenshot({ path: `${folder}/${width}-earth-moon-balls.png` });
		await page.goto(`${origin}/articles/atomic-scale/`);
		await expect(page.locator('.atom-ball-moon')).toContainText('3,800');
		await expect(page.locator('.atom-ball-moon [data-body="moon"]')).toBeVisible();
		await page
			.locator('.atom-ball-moon')
			.screenshot({ path: `${folder}/${width}-atom-ball-moon.png` });
		await page.goto(`${origin}/articles/why-sky-blue-sunset-red/`);
		await expect(page.locator('h1')).toHaveText('하늘은 왜 파랗고, 노을은 왜 붉을까?');
		const sky = page.getByTestId('sky-explorer');
		await expect(sky).toHaveAttribute('data-elevation', '70');
		const airShape = await sky.getByTestId('air-layer').getAttribute('d');
		await sky.getByRole('button', { name: '태양이 낮을 때' }).click();
		await expect(sky).toHaveAttribute('data-elevation', '5');
		assert.equal(await sky.getByTestId('air-layer').getAttribute('d'), airShape);
		await sky.getByRole('button', { name: '빛의 길 보기' }).click();
		await expect(sky).toHaveAttribute('data-emphasis', 'all');
		await sky.getByText('그림의 계산 방법', { exact: true }).click();
		await expect(sky.locator('.transmission-table')).toContainText('10.0%');
		await expect(sky.locator('.transmission-table')).toContainText('59.0%');
		await sky.screenshot({ path: `${folder}/${width}-sky-colors.png` });
		await page
			.locator('.sky-quiz')
			.getByRole('button', { name: /B 빛이/ })
			.click();
		await expect(page.locator('.sky-quiz [role="status"]')).toContainText('맞아요');
		await page.goto(`${origin}/articles/how-old-is-starlight/`);
		await expect(page.locator('h1')).toHaveText('우리가 보는 별빛은 얼마나 오래전의 빛일까?');
		const light = page.getByTestId('light-travel');
		await expect(page.locator('.light-table tbody tr')).toHaveCount(5);
		await expect(light).toHaveAttribute('data-progress', '0');
		for (const name of ['달', '태양', '프록시마 센타우리', '시리우스', '안드로메다은하']) {
			await light.getByRole('button', { name, exact: true }).click();
			await light.getByRole('button', { name: '빛의 길 따라가기' }).click();
			await expect(light).toHaveAttribute('data-progress', '1');
			await expect(light.getByTestId('light-arrival')).toContainText('전의 소식입니다');
		}
		await light.getByRole('button', { name: '시리우스', exact: true }).click();
		await page.emulateMedia({ reducedMotion: 'no-preference' });
		await light.getByRole('button', { name: '빛의 길 따라가기' }).click();
		await expect
			.poll(async () => Number(await light.getAttribute('data-progress')))
			.toBeGreaterThan(0.1);
		await light.getByRole('button', { name: '일시 정지' }).click();
		const lightPaused = await light.getAttribute('data-progress');
		await page.waitForTimeout(250);
		await expect(light).toHaveAttribute('data-progress', lightPaused);
		await light.getByRole('button', { name: '빛의 길 따라가기' }).click();
		await expect(light).toHaveAttribute('data-progress', '1');
		await light.screenshot({ path: `${folder}/${width}-starlight.png` });
		await page
			.locator('.starlight-quiz')
			.getByRole('button', { name: '10년 전', exact: true })
			.click();
		await expect(page.locator('.starlight-quiz [role="status"]')).toContainText('맞아요');
		await page.emulateMedia({ reducedMotion: 'reduce' });
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
		for (let chapter = 2; chapter <= 6; chapter++) {
			await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
			if (chapter < 4) continue;
			await expect(canvas).toHaveAttribute('data-transitioning', 'false');
			await page.screenshot({ path: `${folder}/${width}-chapter${chapter}.png` });
		}
		await expect(canvas).toHaveAttribute('data-preset', 'earth-journey');
		await expect(canvas).toHaveAttribute('data-earth-camera', 'original-close');
		await expect(canvas).toHaveAttribute('data-size-mode', 'physical');
		await expect(canvas).toHaveAttribute('data-earth-orbit', 'false');
		await expect(canvas).toHaveAttribute('data-orbits', '7');
		await expect(canvas).toHaveAttribute('data-trails', '8');
		await expect(canvas).toHaveAttribute('data-sun-trail', 'true');
		await expect(page.locator('.story h2')).toHaveText('지구는 꿈을 싣고');
		const finaleYear = Number(await canvas.getAttribute('data-year'));
		for (let sample = 0; sample < 3; sample++) {
			await page.waitForTimeout(700);
			await expect(canvas).toHaveAttribute('data-earth-orbit', 'false');
			assert.ok(Number(await canvas.getAttribute('data-trace-head-gap-au')) < 1e-10);
			await page.screenshot({ path: `${folder}/${width}-chapter6-${sample}.png` });
		}
		assert.ok(Number(await canvas.getAttribute('data-year')) > finaleYear);
		await page.getByRole('button', { name: '은하 궤적', exact: true }).click();
		await expect(canvas).toHaveAttribute('data-earth-orbit', 'true');
		await expect(canvas).toHaveAttribute('data-orbits', '8');
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
