import { test, expect } from '@playwright/test';

test('orbital logo loads, fits the header and retains keyboard home navigation', async ({
	page,
	isMobile
}, testInfo) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/');
	await page.evaluate(async () => {
		await document.fonts.ready;
		const logo = new Image();
		logo.src = '/brand/a2o-orbital.png';
		await logo.decode();
	});
	const home = page.getByRole('link', { name: 'A2O — Atom to Orbit, 홈', exact: true });
	const widths = isMobile ? [390, 320] : [1440, 1014, 768];
	for (const width of widths) {
		await page.setViewportSize({ width, height: isMobile ? 844 : 1000 });
		const header = (await page.getByRole('banner').boundingBox())!;
		const mark = (await home.boundingBox())!;
		const navigation = (await (
			width < 768
				? page.getByRole('button', { name: '메뉴' })
				: page.getByRole('navigation', { name: '주요 탐색' })
		).boundingBox())!;
		expect(mark.height).toBeGreaterThanOrEqual(44);
		expect(mark.x + mark.width).toBeLessThan(navigation.x);
		expect(Math.abs(mark.y + mark.height / 2 - navigation.y - navigation.height / 2)).toBeLessThan(
			1
		);
		expect(header.height).toBeLessThan(83);
		expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
			false
		);
		await page.screenshot({ path: `artifacts/orbital-logo/${width}-home.png` });
		await page.getByRole('banner').screenshot({
			path: `artifacts/orbital-logo/${width}-header.png`
		});
	}
	await page.goto('/articles/');
	await home.focus();
	await expect(home).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL('/');
	expect(errors).toEqual([]);
	await page.screenshot({
		path: `artifacts/orbital-logo/${testInfo.project.name}-returned-home.png`
	});
});
