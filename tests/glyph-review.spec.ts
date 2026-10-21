import { test, expect } from '@playwright/test';
import { earthLandPath } from '../src/lib/data/earth-outline';
import { objects } from '../src/lib/data/science';

test('all 27 object SVGs hydrate with unique, self-contained paint references', async ({
	page
}, info) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	for (const object of objects) {
		await page.goto('/scale/?object=' + object.id);
		await expect(page.getByRole('heading', { name: object.nameKo, exact: true })).toBeVisible();
		await page.waitForFunction((selected) => {
			const scene = document.querySelector('[data-testid="scale-scene"]')!;
			const body = scene.querySelector(`[data-object="${selected}"]`);
			return (
				body &&
				Math.abs(
					Number(body.getAttribute('data-length')) -
						Number(scene.getAttribute('data-reference-pixels'))
				) < 1e-7
			);
		}, object.id);
		const result = await page.getByTestId('scale-scene').evaluate((scene) => {
			const ids = Array.from(document.querySelectorAll('[id]'), (el) => el.id);
			const unresolved: string[] = [];
			for (const body of scene.querySelectorAll('[data-object] > svg')) {
				const localIds = new Set(Array.from(body.querySelectorAll('[id]'), (el) => el.id));
				for (const element of body.querySelectorAll('*'))
					for (const attribute of Array.from(element.attributes)) {
						for (const match of attribute.value.matchAll(/url\(#([^)]*)\)/g))
							if (!localIds.has(match[1])) unresolved.push(match[1]);
					}
			}
			return { duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i), unresolved };
		});
		expect(result, object.id).toEqual({ duplicateIds: [], unresolved: [] });
		if (['whale', 'table', 'hair', 'battery', 'earth'].includes(object.id)) {
			await page.evaluate(() => document.fonts.ready);
			await page
				.locator('section.instrument')
				.screenshot({ path: `artifacts/glyph-review/${info.project.name}-${object.id}.png` });
		}
	}
	expect(errors).toEqual([]);
});

test('refined globes retain complete circles and Earth has real land/ocean topology', async ({
	page
}) => {
	for (const id of ['earth', 'moon', 'mercury', 'venus', 'mars', 'neptune', 'jupiter', 'sun']) {
		await page.goto('/scale/?object=' + id);
		const glyph = page.getByTestId('scale-scene').locator(`[data-object="${id}"] > svg`);
		await expect(glyph).toBeAttached();
		const coverage = await glyph.evaluate(async (element) => {
			const svg = element.cloneNode(true) as SVGSVGElement;
			for (const [key, value] of Object.entries({
				x: '0',
				y: '0',
				width: '400',
				height: '400',
				fill: element.parentElement!.getAttribute('fill')!
			}))
				svg.setAttribute(key, value);
			const url = URL.createObjectURL(
				new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' })
			);
			try {
				const image = new Image();
				image.src = url;
				await image.decode();
				const canvas = document.createElement('canvas');
				canvas.width = canvas.height = 400;
				const ctx = canvas.getContext('2d')!;
				ctx.drawImage(image, 0, 0);
				const pixels = ctx.getImageData(0, 0, 400, 400).data;
				let holes = 0;
				let protrusions = 0;
				for (let y = 0; y < 400; y++)
					for (let x = 0; x < 400; x++) {
						const radius = Math.hypot(x + 0.5 - 200, y + 0.5 - 200);
						const alpha = pixels[(y * 400 + x) * 4 + 3];
						if (radius < 198 && alpha < 250) holes++;
						if (radius > 201 && alpha > 0) protrusions++;
					}
				return { holes, protrusions };
			} finally {
				URL.revokeObjectURL(url);
			}
		});
		expect(coverage, id).toEqual({ holes: 0, protrusions: 0 });
	}
	const geography = await page.evaluate((path) => {
		const ctx = document.createElement('canvas').getContext('2d')!;
		const land = new Path2D(path);
		return [
			[20, 0],
			[20, 50],
			[46, -20],
			[-20, 0],
			[0, 0]
		].map(([lon, lat]) => {
			const rad = Math.PI / 180;
			const lambda = (lon - 20) * rad,
				phi = lat * rad,
				phi0 = 15 * rad;
			const x = 50 + 50 * Math.cos(phi) * Math.sin(lambda);
			const y =
				50 -
				50 * (Math.cos(phi0) * Math.sin(phi) - Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda));
			return ctx.isPointInPath(land, x, y);
		});
	}, earthLandPath);
	expect(geography).toEqual([true, true, true, false, false]);
});
