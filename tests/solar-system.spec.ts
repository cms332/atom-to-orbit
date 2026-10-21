import { test, expect } from '@playwright/test';
import { objects } from '../src/lib/data/science';
import { PLANET_IDS } from '../src/lib/data/science-planets';
import { sceneReference } from '../src/lib/utils/scale-scene';

test('all eight planets use diameter order and Saturn rings extend beyond the measured disc', async ({
	page
}, testInfo) => {
	await page.goto('/scale/?object=saturn');
	const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
	await expect(panel.getByRole('heading', { name: '토성', exact: true })).toBeVisible();
	await expect(page.getByTestId('selected-value')).toHaveText('1.16 × 10⁸ m');
	const body = page.locator('[data-object=saturn]');
	await expect(body.locator('svg')).toHaveAttribute('overflow', 'visible');
	const disc = body.getByTestId('planet-disc');
	const sceneBox = (await page.getByTestId('scale-scene').boundingBox())!;
	await expect
		.poll(async () => (await disc.boundingBox())!.width)
		.toBeCloseTo(sceneReference(sceneBox.width), 1);
	const rings = body.getByTestId('saturn-rings');
	expect((await rings.boundingBox())!.width / (await disc.boundingBox())!.width).toBeGreaterThan(2);
	const ringBox = (await rings.boundingBox())!;
	expect(ringBox.x).toBeGreaterThan(sceneBox.x + 8);
	expect(ringBox.x + ringBox.width).toBeLessThan(sceneBox.x + sceneBox.width - 8);
	const tableNames = await page.locator('tbody th').allTextContents();
	const names = objects
		.filter((o) => (PLANET_IDS as readonly string[]).includes(o.id))
		.map((o) => o.nameKo);
	expect(tableNames.filter((name) => names.includes(name))).toEqual([
		'수성',
		'화성',
		'금성',
		'지구',
		'해왕성',
		'천왕성',
		'토성',
		'목성'
	]);
	expect(tableNames).toContain('화성의 위성 포보스');
	expect(tableNames).toContain('소행성 베스타');
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
		)
	).toBe(true);
	await panel.screenshot({ path: `artifacts/solar-system/${testInfo.project.name}-saturn.png` });
});
