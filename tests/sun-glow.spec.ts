import { test, expect } from '@playwright/test';

test('solar light surrounds the measured disc without changing scale or controls', async ({
	page
}, info) => {
	await page.goto('/scale/?object=sun');
	await expect(page.getByRole('heading', { name: '태양', exact: true })).toBeVisible();
	const scene = page.getByTestId('scale-scene');
	const sun = scene.locator('[data-object="sun"]');
	await expect
		.poll(async () => Number(await sun.getAttribute('data-length')))
		.toBe(Number(await scene.getAttribute('data-reference-pixels')));
	const disc = (await sun.locator(':scope > svg').boundingBox())!;
	const glow = scene.getByTestId('sun-glow');
	const halo = (await glow.boundingBox())!;
	await expect(glow).toHaveAttribute('pointer-events', 'none');
	await expect(sun.getByTestId('sun-glow')).toHaveCount(0);
	expect(
		await glow.evaluate((element) =>
			Boolean(
				element.compareDocumentPosition(
					element.parentElement!.querySelector('[data-object="sun"]')!
				) & Node.DOCUMENT_POSITION_FOLLOWING
			)
		)
	).toBe(true);
	const lightPixels = await glow.evaluate(async (element) => {
		const copy = element.cloneNode(true) as SVGElement;
		copy.removeAttribute('transform');
		copy.removeAttribute('opacity');
		const source =
			'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 160 160" width="400" height="400">' +
			new XMLSerializer().serializeToString(copy) +
			'</svg>';
		const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml' }));
		try {
			const image = new Image();
			image.src = url;
			await image.decode();
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = 400;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(image, 0, 0);
			const data = ctx.getImageData(0, 0, 400, 400).data;
			let interior = 0,
				exterior = 0;
			for (let y = 0; y < 400; y++)
				for (let x = 0; x < 400; x++) {
					const radius = Math.hypot(x + 0.5 - 200, y + 0.5 - 200);
					const alpha = data[(y * 400 + x) * 4 + 3];
					if (radius < 124 && alpha > 0) interior++;
					if (radius > 126 && alpha > 0) exterior++;
				}
			return { interior, exterior };
		} finally {
			URL.revokeObjectURL(url);
		}
	});
	expect(lightPixels.interior).toBe(0);
	expect(lightPixels.exterior).toBeGreaterThan(1000);
	expect(halo.width).toBeGreaterThan(disc.width);
	expect(halo.width).toBeLessThan(disc.width * 2);
	expect(Math.abs(halo.x + halo.width / 2 - disc.x - disc.width / 2)).toBeLessThan(0.1);
	expect(Math.abs(halo.y + halo.height / 2 - disc.y - disc.height / 2)).toBeLessThan(0.1);
	expect(Math.abs(disc.width - Number(await sun.getAttribute('data-length')))).toBeLessThan(0.1);
	await page.evaluate(() => document.fonts.ready);
	await scene.screenshot({ path: `artifacts/sun-glow/${info.project.name}-scene.png` });
	await page
		.locator('section.instrument')
		.screenshot({ path: `artifacts/sun-glow/${info.project.name}-panel.png` });
	const slider = page.getByRole('slider');
	await slider.focus();
	await slider.press('Home');
	await expect(glow).toHaveCount(0);
	await slider.press('End');
	await expect(glow).toHaveCount(1);
});
