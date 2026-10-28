import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { lightTargets, lightElapsedLabel } from '../src/lib/data/starlight';

const route = '/articles/how-old-is-starlight/';

test('starlight story, source-linked figures and metadata remain readable at every width', async ({
	page,
	request
}, info) => {
	const errors: string[] = [];
	const missing: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	page.on('response', (response) => {
		if (response.status() >= 400) missing.push(response.url());
	});
	await page.goto(route);
	await expect(page.locator('h1')).toHaveText('우리가 보는 별빛은 얼마나 오래전의 빛일까?');
	await expect(page.locator('.article-header')).not.toContainText(/분 읽기|2026\./);
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		`https://a2o.kr${route}`
	);
	await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /별빛/);
	await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
		'content',
		/^https:\/\/a2o.kr\//
	);
	const schema = JSON.parse(
		(await page.locator('script[type="application/ld+json"]').textContent())!
	);
	expect(schema['@type']).toBe('Article');
	expect(schema.datePublished).toBe('2026-10-28');
	await expect(page.locator('.article-nav a')).toHaveCount(5);
	await expect(page.locator('article')).toContainText('한 살쯤이었을 때');
	await expect(page.locator('article')).toContainText('태양에서 달까지 온 시간은 따로');
	await expect(page.locator('article')).toContainText('태양 표면 부근');
	await expect(page.locator('.light-table tbody tr')).toHaveCount(5);
	const panel = page.getByTestId('light-travel');
	await expect(panel).toHaveAttribute('data-progress', '0');
	await expect(panel).toHaveAttribute('data-playing', 'false');
	await expect(panel).toContainText('모든 장면을 3초로 재생한 설명용 그림');
	await expect(panel).toContainText('실제 거리·시간 비례가 아닙니다');
	for (const target of lightTargets) {
		await panel.getByRole('button', { name: target.name, exact: true }).click();
		await expect(panel).toHaveAttribute('data-target', target.id);
		await expect(panel.locator('h4')).toHaveText(target.name);
		await expect(panel.locator('.kind')).toHaveText(target.kind);
		await expect(panel.locator('.travel-time strong')).toHaveText(target.timeLabel);
		await expect(panel.locator('.target-note')).toHaveText(target.note);
		const row = page.locator('.light-table tbody tr').filter({ hasText: target.name });
		await expect(row).toContainText(target.distanceLabel);
		await expect(row).toContainText(target.timeLabel);
		for (const id of target.sourceIds)
			await expect(page.locator(`#source-${id} a`)).toHaveAttribute('href', /^https:\/\//);
	}
	await panel.getByRole('button', { name: '시리우스', exact: true }).click();
	for (const width of info.project.name === 'desktop' ? [1440, 390, 320] : [390, 320]) {
		await page.setViewportSize({ width, height: 1000 });
		await page.evaluate(() => document.fonts.ready);
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		await panel.screenshot({
			path: `artifacts/starlight/${info.project.name}-${width}-explorer.png`
		});
	}
	expect(
		(await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
			.violations
	).toEqual([]);
	await page.screenshot({
		path: `artifacts/starlight/${info.project.name}-article.png`,
		fullPage: true
	});
	await expect(page.locator('.next a[href="/articles/earth-moon/"]')).toBeVisible();
	await expect(page.locator('.next a[href="/articles/why-earth-feels-still/"]')).toBeVisible();
	expect(await (await request.get('/sitemap.xml')).text()).toContain(`https://a2o.kr${route}`);
	await page.goto('/articles/?topic=cosmos');
	await expect(page.locator(`.article-card a[href="${route}"]`)).toBeVisible();
	expect(errors).toEqual([]);
	expect(missing).toEqual([]);
});

test('three-second linear playback pauses, resumes, resets and cancels safely', async ({
	page
}) => {
	await page.clock.install();
	await page.goto(route);
	const panel = page.getByTestId('light-travel');
	await panel.scrollIntoViewIfNeeded();
	await page.clock.pauseAt(new Date(Date.now() + 1000));
	const play = panel.getByRole('button', { name: '빛의 길 따라가기' });
	const slider = panel.getByRole('slider');
	for (const target of lightTargets) {
		await panel.getByRole('button', { name: target.name, exact: true }).click();
		await expect(panel).toHaveAttribute('data-progress', '0');
		await play.click();
		await page.clock.runFor(1500);
		const halfway = Number(await panel.getAttribute('data-progress'));
		expect(halfway).toBeCloseTo(0.5, 1);
		await expect(panel.getByTestId('light-elapsed')).toHaveText(lightElapsedLabel(target, halfway));
		await panel.getByRole('button', { name: '일시 정지' }).click();
		await page.clock.runFor(700);
		expect(Number(await panel.getAttribute('data-progress'))).toBe(halfway);
		await play.click();
		await page.clock.runFor(1600);
		await expect(panel).toHaveAttribute('data-progress', '1');
		await expect(panel).toHaveAttribute('data-playing', 'false');
		await expect(panel.getByTestId('light-arrival')).toHaveText(
			`지금 도착한 빛은 ${target.timeLabel} 전의 소식입니다.`
		);
	}
	await panel.getByRole('button', { name: '처음부터' }).click();
	await play.click();
	await page.clock.runFor(500);
	await panel.getByRole('button', { name: '달', exact: true }).click();
	await page.clock.runFor(4000);
	await expect(panel).toHaveAttribute('data-progress', '0');
	await slider.focus();
	await slider.press('End');
	await expect(panel).toHaveAttribute('data-progress', '1');
	await slider.press('Home');
	await slider.press('ArrowRight');
	await expect(panel).toHaveAttribute('data-progress', '0.01');
	await expect(panel).toHaveAttribute('data-playing', 'false');
	await play.click();
	await page.clock.runFor(500);
	await page.evaluate(() => {
		Object.defineProperty(document, 'hidden', { configurable: true, value: true });
		document.dispatchEvent(new Event('visibilitychange'));
	});
	const paused = await panel.getAttribute('data-progress');
	await page.clock.runFor(4000);
	await expect(panel).toHaveAttribute('data-progress', paused!);
	await expect(panel).toHaveAttribute('data-playing', 'false');
	await page.evaluate(() => {
		Object.defineProperty(document, 'hidden', { configurable: true, value: false });
	});
	await play.click();
	await page.locator('.next a[href="/articles/earth-moon/"]').click();
	await page.clock.runFor(4000);
	await expect(panel).toHaveCount(0);
	await page.locator(`.next a[href="${route}"]`).click();
	await page.clock.runFor(100);
	await expect(panel).toHaveAttribute('data-progress', '0');
});

test('reduced motion and the quiz work with keyboard without moving focus', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(route);
	const panel = page.getByTestId('light-travel');
	const play = panel.getByRole('button', { name: '빛의 길 따라가기' });
	await play.focus();
	await play.press('Enter');
	await expect(panel).toHaveAttribute('data-progress', '1');
	await expect(panel).toHaveAttribute('data-playing', 'false');
	await expect(panel.getByRole('status')).toContainText('동작 줄이기 설정');
	await expect(play).toBeFocused();
	await panel.getByRole('slider').focus();
	await panel.getByRole('slider').press('Home');
	await expect(panel).toHaveAttribute('data-progress', '0');
	const quiz = page.locator('.starlight-quiz');
	await expect(quiz.getByRole('status')).toBeEmpty();
	await quiz.getByRole('button', { name: '10일 전', exact: true }).click();
	await expect(quiz.getByRole('status')).toContainText('다시 생각');
	const right = quiz.getByRole('button', { name: '10년 전', exact: true });
	await right.focus();
	await right.press('Space');
	await expect(right).toBeFocused();
	await expect(quiz.getByRole('status')).toContainText('맞아요');
});

test('article, all five values, quiz answer and sources remain available without JavaScript', async ({
	browser
}) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 320, height: 900 }
	});
	const page = await context.newPage();
	await page.goto(`http://127.0.0.1:4173${route}`);
	await expect(page.locator('h1')).toBeVisible();
	await expect(page.locator('.light-table tbody tr')).toHaveCount(5);
	await expect(page.getByTestId('light-travel').getByRole('slider')).toBeDisabled();
	await page.getByText('정답 살펴보기', { exact: true }).click();
	await expect(page.locator('.starlight-quiz details')).toContainText('10년 전입니다');
	await page.locator('.sources-disclosure summary').click();
	await expect(page.locator('.sources-disclosure li')).toHaveCount(11);
	await expect(page.locator('.sources-disclosure li').first()).toBeVisible();
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	await context.close();
});
