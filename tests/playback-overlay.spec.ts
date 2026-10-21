import { test, expect } from '@playwright/test';
import { objects } from '../src/lib/data/science';

test('larger playback overlays the extended SVG headroom and aligns with SCALE', async ({
	page,
	isMobile
}, testInfo) => {
	const widths = isMobile ? [390, 320] : [1440, 979, 625, 594];
	for (const width of widths) {
		await page.setViewportSize({ width, height: 1000 });
		for (const route of ['/', '/scale/?object=earth']) {
			await page.goto(route);
			await page.evaluate(() => document.fonts.ready);
			const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
			const play = panel.getByRole('button', { name: '자동 재생', exact: true });
			await expect(play).toBeEnabled();
			const canvas = (await panel.getByTestId('scale-scene').boundingBox())!;
			const button = (await play.boundingBox())!;
			const instrument = (await panel.boundingBox())!;
			const heading = (await panel.locator('.instrument-top > span').first().boundingBox())!;
			const icon = play.locator('.playback-icon');
			const iconBox = (await icon.boundingBox())!;
			const triangleInset = await icon.evaluate((element) =>
				parseFloat(getComputedStyle(element, '::before').left)
			);
			const caption = (await panel.locator('.scene-caption').boundingBox())!;
			expect(button.width).toBeGreaterThanOrEqual(44);
			expect(button.height).toBeGreaterThanOrEqual(48);
			expect(
				await play.evaluate((element) => parseFloat(getComputedStyle(element).fontSize))
			).toBeGreaterThanOrEqual(17);
			expect(iconBox.width).toBeGreaterThanOrEqual(14);
			expect(button.x).toBeGreaterThanOrEqual(instrument.x + 2);
			expect(Math.abs(iconBox.x + triangleInset - heading.x - 2)).toBeLessThan(0.5);
			expect(button.x + button.width).toBeLessThanOrEqual(canvas.x + canvas.width);
			expect(button.y).toBeGreaterThanOrEqual(canvas.y);
			expect(button.y + button.height).toBeLessThanOrEqual(canvas.y + 64);
			const viewport = (await panel.locator('.scene-viewport').boundingBox())!;
			expect(Math.abs(canvas.y - viewport.y)).toBeLessThan(0.5);
			await expect(panel.getByTestId('scale-scene')).toHaveAttribute('data-headroom', '64');
			expect(button.x + button.width / 2).toBeLessThan(canvas.x + canvas.width * 0.4);
			expect(button.y + button.height).toBeLessThan(caption.y);
			expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
				false
			);
			if (width === widths[0] || width === 979 || width === 594) {
				await panel.screenshot({
					path: `artifacts/extended-svg-playback/${width}-${route === '/' ? 'home' : 'scale'}.png`
				});
			}
			await play.focus();
			await page.keyboard.press('Enter');
			const pause = panel.getByRole('button', { name: '일시 정지', exact: true });
			await expect(pause).toBeFocused();
			await page.keyboard.press('Escape');
			await expect(play).toBeFocused();
			await expect(play).toBeVisible();
			// The invisible padding remains clickable, not only the icon and text.
			await play.click({ position: { x: 2, y: 2 } });
			await expect(pause).toBeVisible();
			await pause.click({ position: { x: 2, y: 2 } });
			await expect(play).toBeVisible();
			if (width === 594) {
				const battery = objects.find((object) => object.id === 'battery')!;
				await panel.getByRole('slider').evaluate(
					(element, value) => {
						const input = element as HTMLInputElement;
						input.value = String(value);
						input.dispatchEvent(new Event('input', { bubbles: true }));
					},
					Math.log10(battery.meters) - 0.3
				);
				await expect(panel.locator('[data-object="battery"]')).toBeAttached();
				await play.blur();
				await panel.screenshot({
					path: `artifacts/extended-svg-playback/594-${route === '/' ? 'home' : 'scale'}-battery.png`
				});
			}
			if (width === 320) {
				await play.evaluate((element) => {
					element.style.fontSize = '34px';
				});
				const enlarged = (await play.boundingBox())!;
				const enlargedCanvas = (await panel.getByTestId('scale-scene').boundingBox())!;
				expect(enlarged.y).toBeGreaterThanOrEqual(enlargedCanvas.y);
				expect(enlarged.y + enlarged.height).toBeLessThan(
					enlargedCanvas.y + enlargedCanvas.height - 40
				);
				expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
					false
				);
			}
		}
	}
	await page.getByRole('region', { name: '로그 스케일 탐험기' }).screenshot({
		path: `artifacts/extended-svg-playback/${testInfo.project.name}-keyboard-paused.png`
	});
});
