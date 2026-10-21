import { test, expect } from '@playwright/test';
import { objects } from '../src/lib/data/science';

test('football has a complete round silhouette without protruding patches and keeps its scale', async ({
	page,
	context
}, testInfo) => {
	await page.goto('/scale/?object=football');
	await expect(page.getByRole('heading', { name: '축구공', exact: true })).toBeVisible();
	await page.evaluate(() => document.fonts.ready);
	const body = page.getByTestId('scale-scene').locator('[data-object="football"]');
	const glyph = body.locator(':scope > svg');
	await glyph.screenshot({
		path: `artifacts/football-refinement/${testInfo.project.name}-glyph.png`
	});
	const markup = await glyph.evaluate((element) => {
		const copy = element.cloneNode(true) as SVGSVGElement;
		copy.setAttribute('x', '0');
		copy.setAttribute('y', '0');
		copy.setAttribute('width', '400');
		copy.setAttribute('height', '400');
		return new XMLSerializer().serializeToString(copy);
	});
	const coverage = await page.evaluate(async (svg) => {
		const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
		try {
			const image = new Image();
			image.src = url;
			await image.decode();
			const canvas = document.createElement('canvas');
			canvas.width = canvas.height = 400;
			const ctx = canvas.getContext('2d')!;
			ctx.drawImage(image, 0, 0, 400, 400);
			const pixels = ctx.getImageData(0, 0, 400, 400).data;
			let protruding = 0;
			let holes = 0;
			for (let y = 0; y < 400; y++)
				for (let x = 0; x < 400; x++) {
					const radius = Math.hypot(x + 0.5 - 200, y + 0.5 - 200);
					const alpha = pixels[(y * 400 + x) * 4 + 3];
					if (radius > 201 && alpha > 0) protruding++;
					if (radius < 198 && alpha < 250) holes++;
				}
			return { protruding, holes };
		} finally {
			URL.revokeObjectURL(url);
		}
	}, markup);
	expect(coverage).toEqual({ protruding: 0, holes: 0 });
	const detail = await context.newPage();
	await detail.setViewportSize({ width: 480, height: 480 });
	await detail.setContent(
		'<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#102832;display:grid;place-items:center;width:480px;height:480px">' +
			markup +
			'</body></html>'
	);
	await detail.waitForFunction(() => innerWidth === 480);
	await detail.evaluate(
		() =>
			new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
			)
	);
	await expect(detail.locator('svg')).toBeInViewport({ ratio: 1 });
	await detail.screenshot({
		path: `artifacts/football-refinement/${testInfo.project.name}-detail.png`
	});
	await detail.close();
	const football = objects.find((object) => object.id === 'football')!;
	const slider = page.getByRole('slider');
	const exactObjectSize = Number(await body.getAttribute('data-length'));
	// Compare two cursor positions representable by the existing two-decimal URL state.
	const from = Number(Math.log10(football.meters).toFixed(2));
	await slider.evaluate((element, exponent) => {
		const input = element as HTMLInputElement;
		input.value = String(exponent);
		input.dispatchEvent(new Event('input', { bubbles: true }));
	}, from);
	await expect
		.poll(async () => Number(await body.getAttribute('data-length')))
		.not.toBe(exactObjectSize);
	const initial = Number(await body.getAttribute('data-length'));
	await slider.evaluate((element, exponent) => {
		const input = element as HTMLInputElement;
		input.value = String(exponent);
		input.dispatchEvent(new Event('input', { bubbles: true }));
	}, from + 1);
	await expect
		.poll(async () => Number(await body.getAttribute('data-length')))
		.toBeCloseTo(initial / 10, 8);
	const smaller = (await glyph.boundingBox())!;
	expect(Math.abs(smaller.width - initial / 10)).toBeLessThan(0.01);
	expect(Math.abs(smaller.height - smaller.width)).toBeLessThan(0.01);
});
