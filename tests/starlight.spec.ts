import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
	lightTargets,
	lightElapsedLabel,
	lightElapsedReading,
	lightArrivalLabel
} from '../src/lib/data/starlight';

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
	await expect(page.locator('article')).toContainText('빛이 눈에 들어오기 때문');
	await expect(page.locator('article')).toContainText('열 번째 생일');
	await expect(page.locator('article')).toContainText('한 살 조금 넘었을 때');
	await expect(page.locator('article')).toContainText('약 8년 7개월');
	await expect(page.locator('article')).toContainText('이것을 빛의 반사');
	await expect(page.locator('article')).toContainText('연필의 길이는 센티미터');
	await expect(page.locator('article')).toContainText('지금 모습이 아니라, 약 250만 년 전의 모습');
	await expect(page.locator('article')).toContainText('태양의 표면 부근');
	await expect(page.locator('.light-table tbody tr')).toHaveCount(5);
	const panel = page.getByTestId('light-travel');
	await expect(panel).toHaveAttribute('data-progress', '0');
	await expect(panel).toHaveAttribute('data-playing', 'false');
	await expect(panel).toContainText('애니메이션은 모든 장면을 10초로 보여줍니다');
	await expect(panel.getByRole('button', { name: '도착 모습만 보기' })).toHaveCount(0);
	await expect(panel).toContainText('실제 거리와 시간 비율은 다릅니다');
	await expect(panel.getByTestId('light-elapsed')).not.toBeVisible();
	await expect(panel.locator('.endpoints')).toContainText('달에서 빛이 반사됨');
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
			path: `artifacts/starlight-revision/${info.project.name}-${width}-explorer.png`
		});
	}
	expect(
		(await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
			.violations
	).toEqual([]);
	await page.screenshot({
		path: `artifacts/starlight-revision/${info.project.name}-article.png`,
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

test('ten-second linear playback pauses, resumes, resets and cancels safely', async ({ page }) => {
	test.setTimeout(60_000);
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
		await expect(panel.getByRole('timer')).toContainText(lightElapsedReading(target, 0));
		await play.click();
		await page.clock.runFor(5000);
		const halfway = Number(await panel.getAttribute('data-progress'));
		expect(halfway).toBeCloseTo(0.5, 1);
		await expect(panel.getByTestId('light-elapsed')).toHaveText(lightElapsedLabel(target, halfway));
		const shownProgress = Number(await panel.getByRole('timer').getAttribute('data-progress'));
		expect(halfway - shownProgress).toBeGreaterThanOrEqual(0);
		expect(halfway - shownProgress).toBeLessThan(0.012);
		await expect(panel.getByRole('timer')).toContainText(
			lightElapsedReading(target, shownProgress)
		);
		const marker = await panel.getByTestId('light-marker').boundingBox();
		const tracker = await panel.getByRole('timer').boundingBox();
		expect(
			Math.abs(tracker!.x + tracker!.width / 2 - (marker!.x + marker!.width / 2))
		).toBeLessThan(2);
		expect(tracker!.y).toBeGreaterThan(marker!.y + marker!.height);
		await panel.getByRole('button', { name: '일시 정지' }).click();
		await page.clock.runFor(700);
		expect(Number(await panel.getAttribute('data-progress'))).toBe(halfway);
		await expect(panel.getByRole('timer')).toContainText(lightElapsedReading(target, halfway));
		await play.click();
		await page.clock.runFor(5100);
		await expect(panel).toHaveAttribute('data-progress', '1');
		await expect(panel).toHaveAttribute('data-playing', 'false');
		await expect(panel.getByTestId('light-arrival')).toHaveText(lightArrivalLabel(target));
		await expect(panel.getByRole('timer')).toContainText(lightElapsedReading(target, 1));
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

test('reduced motion offers explicit animation opt-in and manual scrubbing', async ({
	page
}, info) => {
	await page.clock.install();
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(route);
	const panel = page.getByTestId('light-travel');
	await panel.scrollIntoViewIfNeeded();
	await page.clock.pauseAt(new Date(Date.now() + 1000));
	await expect(panel).toHaveAttribute('data-motion', 'reduced');
	await expect(panel).toHaveAttribute('data-progress', '0');
	await expect(panel).toContainText('기기의 ‘움직임 줄이기’ 설정');
	const play = panel.getByTestId('light-play');
	await expect(play).toHaveText(/애니메이션 켜고 따라가기/);
	await expect(panel.getByRole('button', { name: '도착 모습만 보기' })).toHaveCount(0);
	await panel.getByRole('slider').press('End');
	await expect(panel).toHaveAttribute('data-progress', '1');
	await expect(panel).toHaveAttribute('data-playing', 'false');
	await panel.getByRole('button', { name: '처음부터' }).click();
	await page.clock.runFor(4000);
	await expect(panel).toHaveAttribute('data-progress', '0');
	await play.focus();
	await play.press('Enter');
	await page.clock.runFor(5000);
	const halfway = Number(await panel.getAttribute('data-progress'));
	expect(halfway).toBeCloseTo(0.5, 1);
	await expect(panel).toHaveAttribute('data-playing', 'true');
	await expect(panel).toHaveAttribute('data-motion', 'animated');
	await expect(play).toBeFocused();
	await play.press('Enter');
	await page.clock.runFor(1000);
	expect(Number(await panel.getAttribute('data-progress'))).toBe(halfway);
	await panel.screenshot({
		path: `artifacts/starlight-revision/${info.project.name}-reduced-opt-in-halfway.png`
	});
	await play.press('Enter');
	await page.clock.runFor(5100);
	await expect(panel).toHaveAttribute('data-progress', '1');
	await expect(panel).toHaveAttribute('data-playing', 'false');
	await expect(panel.getByTestId('light-arrival')).toContainText('달에서 반사되어');
	await expect(play).toBeFocused();
	await expect(play).toHaveText(/빛의 길 따라가기/);
	await play.click();
	await page.clock.runFor(500);
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.clock.runFor(100);
	await expect(panel).toHaveAttribute('data-playing', 'false');
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.clock.runFor(100);
	await expect(play).toHaveText(/애니메이션 켜고 따라가기/);
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
	// Axe needs live browser timers; deterministic playback assertions above use a paused clock.
	await page.clock.resume();
	expect(
		(await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
			.violations
	).toEqual([]);
});

test('larger text preserves the reduced-motion choice and science/model distinction', async ({
	page
}, info) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.setViewportSize({ width: 320, height: 1000 });
	await page.goto(route);
	const panel = page.getByTestId('light-travel');
	await panel.getByRole('button', { name: '태양', exact: true }).click();
	await panel.getByRole('slider').press('End');
	await expect(panel.locator('.travel-time')).toContainText('약 8분 20초');
	await expect(panel.getByTestId('light-arrival')).toContainText('약 8분 20초');
	await expect(panel.getByTestId('light-elapsed')).not.toBeVisible();
	await panel.locator('.model-notes summary').click();
	await expect(panel.getByTestId('light-elapsed')).toHaveText('8분 19초');
	await expect(panel.getByRole('timer')).toContainText('약 8분 20초');
	await page.evaluate(() => {
		const sizes = Array.from(document.querySelectorAll<HTMLElement>('article *'))
			.filter((node) => !node.closest('svg'))
			.map((node) => [node, getComputedStyle(node).fontSize] as const);
		for (const [node, size] of sizes) node.style.fontSize = `${parseFloat(size) * 2}px`;
	});
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	const tracker = await panel.getByRole('timer').boundingBox();
	expect(tracker!.x).toBeGreaterThanOrEqual(0);
	expect(tracker!.x + tracker!.width).toBeLessThanOrEqual(320);
	await panel.screenshot({ path: `artifacts/starlight-revision/${info.project.name}-text200.png` });
});

test('elapsed time follows scrubbing and stays readable at both ends on narrow screens', async ({
	page
}, info) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(route);
	const panel = page.getByTestId('light-travel');
	const timer = panel.getByRole('timer');
	const scrubTo = (progress: number) =>
		panel.getByRole('slider').evaluate((element, value) => {
			const input = element as HTMLInputElement;
			input.value = String(value);
			input.dispatchEvent(new Event('input', { bubbles: true }));
		}, progress * 100);
	await expect(timer).toHaveAttribute('aria-live', 'off');
	for (const width of [1440, 390, 320]) {
		await page.setViewportSize({ width, height: 950 });
		for (const target of [lightTargets[1], lightTargets[3], lightTargets[4]]) {
			await panel.getByRole('button', { name: target.name, exact: true }).click();
			const centers: number[] = [];
			for (const progress of [0, 0.25, 0.5, 0.75, 1]) {
				await scrubTo(progress);
				await expect(timer).toContainText(lightElapsedReading(target, progress));
				const bounds = await timer.boundingBox();
				const path = await panel.locator('.light-path').boundingBox();
				const arrival = await panel.getByTestId('light-arrival').boundingBox();
				expect(bounds!.x).toBeGreaterThanOrEqual(path!.x - 1);
				expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(path!.x + path!.width + 1);
				expect(bounds!.y + bounds!.height).toBeLessThan(arrival!.y);
				centers.push(bounds!.x + bounds!.width / 2);
			}
			expect(centers[0]).toBeLessThan(centers[1]);
			expect(centers[1]).toBeLessThan(centers[2]);
			expect(centers[2]).toBeLessThan(centers[3]);
			expect(centers[3]).toBeLessThan(centers[4]);
		}
		await panel.getByRole('button', { name: '시리우스', exact: true }).click();
		await scrubTo(0.5);
		await panel.screenshot({
			path: `artifacts/starlight-elapsed/${info.project.name}-${width}-halfway.png`
		});
	}
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

test('moving digits remain present with fixed width and a readable refresh cadence', async ({
	page
}, info) => {
	await page.clock.install();
	await page.goto(route);
	const panel = page.getByTestId('light-travel');
	await panel.getByRole('button', { name: '안드로메다은하', exact: true }).click();
	await panel.scrollIntoViewIfNeeded();
	await page.clock.pauseAt(new Date(Date.now() + 1000));
	await panel.getByTestId('light-play').click();
	const frames: {
		value: string;
		width: number;
		unitOffset: number;
		progress: number;
		shown: number;
	}[] = [];
	for (let frame = 0; frame < 190; frame++) {
		await page.clock.runFor(16);
		frames.push(
			await panel.evaluate((element) => {
				const timer = element.querySelector<HTMLElement>('[role="timer"]')!;
				const value = timer.querySelector<HTMLElement>('.elapsed-value')!;
				const unit = timer.querySelector<HTMLElement>('.elapsed-unit')!;
				return {
					value: value.textContent!,
					width: value.getBoundingClientRect().width,
					unitOffset: unit.getBoundingClientRect().x - timer.getBoundingClientRect().x,
					progress: Number((element as HTMLElement).dataset.progress),
					shown: Number(timer.dataset.progress)
				};
			})
		);
	}
	for (const frame of frames) {
		expect(frame.value).toMatch(/^\d+\.\d$/);
		expect(frame.width).toBe(frames[0].width);
		expect(frame.unitOffset).toBeCloseTo(frames[0].unitOffset, 1);
		expect(frame.progress - frame.shown).toBeGreaterThanOrEqual(0);
		expect(frame.progress - frame.shown).toBeLessThan(0.012);
	}
	const changes = frames.filter(
		(frame, index) => index > 0 && frame.value !== frames[index - 1].value
	).length;
	expect(changes).toBeGreaterThanOrEqual(25);
	expect(changes).toBeLessThanOrEqual(31);
	await page.clock.runFor(6860);
	expect(Number(await panel.getAttribute('data-progress'))).toBeCloseTo(0.99, 2);
	await expect(panel).toHaveAttribute('data-playing', 'true');
	await page.clock.runFor(150);
	await expect(panel.getByRole('timer')).toContainText('약 250.0만 년');
	await panel.screenshot({ path: `artifacts/starlight-flicker/${info.project.name}-arrival.png` });
	await panel.getByTestId('light-play').click();
	await page.clock.runFor(955);
	await panel.getByTestId('light-play').click();
	const paused = Number(await panel.getAttribute('data-progress'));
	await expect(panel.getByRole('timer')).toHaveAttribute('data-progress', String(paused));
	await expect(panel.getByRole('timer')).toContainText(
		lightElapsedReading(lightTargets[4], paused)
	);
	await panel.screenshot({ path: `artifacts/starlight-flicker/${info.project.name}-paused.png` });
});
