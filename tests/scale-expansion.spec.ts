import { test, expect } from '@playwright/test';
import { objects } from '../src/lib/data/science';
import { additionalObjects } from '../src/lib/data/science-expansion';
import { planetObjects } from '../src/lib/data/science-planets';
import { MAX_EXPONENT, scientific } from '../src/lib/utils/scales';
import { sceneReference } from '../src/lib/utils/scale-scene';

test('all catalogue subjects render the measured dimension and shrink by ten at the same camera scale', async ({
	page
}, testInfo) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	for (const object of objects) {
		await page.goto(`/scale/?object=${object.id}`);
		const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
		await expect(panel.getByRole('heading', { name: object.nameKo, exact: true })).toBeVisible();
		await expect(page.getByTestId('selected-value')).toHaveText(scientific(object.meters));
		const scene = page.getByTestId('scale-scene');
		const body = scene.locator(`[data-object="${object.id}"]`);
		const art = body.locator('svg');
		const axis = await body.getAttribute('data-measure-axis');
		await page.evaluate(() => document.fonts.ready);
		const reference = sceneReference((await scene.boundingBox())!.width);
		await expect
			.poll(async () => Number(await body.getAttribute('data-length')))
			.toBeCloseTo(reference, 8);
		await expect(panel.locator('.source-slot a')).toHaveAttribute('href', /^https:\/\//);
		await expect(page.locator('tbody tr')).toHaveCount(objects.length);
		if ([...additionalObjects, ...planetObjects].some((o) => o.id === object.id)) {
			await panel.screenshot({
				path: `artifacts/solar-system/catalogue-${testInfo.project.name}-${object.id}.png`
			});
		}
		// Start on a representable slider step; direct object URLs retain exact source exponents.
		const base = Math.min(
			Math.floor((MAX_EXPONENT - 1) * 100) / 100,
			Number(Math.log10(object.meters).toFixed(2))
		);
		async function zoom(value: number) {
			await page.getByRole('slider').evaluate((element, value) => {
				const input = element as HTMLInputElement;
				input.value = String(value);
				input.dispatchEvent(new Event('input', { bubbles: true }));
			}, value);
			await expect(page).toHaveURL(new RegExp(`at=${String(value).replace('.', '\\.')}($|&)`));
			await expect
				.poll(async () => Number(await body.getAttribute('data-length')))
				.toBeCloseTo(reference * 10 ** (Math.log10(object.meters) - value), 7);
		}
		await zoom(base);
		const before = (await art.boundingBox())!;
		await page.getByRole('slider').evaluate((element, value) => {
			const input = element as HTMLInputElement;
			input.value = String(value);
			input.dispatchEvent(new Event('input', { bubbles: true }));
		}, base + 1);
		await expect
			.poll(async () => Number(await body.getAttribute('data-length')))
			.toBeCloseTo((reference / 10) * 10 ** (Math.log10(object.meters) - base), 7);
		const after = (await art.boundingBox())!;
		expect(
			Math.abs(
				(axis === 'x' ? before.width : before.height) / 10 -
					(axis === 'x' ? after.width : after.height)
			)
		).toBeLessThan(0.01);
	}
	expect(errors).toEqual([]);
});

test('slider drag reveals later objects while the home panel stays fixed', async ({ page }) => {
	await page.goto('/');
	const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
	const slider = panel.getByRole('slider');
	await page.evaluate(() => document.fonts.ready);
	await slider.scrollIntoViewIfNeeded();
	const track = (await slider.boundingBox())!;
	const before = (await panel.boundingBox())!.height;
	await page.mouse.move(track.x + 10, track.y + track.height / 2);
	await page.mouse.down();
	await page.mouse.move(track.x + track.width - 10, track.y + track.height / 2, { steps: 45 });
	await page.mouse.up();
	expect(Number(await slider.inputValue())).toBeGreaterThan(8);
	expect(Math.abs((await panel.boundingBox())!.height - before)).toBeLessThan(0.5);
	await expect(panel.getByTestId('selected-value')).toHaveText(scientific(objects.at(-1)!.meters));
});
