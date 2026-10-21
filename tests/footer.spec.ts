import { test, expect } from '@playwright/test';

test('floating top arrow appears after scrolling, stays fixed and restores header focus', async ({
	page,
	browser,
	isMobile
}, testInfo) => {
	const widths = isMobile ? [390, 360, 320] : [1440, 976, 768, 630, 320];
	for (const width of widths) {
		await page.setViewportSize({ width, height: 892 });
		for (const route of ['/', '/scale/?object=earth', '/articles/earth-moon/']) {
			await page.goto(route);
			await page.evaluate(() => document.fonts.ready);
			const footer = page.getByRole('contentinfo');
			const top = page.locator('a.back-to-top');
			await expect(top).toBeHidden();
			await page.evaluate(() => scrollTo(0, 200));
			await expect(top).toBeHidden();
			await page.evaluate(() => scrollTo(0, 700));
			await expect(top).toBeVisible();
			if (route === '/' && [1440, 390].includes(width)) {
				await page.evaluate(
					() =>
						new Promise<void>((resolve) =>
							requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
						)
				);
				await page.screenshot({ path: `artifacts/footer-stop/${width}-content.png` });
			}
			const control = (await top.boundingBox())!;
			expect(control.width).toBeGreaterThanOrEqual(44);
			expect(control.height).toBeGreaterThanOrEqual(44);
			expect(width - control.x - control.width).toBe(20);
			expect(892 - control.y - control.height).toBe(20);
			await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
			const note = footer.locator('.footer-note');
			const dockError = async () => {
				const buttonBox = (await top.boundingBox())!;
				const noteBox = (await note.boundingBox())!;
				return Math.abs(buttonBox.y + buttonBox.height - noteBox.y - noteBox.height);
			};
			await expect.poll(dockError).toBeLessThan(1);
			const docked = (await top.boundingBox())!;
			const separator = (await footer.locator('.footer-bottom').boundingBox())!;
			expect(separator.y - docked.y - docked.height).toBeGreaterThanOrEqual(36);
			expect(docked.y).toBeLessThan(control.y);
			// The button moves with the footer while docked, then returns to its viewport position.
			await page.evaluate(() => scrollBy(0, -40));
			await expect.poll(dockError).toBeLessThan(1);
			await expect.poll(async () => (await top.boundingBox())!.y).toBeCloseTo(docked.y + 40, 0);
			await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
			await expect.poll(dockError).toBeLessThan(1);
			await expect(footer.getByRole('link', { name: 'A2O 소개', exact: true })).toHaveCount(0);
			expect(
				await footer
					.locator('.footer-note')
					.evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
			).toBeGreaterThanOrEqual(14);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
				false
			);
			if (route === '/' && [1440, 976, 630, 390, 360, 320].includes(width)) {
				await page.evaluate(
					() =>
						new Promise<void>((resolve) =>
							requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
						)
				);
				await page.screenshot({ path: `artifacts/footer-stop/${width}-scrolled.png` });
			}
			await top.click();
			await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThanOrEqual(1);
			await expect(top).toBeHidden();
			await expect(page.locator('#page-top')).toBeFocused();
			await page.keyboard.press('Tab');
			await expect(
				page.getByRole('link', { name: 'A2O — Atom to Orbit, 홈', exact: true })
			).toBeFocused();
			await page.evaluate(() => scrollTo(0, 700));
			await expect(top).toBeVisible();
			await expect.poll(async () => (await top.boundingBox())!.y).toBe(control.y);
			await top.focus();
			await page.keyboard.press('Enter');
			await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThanOrEqual(1);
			await expect(page.locator('#page-top')).toBeFocused();
			await expect(top).toBeHidden();
		}
	}
	// Progressive fallback remains a native footer link when scripts are unavailable.
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport: testInfo.project.use.viewport
	});
	const noJS = await context.newPage();
	await noJS.goto('http://127.0.0.1:4173/scale/');
	await noJS.getByRole('contentinfo').getByRole('link', { name: '맨 위로 이동' }).click();
	await expect.poll(() => noJS.evaluate(() => scrollY)).toBeLessThanOrEqual(1);
	await expect(noJS.locator('#page-top')).toBeFocused();
	await context.close();
});

test('floating top arrow follows restored scroll and hides after client navigation', async ({
	page
}) => {
	await page.goto('/#page-top');
	const top = page.locator('a.back-to-top');
	await expect(top).toBeHidden();
	await page.evaluate(() => scrollTo(0, 800));
	await expect(top).toBeVisible();
	await page.reload();
	await expect(top).toBeVisible();
	await page.getByRole('contentinfo').getByRole('link', { name: 'A2O', exact: true }).click();
	await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThanOrEqual(1);
	await expect(top).toBeHidden();
});

test('footer stop follows viewport changes and enlarged mission text without covering it', async ({
	page
}) => {
	await page.goto('/articles/earth-moon/');
	const top = page.locator('a.back-to-top');
	const note = page.locator('.footer-note');
	for (const width of [630, 976, 320]) {
		await page.setViewportSize({ width, height: 892 });
		await note.evaluate((el) => {
			el.style.fontSize = '32px';
		});
		await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
		await expect(top).toBeVisible();
		await expect
			.poll(async () => {
				const button = (await top.boundingBox())!;
				const text = (await note.boundingBox())!;
				return Math.abs(button.y + button.height - text.y - text.height);
			})
			.toBeLessThan(1);
		const button = (await top.boundingBox())!;
		const lines = await note.evaluate((el) => {
			const range = document.createRange();
			range.selectNodeContents(el);
			return Array.from(range.getClientRects(), (rect) => ({
				x: rect.x,
				y: rect.y,
				right: rect.right,
				bottom: rect.bottom
			}));
		});
		for (const line of lines) {
			expect(
				line.right <= button.x ||
					line.x >= button.x + button.width ||
					line.bottom <= button.y ||
					line.y >= button.y + button.height
			).toBe(true);
		}
	}
});

test('short filtered pages reveal the top arrow before reaching the footer', async ({ page }) => {
	for (const width of [775, 976, 390]) {
		await page.setViewportSize({ width, height: 892 });
		await page.goto('/articles/?topic=micro');
		await expect(page.getByRole('status')).toContainText('미시 세계 이야기 · 1편');
		await page.evaluate(() => document.fonts.ready);
		const top = page.locator('a.back-to-top');
		await expect(top).toBeHidden();
		const range = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
		expect(range).toBeGreaterThan(0);
		if (width === 775) {
			// This real route cannot reach the old 640px reveal threshold.
			expect(range).toBeLessThan(640);
			await page.evaluate((y) => scrollTo(0, y), Math.floor(range / 4));
			await expect(top).toBeHidden();
			await page.evaluate((y) => scrollTo(0, y), Math.ceil(range * 0.75));
			await expect(top).toBeVisible();
		}
		await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
		await expect(top).toBeVisible();
		await expect
			.poll(async () => {
				const button = (await top.boundingBox())!;
				const note = (await page.locator('.footer-note').boundingBox())!;
				return Math.abs(button.y + button.height - note.y - note.height);
			})
			.toBeLessThan(1);
		await page.evaluate(
			() =>
				new Promise<void>((resolve) =>
					requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
				)
		);
		await page.screenshot({ path: `artifacts/short-page-top/${width}-micro-footer.png` });
		await top.click();
		await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThanOrEqual(1);
		await expect(page.locator('#page-top')).toBeFocused();
		await expect(top).toBeHidden();
	}
	// The persistent footer also adapts when filtering changes the page without a reload.
	await page.setViewportSize({ width: 775, height: 892 });
	await page.goto('/articles/');
	await page
		.getByRole('navigation', { name: '이야기 주제 필터' })
		.getByRole('link', { name: '미시 세계', exact: true })
		.click();
	await expect(page.getByRole('status')).toContainText('미시 세계 이야기 · 1편');
	await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
	await expect(page.locator('a.back-to-top')).toBeVisible();
	// With no overflow the visitor is already at the top, so the control stays hidden.
	await page.setViewportSize({ width: 775, height: 2400 });
	await expect
		.poll(() => page.evaluate(() => document.documentElement.scrollHeight - innerHeight))
		.toBe(0);
	await expect(page.locator('a.back-to-top')).toBeHidden();
	await page.setViewportSize({ width: 775, height: 892 });
	await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
	await expect(page.locator('a.back-to-top')).toBeVisible();
});
