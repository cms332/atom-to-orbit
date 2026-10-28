import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const route = '/articles/why-sky-blue-sunset-red/';

test('sky article: fixed air layer, independent colors, accessible responsive figures and metadata', async ({
	page,
	request
}, info) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(route);
	await expect(page.locator('h1')).toHaveText('하늘은 왜 파랗고, 노을은 왜 붉을까?');
	await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
		'href',
		`https://a2o.kr${route}`
	);
	await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
		'content',
		/하늘은 왜 파랗고/
	);
	await expect(page.locator('.article-header')).not.toContainText(/2026\.|분 읽기/);
	const schema = JSON.parse(
		(await page.locator('script[type="application/ld+json"]').textContent())!
	);
	expect(schema['@type']).toBe('Article');
	expect(schema.datePublished).toBe('2026-10-28');
	await expect(page.locator('.article-nav a')).toHaveCount(4);
	await expect(page.locator('.sources-disclosure li')).toHaveCount(9);
	await expect(page.locator('.sources-disclosure')).not.toHaveAttribute('open', '');
	const panel = page.getByTestId('sky-explorer');
	await expect(panel).toHaveAttribute('data-elevation', '70');
	await expect(panel).toHaveAttribute('data-emphasis', '');
	const air = await panel.getByTestId('air-layer').getAttribute('d');
	const high = await panel.locator('[data-band]').evaluateAll((lines) =>
		lines.map((line) => ({
			color: line.getAttribute('stroke'),
			t: Number(line.getAttribute('data-transmission'))
		}))
	);
	await panel.getByRole('button', { name: '태양이 낮을 때' }).click();
	await expect(panel).toHaveAttribute('data-elevation', '5');
	await expect(panel.getByRole('button', { name: '태양이 낮을 때' })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	expect(await panel.getByTestId('air-layer').getAttribute('d')).toBe(air);
	const low = await panel.locator('[data-band]').evaluateAll((lines) =>
		lines.map((line) => ({
			color: line.getAttribute('stroke'),
			t: Number(line.getAttribute('data-transmission'))
		}))
	);
	low.forEach((band, i) => {
		expect(band.color).toBe(high[i].color);
		expect(band.t).toBeGreaterThan(0);
		expect(band.t).toBeLessThan(high[i].t);
	});
	await expect(panel.locator('.explanation')).toContainText('빨강·주황');
	for (const width of info.project.name === 'desktop' ? [1440, 768, 390, 320] : [390, 320]) {
		await page.setViewportSize({ width, height: 1000 });
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		await panel.screenshot({ path: `artifacts/sky-colors/${info.project.name}-${width}-low.png` });
	}
	await panel.getByText('그림의 계산 방법', { exact: true }).click();
	await expect(panel.locator('.transmission-table tbody tr')).toHaveCount(3);
	await expect(panel.locator('.transmission-table')).toContainText('10.0%');
	await expect(panel.locator('.transmission-table')).toContainText('59.0%');
	await panel.screenshot({ path: `artifacts/sky-colors/${info.project.name}-model.png` });
	expect(
		(await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
			.violations
	).toEqual([]);
	await panel.locator('a[href="#source-sky-airmass"]').click();
	await expect(page.locator('.sources-disclosure')).toHaveAttribute('open', '');
	await page.screenshot({
		path: `artifacts/sky-colors/${info.project.name}-article.png`,
		fullPage: true
	});
	expect(await (await request.get('/sitemap.xml')).text()).toContain(`https://a2o.kr${route}`);
	await page.goto('/articles/?topic=cosmos');
	await expect(page.locator(`.article-card a[href="${route}"]`)).toBeVisible();
	expect(errors).toEqual([]);
});

test('keyboard, one-shot emphasis, reset and cancellation do not accumulate playback', async ({
	page
}) => {
	await page.clock.install();
	await page.goto(route);
	const panel = page.getByTestId('sky-explorer');
	await panel.scrollIntoViewIfNeeded();
	await page.clock.pauseAt(new Date(Date.now() + 1000));
	const slider = panel.getByRole('slider', { name: '태양의 높이' });
	await slider.focus();
	await slider.press('Home');
	await expect(slider).toHaveValue('5');
	await slider.press('ArrowRight');
	await expect(slider).toHaveValue('6');
	await slider.press('End');
	await expect(slider).toHaveValue('80');
	await panel.getByRole('button', { name: '빛의 길 보기' }).click();
	await expect(panel).toHaveAttribute('data-emphasis', 'direct');
	await page.clock.runFor(1100);
	await expect(panel).toHaveAttribute('data-emphasis', 'scattered');
	await page.clock.runFor(1100);
	await expect(panel).toHaveAttribute('data-emphasis', '');
	await page.clock.runFor(5000);
	await expect(panel).toHaveAttribute('data-emphasis', '');
	await panel.getByRole('button', { name: '빛의 길 보기' }).click();
	await panel.getByRole('button', { name: '태양이 낮을 때' }).click();
	await page.clock.runFor(3000);
	await expect(panel).toHaveAttribute('data-emphasis', '');
	await panel.getByRole('button', { name: '처음으로' }).click();
	await expect(slider).toHaveValue('70');
	await panel.getByRole('button', { name: '빛의 길 보기' }).click();
	await page.evaluate(() => {
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
		document.dispatchEvent(new Event('visibilitychange'));
	});
	await page.clock.runFor(3000);
	await expect(panel).toHaveAttribute('data-emphasis', '');
	await page.evaluate(() => {
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
		document.dispatchEvent(new Event('visibilitychange'));
	});
	await panel.getByRole('button', { name: '빛의 길 보기' }).click();
	await page.locator('h1').scrollIntoViewIfNeeded();
	await page.clock.runFor(1500);
	await expect(panel).toHaveAttribute('data-emphasis', '');
	await panel.getByRole('button', { name: '빛의 길 보기' }).click();
	await page.locator('.next a[href="/articles/how-old-is-starlight/"]').click();
	await page.clock.runFor(500);
	await expect(page.getByTestId('sky-explorer')).toHaveCount(0);
	await page.goto(route);
	await expect(page.getByTestId('sky-explorer')).toHaveAttribute('data-emphasis', '');
});

test('reduced motion, quiz feedback and 200 percent text keep all information usable', async ({
	page
}, info) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto(route);
	const panel = page.getByTestId('sky-explorer');
	await panel.getByRole('button', { name: '빛의 길 보기' }).click();
	await expect(panel).toHaveAttribute('data-emphasis', 'all');
	await expect(panel).toContainText('움직임 없이');
	const quiz = page.locator('.sky-quiz');
	await quiz.getByRole('button', { name: /A 태양이/ }).click();
	await expect(quiz.getByRole('status')).toContainText('다시 생각');
	await quiz.getByRole('button', { name: /B 빛이/ }).focus();
	await page.keyboard.press('Enter');
	await expect(quiz.getByRole('status')).toContainText('맞아요');
	await quiz.screenshot({ path: `artifacts/sky-colors/${info.project.name}-quiz.png` });
	await quiz.getByRole('button', { name: '다시 생각하기' }).click();
	await expect(quiz.getByRole('status')).toHaveText('');
	await expect(quiz.getByRole('button', { name: '다시 생각하기' })).toBeFocused();
	await page.setViewportSize({ width: 320, height: 1000 });
	await page.evaluate(() => {
		const sizes = Array.from(document.querySelectorAll<HTMLElement>('article *'))
			.filter((node) => !node.closest('svg'))
			.map((node) => [node, getComputedStyle(node).fontSize] as const);
		for (const [node, size] of sizes) node.style.fontSize = `${parseFloat(size) * 2}px`;
	});
	expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
	await panel.screenshot({ path: `artifacts/sky-colors/${info.project.name}-text200.png` });
});

test('no JavaScript retains both sky states, comparisons, sources and a readable answer', async ({
	browser
}) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: { width: 390, height: 844 }
	});
	const page = await context.newPage();
	await page.goto(route);
	await expect(page.getByTestId('sky-landscape')).toHaveCount(2);
	await expect(page.getByTestId('sky-rays')).toHaveCount(2);
	await expect(page.getByTestId('sky-explorer').getByRole('button')).toHaveCount(0);
	await expect(page.getByRole('slider')).toHaveCount(0);
	await expect(page.locator('.sky-comparison')).toContainText('빨강·주황');
	await page.getByText('정답 살펴보기', { exact: true }).click();
	await expect(page.locator('.sky-quiz')).toContainText('정답은 B');
	await page.getByText('자료 및 출처', { exact: true }).click();
	await expect(page.locator('#source-sky-nasa a')).toBeVisible();
	await context.close();
});
