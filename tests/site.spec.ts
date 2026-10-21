import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { objects } from '../src/lib/data/science';
import { MAX_EXPONENT } from '../src/lib/utils/scales';
import { SCENE_HEADROOM } from '../src/lib/utils/scale-scene';

test('shared scene zooms continuously and preserves source ratios', async ({ page }, testInfo) => {
	for (const route of ['/', '/scale/']) {
		await page.goto(route);
		const scene = page.getByTestId('scale-scene');
		const slider = page.getByRole('slider');
		async function zoom(exponent: number) {
			await slider.evaluate((element, value) => {
				const input = element as HTMLInputElement;
				input.value = String(value);
				input.dispatchEvent(new Event('input', { bubbles: true }));
			}, exponent);
			await expect(slider).toHaveValue(String(exponent));
		}
		await zoom(-1.4);
		const ball = scene.locator('[data-object="ball"]');
		const before = Number(await ball.getAttribute('data-length'));
		const beforeWidth = (await ball.locator('svg').boundingBox())!.width;
		await zoom(-0.4);
		await expect
			.poll(async () => Number(await ball.getAttribute('data-length')))
			.toBeCloseTo(before / 10, 8);
		expect(
			Math.abs(beforeWidth / 10 - (await ball.locator('svg').boundingBox())!.width)
		).toBeLessThan(0.01);
		const table = scene.locator('[data-object="table"]');
		expect(
			Number(await table.getAttribute('data-length')) /
				Number(await ball.getAttribute('data-length'))
		).toBeCloseTo(2.74 / 0.04, 10);
		await zoom(-0.49);
		const crossing = Number(await ball.getAttribute('data-length'));
		await zoom(-0.47);
		expect(crossing / Number(await ball.getAttribute('data-length'))).toBeCloseTo(10 ** 0.02, 8);
		if (route === '/') {
			for (const [value, name] of [
				[-10, 'atom'],
				[-9, 'atom-shrinking'],
				[-2.4, 'ball-entering'],
				[-1.4, 'ball'],
				[-0.4, 'ball-shrinking'],
				[0.44, 'table'],
				[7.1, 'earth']
			] as const) {
				await zoom(value);
				await page
					.getByRole('region', { name: '로그 스케일 탐험기' })
					.screenshot({ path: `artifacts/scale-zoom/${testInfo.project.name}-${name}.png` });
			}
		}
	}
});

test('homepage explorer keeps the atom reference height while changing objects', async ({
	page
}, testInfo) => {
	await page.goto('/');
	await page.evaluate(() => document.fonts.ready);
	const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
	const slider = panel.getByRole('slider');
	const widths =
		testInfo.project.name === 'desktop' ? [1440, 1024, 768, 649, 390, 320] : [390, 320];
	for (const width of widths) {
		await page.setViewportSize({ width, height: 1000 });
		await slider.evaluate((element) => {
			const input = element as HTMLInputElement;
			input.value = '-10';
			input.dispatchEvent(new Event('input', { bubbles: true }));
		});
		await expect(
			panel.getByRole('heading', { name: objects[0].nameKo, exact: true })
		).toBeVisible();
		const referencePanel = (await panel.boundingBox())!;
		const referenceSlider = (await slider.boundingBox())!;
		const referenceScroll = await page.evaluate(() => window.scrollY);
		for (const object of objects) {
			await slider.evaluate((element, value) => {
				const input = element as HTMLInputElement;
				input.value = String(value);
				input.dispatchEvent(new Event('input', { bubbles: true }));
			}, Math.log10(object.meters));
			await expect(panel.getByRole('heading', { name: object.nameKo, exact: true })).toBeVisible();
			const title = await panel
				.getByRole('heading', { name: object.nameKo, exact: true })
				.evaluate((heading) => ({
					height: heading.getBoundingClientRect().height,
					lineHeight: parseFloat(getComputedStyle(heading).lineHeight)
				}));
			expect(
				Math.abs(title.height - title.lineHeight),
				`${object.id} single-line title at ${width}px`
			).toBeLessThan(1);
			const currentPanel = (await panel.boundingBox())!;
			const currentSlider = (await slider.boundingBox())!;
			const currentScroll = await page.evaluate(() => window.scrollY);
			expect(
				Math.abs(currentPanel.height - referencePanel.height),
				`${object.id} panel at ${width}px`
			).toBeLessThan(0.5);
			expect(
				Math.abs(currentPanel.y + currentScroll - referencePanel.y - referenceScroll),
				`${object.id} panel top at ${width}px`
			).toBeLessThan(0.5);
			expect(
				Math.abs(currentSlider.y - currentPanel.y - (referenceSlider.y - referencePanel.y)),
				`${object.id} slider at ${width}px`
			).toBeLessThan(0.5);
			if (
				width === (testInfo.project.name === 'desktop' ? 1440 : 390) &&
				['atom', 'ball'].includes(object.id)
			)
				await panel.screenshot({
					path: `artifacts/stable-explorer/${testInfo.project.name}-${object.id}.png`
				});
		}
	}
});

test('homepage, navigation, slider keyboard and exact object selection', async ({
	page,
	isMobile
}) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('모든 크기에는');
	await page.locator('.hero-actions').getByRole('link', { name: '크기 탐험하기' }).click();
	await expect(page).toHaveURL(/\/scale\//);
	if (isMobile) await page.getByLabel('탐험할 대상').selectOption('ball');
	else await page.getByRole('button', { name: /탁구공/ }).click();
	await expect(page.getByTestId('selected-value')).toHaveText('4 × 10⁻² m');
	const slider = page.getByRole('slider', { name: '로그 눈금 탐색' });
	await slider.focus();
	const before = Number(await slider.inputValue());
	await slider.press('ArrowRight');
	expect(Number(await slider.inputValue())).toBeGreaterThan(before);
	await slider.press('Home');
	await expect(page.getByTestId('selected-value')).toHaveText('1.06 × 10⁻¹⁰ m');
	await slider.press('End');
	await expect(page.getByTestId('selected-value')).toHaveText('1.39 × 10⁹ m');
	await expect(page.getByRole('table')).toBeVisible();
	expect(errors).toEqual([]);
});

test('articles filter, real article, primary source and related explorer', async ({
	page
}, testInfo) => {
	await page.goto('/articles/');
	await page
		.getByRole('navigation', { name: '이야기 주제 필터' })
		.getByRole('link', { name: '미시 세계', exact: true })
		.click();
	await expect(page.locator('.article-card')).toHaveCount(1);
	await expect(
		page.getByRole('heading', { level: 2, name: '원자의 크기는 어떻게 읽을까?' })
	).toBeVisible();
	await expect(
		page.getByRole('link', { name: '원자의 크기는 어떻게 읽을까?', exact: true })
	).toHaveCount(1);
	await page.locator('.article-card a').click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('원자의 크기는 어떻게 읽을까?');
	await page.evaluate(() => document.fonts.ready);
	await page.locator('.article-header').screenshot({
		path: `artifacts/no-article-dates/${testInfo.project.name}-atomic-header.png`
	});
	await expect(page.locator('.article-sources a').first()).toHaveAttribute(
		'href',
		/physics\.nist\.gov/
	);
	await page.getByRole('link', { name: '크기 탐험으로' }).click();
	await expect(page.getByTestId('selected-value')).toHaveText('1.06 × 10⁻¹⁰ m');
});

test('all internal links resolve, accessible error and metadata', async ({ page, request }) => {
	const routes = [
		'/',
		'/scale/',
		'/articles/',
		'/articles/earth-moon/',
		'/articles/atomic-scale/',
		'/404/'
	];
	const hrefs = new Set<string>();
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	for (const route of routes) {
		await page.goto(route);
		await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
		await expect(
			page.locator('a[href^="/method"], a[href^="/updates"], a[href^="/about"]')
		).toHaveCount(0);
		await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/);
		for (const href of await page
			.locator('a[href^="/"]')
			.evaluateAll((links) =>
				links.map((link) => (link as HTMLAnchorElement).getAttribute('href')!)
			))
			hrefs.add(href);
		for (const href of await page
			.locator('a[href^="#"]')
			.evaluateAll((links) => links.map((link) => link.getAttribute('href')!))) {
			expect(href.length, `Empty fragment on ${route}`).toBeGreaterThan(1);
			expect(
				await page.evaluate(
					(hash) => !!document.getElementById(decodeURIComponent(hash.slice(1))),
					href
				),
				`${route}${href}`
			).toBe(true);
		}
		for (const image of await page.locator('img').all()) {
			expect(
				await image.evaluate(
					(img) => img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0
				),
				`${route} image`
			).toBe(true);
		}
	}
	for (const href of hrefs) expect((await request.get(href)).status(), href).toBe(200);
	const sitemap = await (await request.get('/sitemap.xml')).text();
	for (const removed of ['/method/', '/updates/', '/about/']) {
		expect(sitemap).not.toContain(removed);
		expect((await request.get(removed)).status(), removed).toBe(404);
	}
	expect(errors).toEqual([]);
	const missing = await page.goto('/missing-page/');
	expect(missing?.status()).toBe(404);
	await expect(page.getByRole('heading', { level: 1 })).toContainText('찾을 수 없습니다');
});

test('responsive layouts and screenshots', async ({ page }, testInfo) => {
	const prefix = testInfo.project.name;
	for (const [route, name] of [
		['/', 'home'],
		['/scale/', 'scale'],
		['/articles/', 'articles'],
		['/articles/earth-moon/', 'article']
	]) {
		await page.goto(route);
		await page.evaluate(() => document.fonts.ready);
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
			)
		).toBe(true);
		await page.screenshot({
			path: `artifacts/verification-2026-10-19/${prefix}-${name}.png`,
			fullPage: true
		});
		if (name === 'home') {
			await page.screenshot({
				path: `artifacts/verification-2026-10-19/${prefix}-home-viewport.png`
			});
			await page.getByRole('banner').screenshot({
				path: `artifacts/simplified-pages/${prefix}-header.png`
			});
			await page.getByRole('contentinfo').scrollIntoViewIfNeeded();
			await page.evaluate(
				() =>
					new Promise<void>((resolve) =>
						requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
					)
			);
			const stories = (await page.locator('.stories-band').boundingBox())!;
			const footer = (await page.getByRole('contentinfo').boundingBox())!;
			expect(Math.abs(footer.y - stories.y - stories.height)).toBeLessThan(1);
			await page.screenshot({ path: `artifacts/simplified-pages/${prefix}-home-bottom.png` });
		}
	}
	if (prefix === 'mobile') {
		for (const width of [360, 390]) {
			await page.setViewportSize({ width, height: 892 });
			for (const object of ['vesta', 'mars', 'football']) {
				await page.goto(`/scale/?object=${object}`);
				await page.evaluate(() => document.fonts.ready);
				await page.getByRole('region', { name: '로그 스케일 탐험기' }).screenshot({
					path: `artifacts/mobile-explorer-spacing/${width}-${object}.png`
				});
			}
		}
	}
	if (prefix === 'desktop')
		for (const width of [320, 360, 375, 414, 768, 1280, 1920]) {
			await page.setViewportSize({ width, height: 1000 });
			for (const route of ['/', '/scale/', '/articles/', '/articles/earth-moon/']) {
				await page.goto(route);
				expect(
					await page.evaluate(
						() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
					),
					`${route} at ${width}px`
				).toBe(true);
			}
		}
});

test('navigation menu and focus targets', async ({ page, isMobile }) => {
	await page.goto('/');
	if (isMobile) {
		const menu = page.getByRole('button', { name: '메뉴' });
		await menu.click();
		await expect(menu).toHaveAttribute('aria-expanded', 'true');
		await page.keyboard.press('Escape');
		await expect(menu).toHaveAttribute('aria-expanded', 'false');
		await expect(menu).toBeFocused();
		await menu.click();
		await expect(page.locator('#mobile-nav').getByRole('link')).toHaveCount(3);
		await page.locator('#mobile-nav').getByRole('link', { name: '과학 이야기' }).click();
		await expect(page).toHaveURL(/\/articles\//);
		await expect(menu).toHaveAttribute('aria-expanded', 'false');
	} else {
		await page.keyboard.press('Tab');
		await expect(page.getByRole('link', { name: '본문으로 건너뛰기' })).toBeFocused();
		await page.keyboard.press('Enter');
		await expect(page.locator('#main')).toBeFocused();
	}
});

test('object picker and previous/next controls stay synchronized with the logarithmic ruler', async ({
	page,
	isMobile
}) => {
	await page.goto('/scale/?object=moon');
	await expect(page.getByTestId('selected-value')).toHaveText('3.47 × 10⁶ m');
	await page.getByRole('button', { name: '다음 대상' }).click();
	await expect(page.getByTestId('selected-value')).toHaveText('4.88 × 10⁶ m');
	if (isMobile) {
		await expect(page.getByLabel('탐험할 대상')).toHaveValue('mercury');
		await page.getByLabel('탐험할 대상').focus();
		expect(
			await page.getByLabel('탐험할 대상').evaluate((el) => getComputedStyle(el).outlineStyle)
		).toBe('none');
		await page.getByLabel('탐험할 대상').selectOption('atom');
	} else await page.getByRole('button', { name: /원자 규모/ }).click();
	await expect(page.getByRole('button', { name: '이전 대상' })).toBeDisabled();
	await expect(page.getByTestId('selected-value')).toHaveText('1.06 × 10⁻¹⁰ m');
	const slider = page.getByRole('slider');
	await slider.focus();
	await slider.press('End');
	await expect(page.getByRole('button', { name: '다음 대상' })).toBeDisabled();
	if (isMobile) await expect(page.getByLabel('탐험할 대상')).toHaveValue('sun');
	else
		await expect(page.getByRole('button', { name: /태양/ })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
	await expect(slider).toHaveValue(String(MAX_EXPONENT));
	const ruler = page.getByRole('img', { name: /^로그 눈금\./ });
	await expect(ruler.locator('circle')).toHaveCount(0);
	await expect(ruler.locator('line')).toHaveCount(20);
	await expect(page.getByText('● 대상 위치')).toHaveCount(0);
});

test('mobile data exposes every source without sideways scrolling, article contents navigate', async ({
	page,
	isMobile
}) => {
	await page.goto('/scale/');
	if (isMobile) {
		expect(
			await page.locator('.data-table-scroll').evaluate((el) => el.scrollWidth <= el.clientWidth)
		).toBe(true);
		await expect(page.locator('tbody tr')).toHaveCount(objects.length);
		for (const row of await page.locator('tbody tr').all()) {
			await expect(row.getByRole('link')).toBeVisible();
			expect(await row.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
		}
	}
	await page.goto('/articles/earth-moon/');
	await page.getByRole('navigation', { name: '이 글의 순서' }).getByRole('link').nth(1).click();
	await expect(page).toHaveURL(/#question-2$/);
	const target = page.locator('#question-2');
	await expect(target).toBeInViewport();
});

test('WCAG automated accessibility checks on representative pages', async ({ page }) => {
	for (const route of ['/', '/scale/', '/articles/?topic=micro', '/articles/earth-moon/']) {
		await page.goto(route);
		const result = await new AxeBuilder({ page })
			.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
			.analyze();
		expect(
			result.violations,
			`${route}: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) })))}`
		).toEqual([]);
	}
});

test('without JavaScript, content and scale table remain readable', async ({
	browser
}, testInfo) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: testInfo.project.use.viewport
	});
	const page = await context.newPage();
	await page.goto('http://127.0.0.1:4173/scale/');
	const sceneHeight = (testInfo.project.name === 'desktop' ? 276 : 216) + SCENE_HEADROOM;
	expect((await page.getByTestId('scale-scene').boundingBox())!.height).toBeCloseTo(sceneHeight, 1);
	await expect(page.getByRole('table')).toBeVisible();
	await expect(page.locator('tbody tr')).toHaveCount(objects.length);
	await page.goto('http://127.0.0.1:4173/');
	expect((await page.getByTestId('scale-scene').boundingBox())!.height).toBeCloseTo(sceneHeight, 1);
	await page.goto('http://127.0.0.1:4173/articles/earth-moon/');
	await expect(page.locator('.sources-disclosure > summary')).toHaveText('자료 및 출처');
	await context.close();
});

test('200 percent text enlargement preserves content and controls', async ({ page }, testInfo) => {
	for (const route of ['/', '/scale/', '/articles/earth-moon/']) {
		await page.goto(route);
		await page.evaluate(() => {
			const elements = Array.from(document.querySelectorAll<HTMLElement>('body *')).filter(
				(el) => el.namespaceURI === 'http://www.w3.org/1999/xhtml'
			);
			const sizes = elements.map((el) => parseFloat(getComputedStyle(el).fontSize));
			elements.forEach((el, i) => (el.style.fontSize = `${sizes[i] * 2}px`));
		});
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
			),
			route
		).toBe(true);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		if (route === '/scale/') await expect(page.getByRole('slider')).toBeVisible();
	}
	await page.screenshot({
		path: `artifacts/${testInfo.project.name}-text-200.png`,
		fullPage: true
	});
});

test('reduced motion and proportional distance geometry', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/articles/earth-moon/');
	const circles = page.locator('.distance-figure svg circle');
	const earthRadius = Number(await circles.nth(0).getAttribute('r'));
	const moonRadius = Number(await circles.nth(1).getAttribute('r'));
	const separation =
		Number(await circles.nth(1).getAttribute('cx')) -
		Number(await circles.nth(0).getAttribute('cx'));
	expect(separation / (2 * earthRadius)).toBeCloseTo(384400 / 12742, 8);
	expect(earthRadius / moonRadius).toBeCloseTo(12742 / 3474.8, 8);
});

test('object URLs survive reload and browser history without losing control focus', async ({
	page,
	isMobile
}) => {
	await page.goto('/scale/?object=moon');
	await expect(page.getByTestId('selected-value')).toHaveText('3.47 × 10⁶ m');
	const next = page.getByRole('button', { name: '다음 대상' });
	await next.focus();
	await next.press('Enter');
	await expect(page).toHaveURL(/object=mercury$/);
	await expect(next).toBeFocused();
	if (isMobile) await page.getByLabel('탐험할 대상').selectOption('ball');
	else await page.getByRole('button', { name: /탁구공/ }).click();
	await expect(page).toHaveURL(/object=ball$/);
	await page.reload();
	await expect(page.getByTestId('selected-value')).toHaveText('4 × 10⁻² m');
	await page.goBack();
	await expect(page.getByTestId('selected-value')).toHaveText('4.88 × 10⁶ m');
	await page.goBack();
	await expect(page.getByTestId('selected-value')).toHaveText('3.47 × 10⁶ m');
	await page.goForward();
	await expect(page.getByTestId('selected-value')).toHaveText('4.88 × 10⁶ m');
});

test('slider URL retains the exact cursor and replaces rather than flooding history', async ({
	page
}) => {
	await page.goto('/scale/?object=moon');
	await expect(page.getByTestId('selected-value')).toHaveText('3.47 × 10⁶ m');
	const historyLength = await page.evaluate(() => history.length);
	const slider = page.getByRole('slider');
	await slider.focus();
	await slider.press('Home');
	await slider.press('ArrowRight');
	await expect(page).toHaveURL(/object=atom&at=-9.99$/);
	await expect(slider).toBeFocused();
	expect(await page.evaluate(() => history.length)).toBe(historyLength);
	await page.reload();
	await expect(slider).toHaveValue('-9.99');
	await expect(page.getByTestId('selected-value')).toHaveText('1.06 × 10⁻¹⁰ m');
	await page.goto('/scale/?object=moon&at=Infinity');
	await expect(page.getByTestId('selected-value')).toHaveText('3.47 × 10⁶ m');
});

test('topic links retain filters on reload and restore results through browser history', async ({
	page
}) => {
	await page.goto('/articles/');
	const filters = page.getByRole('navigation', { name: '이야기 주제 필터' });
	const micro = filters.getByRole('link', { name: '미시 세계', exact: true });
	await expect(micro).toHaveAttribute('href', '/articles/?topic=micro');
	await micro.focus();
	await micro.press('Enter');
	await expect(page).toHaveURL(/topic=micro$/);
	await expect(micro).toBeFocused();
	await expect(micro).toHaveAttribute('aria-current', 'page');
	await expect(page.getByRole('status')).toHaveText('미시 세계 이야기 · 1편');
	await page.reload();
	await expect(page.locator('.article-card')).toHaveCount(1);
	await filters.getByRole('link', { name: '전체', exact: true }).click();
	await expect(page.locator('.article-card')).toHaveCount(3);
	await page.goBack();
	await expect(page.getByRole('status')).toHaveText('미시 세계 이야기 · 1편');
	await page.goForward();
	await expect(page.getByRole('status')).toHaveText('전체 이야기 · 3편');
	await page.goto('/articles/?topic=unknown');
	await expect(page.locator('.article-card')).toHaveCount(3);
});
