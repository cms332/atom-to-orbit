import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { articles } from '../src/lib/content/articles';

test('article format and source disclosures are consistent across all three articles', async ({
	page
}, info) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	for (const article of articles) {
		await page.goto(`/articles/${article.slug}/`);
		await expect(page.locator('.article-header h1')).toHaveText(article.title);
		await expect(page.locator('.article-header time')).toHaveCount(0);
		await expect(page.locator('.article-header')).not.toContainText(/분 읽기/);
		for (const disclosure of await page.locator('article .article-disclosure').all())
			await expect(disclosure).not.toHaveAttribute('open');
		await expect(page.locator('article .section-sources')).toHaveCount(0);
		await expect(page.locator('.explorer-invitation details')).toHaveCount(0);
		await expect(page.locator('article summary').filter({ hasText: '자료 및 출처' })).toHaveCount(
			1
		);
		await expect(page.locator('article summary')).toHaveCount(article.diagram === 'motion' ? 3 : 2);
		for (const selector of [
			'.article-header',
			'.article-nav',
			'.explorer-invitation',
			'.next',
			'.article-disclosure'
		]) {
			const borders = await page.locator(selector).evaluateAll((elements) =>
				elements.map((element) => {
					const style = getComputedStyle(element);
					return [style.borderTopWidth, style.borderBottomWidth];
				})
			);
			expect(borders.every((widths) => widths.every((width) => width === '0px'))).toBe(true);
		}
		const sources = page.locator('.sources-disclosure');
		const summary = sources.locator('summary');
		await expect(summary).toHaveText('자료 및 출처');
		await expect(sources.locator('li')).toHaveCount(article.sourceIds.length);
		await expect(sources.locator('li').first()).not.toBeVisible();
		expect(
			await page
				.locator(
					'.article-body > .explorer-invitation, .article-body > .article-sources, .article-body > .next'
				)
				.evaluateAll((elements) => elements.map((element) => element.classList.item(0)))
		).toEqual(['explorer-invitation', 'article-sources', 'next']);
		await expect(page.locator('.explorer-invitation h2')).toHaveText('직접 탐험해 보세요.');
		await expect(page.locator('.next h2')).toHaveText('다음 이야기');
		await expect(page.locator('.next a')).toHaveCount(2);
		await page.evaluate(() => document.fonts.ready);
		await page
			.locator('article figure')
			.first()
			.screenshot({
				path: `artifacts/article-reading-flow/${info.project.name}-${article.slug}-figure.png`
			});
		await page.locator('.explorer-invitation').screenshot({
			path: `artifacts/article-reading-flow/${info.project.name}-${article.slug}-explorer.png`
		});
		await sources.screenshot({
			path: `artifacts/article-reading-flow/${info.project.name}-${article.slug}-sources-closed.png`
		});
		await summary.focus();
		await summary.press('Enter');
		await expect(sources).toHaveAttribute('open');
		await expect(sources.locator('li').first()).toBeVisible();
		for (const link of await sources.locator('li > a').all())
			expect(await link.getAttribute('href')).toMatch(/^https:\/\//);
		await sources.screenshot({
			path: `artifacts/article-reading-flow/${info.project.name}-${article.slug}-sources-open.png`
		});
		await summary.press('Space');
		await expect(sources).not.toHaveAttribute('open');
		const notes = page.locator('article figure').first().locator('.model-notes');
		await notes.locator('summary').click();
		const reference = notes.locator('a[href^="#source-"]').first();
		const target = (await reference.getAttribute('href'))!;
		await reference.click();
		await expect(sources).toHaveAttribute('open');
		await expect(page.locator(target)).toBeInViewport();
		if (article.diagram === 'motion') {
			await expect(page.locator('.motion-speeds details')).toHaveCount(0);
			const footnotes = page.locator('.motion-speeds .source-ref');
			await expect(footnotes).toHaveText(['[1]', '[2]', '[3]']);
			await summary.click();
			const footnote = footnotes.first();
			const box = (await footnote.boundingBox())!;
			expect(box.width).toBeGreaterThanOrEqual(44);
			expect(box.height).toBeGreaterThanOrEqual(44);
			await footnote.focus();
			await footnote.press('Enter');
			await expect(sources).toHaveAttribute('open');
			await expect(page.locator('#source-motion-rotation')).toBeInViewport();
		}
		await page.goto(`/articles/${article.slug}/${target}`);
		await expect(sources).toHaveAttribute('open');
		await expect(page.locator(target)).toBeInViewport();
		await summary.click();
		await expect(sources).not.toHaveAttribute('open');
		await reference.click();
		await expect(sources).toHaveAttribute('open');
		await expect(page.locator(target)).toBeInViewport();
		for (const width of [390, 320]) {
			await page.setViewportSize({ width, height: 900 });
			expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
				true
			);
		}
		expect(
			(await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze())
				.violations
		).toEqual([]);
		const next = page.locator('.next a').first();
		const nextUrl = (await next.getAttribute('href'))!;
		await next.click();
		await expect(page).toHaveURL(new RegExp(`${nextUrl}$`));
		await expect(page.locator('.sources-disclosure')).not.toHaveAttribute('open');
		await page.setViewportSize(info.project.use.viewport!);
	}
	expect(errors).toEqual([]);
});

test('article sources and figure references open without JavaScript', async ({ browser }, info) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: info.project.use.viewport
	});
	const page = await context.newPage();
	for (const article of articles) {
		await page.goto(`http://127.0.0.1:4173/articles/${article.slug}/`);
		const sources = page.locator('.sources-disclosure');
		await expect(sources).not.toHaveAttribute('open');
		const notes = page.locator('article figure').first().locator('.model-notes');
		await notes.locator('summary').click();
		const reference = notes.locator('a[href^="#source-"]').first();
		const target = (await reference.getAttribute('href'))!;
		await reference.click();
		await expect(sources).toHaveAttribute('open');
		await expect(page.locator(target)).toBeInViewport();
		await expect(sources.locator('li > a').first()).toBeVisible();
		if (article.diagram === 'motion') {
			await sources.locator('summary').click();
			await page.getByRole('link', { name: '지구 자전 출처 1', exact: true }).click();
			await expect(sources).toHaveAttribute('open');
			await expect(page.locator('#source-motion-rotation')).toBeInViewport();
		}
	}
	await context.close();
});
