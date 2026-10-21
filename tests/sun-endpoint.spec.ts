import { test, expect } from '@playwright/test';
import { MAX_EXPONENT, MAX_METERS, toPosition, scientific } from '../src/lib/utils/scales';
import { SCENE_PADDING, SCENE_HEADROOM } from '../src/lib/utils/scale-scene';

test('home and full explorer end exactly at the Sun for keyboard, pointer and shared URLs', async ({
	page
}, testInfo) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	for (const route of ['/', '/scale/']) {
		await page.goto(route);
		await page.evaluate(() => document.fonts.ready);
		const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
		const slider = panel.getByRole('slider');
		const sun = panel.getByTestId('scale-scene').locator('[data-object="sun"]');
		const reference = testInfo.project.name === 'desktop' ? 180 : 120;
		await expect(panel.getByRole('heading', { name: '지구', exact: true })).toBeVisible();
		await expect(panel.getByTestId('scale-scene')).toHaveAttribute(
			'data-reference-pixels',
			String(reference)
		);
		await panel.screenshot({
			path: `artifacts/larger-scene/${testInfo.project.name}-${route === '/' ? 'home' : 'scale'}-earth.png`
		});
		await slider.focus();
		await slider.press('End');
		await expect(slider).toHaveValue(String(MAX_EXPONENT));
		await expect(panel.getByTestId('selected-value')).toHaveText(scientific(MAX_METERS));
		await expect
			.poll(async () => Number(await sun.getAttribute('data-length')))
			.toBeCloseTo(reference, 8);
		const sceneBox = (await panel.getByTestId('scale-scene').boundingBox())!;
		const sunBox = (await sun.locator('svg').boundingBox())!;
		expect(sceneBox.height).toBeCloseTo(reference + SCENE_PADDING + SCENE_HEADROOM, 1);
		expect(sunBox.width).toBeCloseTo(reference, 1);
		expect(sunBox.y - sceneBox.y).toBeGreaterThanOrEqual(39 + SCENE_HEADROOM);
		expect(sceneBox.y + sceneBox.height - sunBox.y - sunBox.height).toBeGreaterThanOrEqual(55);
		await expect(panel.getByTestId('axis-cursor')).toHaveAttribute('d', 'M1000 8v26');
		await expect(panel.locator('.tick-labels .last')).toHaveText(/^10⁹\s*m$/);
		await expect(panel.locator('.tick-labels')).not.toContainText('1.39');
		const lines = await panel
			.getByRole('img', { name: /^로그 눈금\./ })
			.locator('line')
			.evaluateAll((items) => items.map((item) => Number(item.getAttribute('x1'))));
		expect(lines).toHaveLength(20);
		expect(lines.at(-1)).toBeCloseTo(toPosition(1e9) * 1000, 10);
		const labelPosition = await panel
			.locator('.tick-labels .last')
			.evaluate((element) => parseFloat((element as HTMLElement).style.left));
		// CSSOM serializes percentages with limited precision (well below a visible pixel).
		expect(labelPosition).toBeCloseTo(toPosition(1e9) * 100, 3);
		for (let i = 1; i < lines.length; i++)
			expect(lines[i] - lines[i - 1]).toBeCloseTo(lines[1] - lines[0], 10);
		await slider.press('ArrowRight');
		await expect(slider).toHaveValue(String(MAX_EXPONENT));
		await slider.press('ArrowLeft');
		expect(Number(await slider.inputValue())).toBeLessThan(MAX_EXPONENT);
		await slider.press('Home');
		await expect(slider).toHaveValue('-10');
		await panel.getByText('SCALE EXPLORER', { exact: true }).click();
		await panel.screenshot({
			path: `artifacts/larger-scene/${testInfo.project.name}-${route === '/' ? 'home' : 'scale'}-atom.png`
		});
		await slider.scrollIntoViewIfNeeded();
		const box = (await slider.boundingBox())!;
		await page.mouse.click(box.x + box.width - 1, box.y + box.height / 2);
		await expect(slider).toHaveValue(String(MAX_EXPONENT));
		await expect
			.poll(async () => Number(await sun.getAttribute('data-length')))
			.toBeCloseTo(reference, 8);
		if (route === '/scale/') {
			await expect(page).toHaveURL(/\/scale\/\?object=sun$/);
			await page.reload();
			await expect(slider).toHaveValue(String(MAX_EXPONENT));
			await expect
				.poll(async () => Number(await sun.getAttribute('data-length')))
				.toBeCloseTo(reference, 8);
		}
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		await panel.getByText('SCALE EXPLORER', { exact: true }).click();
		await panel.screenshot({
			path: `artifacts/larger-scene/${testInfo.project.name}-${route === '/' ? 'home' : 'scale'}-sun.png`
		});
		if (route === '/') {
			await page.evaluate(() => window.scrollTo(0, 0));
			await page.screenshot({
				path: `artifacts/larger-scene/${testInfo.project.name}-home-viewport.png`
			});
			if (testInfo.project.name === 'desktop') {
				await page.setViewportSize({ width: 1280, height: 800 });
				await page.evaluate(() => window.scrollTo(0, 0));
				const cta = (await page
					.locator('.hero-actions')
					.getByRole('link', { name: '크기 탐험하기', exact: true })
					.boundingBox())!;
				expect(cta.y).toBeGreaterThanOrEqual(0);
				expect(cta.y + cta.height).toBeLessThan(800);
				await page.screenshot({ path: 'artifacts/larger-scene/laptop-home-viewport.png' });
				await page.setViewportSize({ width: 649, height: 1000 });
				await expect
					.poll(async () => Number(await sun.getAttribute('data-length')))
					.toBeCloseTo(180, 8);
				await panel.screenshot({ path: 'artifacts/larger-scene/medium-home-sun.png' });
				await page.setViewportSize({ width: 1440, height: 1000 });
			}
		}
	}
	expect(errors).toEqual([]);
});
