import { test, expect } from '@playwright/test';

test('finale omits the crossing Earth reference guide throughout an orbit and restores it outside the close-up', async ({
	page,
	isMobile
}, info) => {
	test.setTimeout(60000);
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.clock.install({ time: new Date('2026-10-21T00:00:00Z') });
	await page.goto('/orbit/');
	const canvas = page.getByTestId('orbit-canvas');
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	await page.clock.pauseAt(new Date('2026-10-21T01:00:00Z'));
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	for (let chapter = 2; chapter <= 6; chapter++) {
		await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
		await page.clock.runFor(64);
	}
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	const samples = [];
	for (let sample = 0; sample < 12; sample++) {
		await page.clock.runFor(1000);
		await expect(canvas).toHaveAttribute('data-preset', 'earth-journey');
		await expect(canvas).toHaveAttribute('data-earth-orbit', 'false');
		await expect(canvas).toHaveAttribute('data-orbits', '7');
		await expect(canvas).toHaveAttribute('data-trails', '8');
		await expect(canvas).toHaveAttribute('data-sun-trail', 'true');
		await expect(canvas).toHaveAttribute('data-size-mode', 'physical');
		const data = await canvas.evaluate((element) => ({
			...(element as HTMLCanvasElement).dataset
		}));
		expect(Number(data.traceHeadGapAu)).toBeLessThan(1e-10);
		samples.push(data);
		if ([0, 5, 11].includes(sample))
			await page.screenshot({
				path: `artifacts/orbit-ghost-lines/${info.project.name}-fixed-${sample}.png`
			});
	}
	expect(Number(samples.at(-1)!.year) - Number(samples[0].year)).toBeGreaterThan(0.9);
	await info.attach('finale-orbit-samples', {
		body: JSON.stringify(samples),
		contentType: 'application/json'
	});
	await page.getByRole('button', { name: '설정', exact: true }).click();
	await page.getByLabel('공전 궤도', { exact: true }).uncheck();
	await page.clock.runFor(64);
	await expect(canvas).toHaveAttribute('data-orbits', '0');
	await page.getByLabel('공전 궤도', { exact: true }).check();
	await page.clock.runFor(64);
	await expect(canvas).toHaveAttribute('data-earth-orbit', 'false');
	await expect(canvas).toHaveAttribute('data-orbits', '7');
	await page.getByRole('button', { name: '설정 닫기', exact: true }).click();
	await page.getByRole('button', { name: '은하 궤적', exact: true }).click();
	await page.clock.runFor(64);
	await expect(canvas).toHaveAttribute('data-earth-orbit', 'true');
	await expect(canvas).toHaveAttribute('data-orbits', '8');
	await page.getByRole('button', { name: '설정', exact: true }).click();
	await page.getByLabel('가까이 보기', { exact: true }).selectOption('earth');
	await page.clock.runFor(64);
	await expect(canvas).toHaveAttribute('data-preset', 'track-earth');
	await expect(canvas).toHaveAttribute('data-earth-orbit', 'true');
	await expect(canvas).toHaveAttribute('data-orbits', '8');
	if (!isMobile)
		await expect(page.getByRole('complementary', { name: '탐험 설정', exact: true })).toBeVisible();
	expect(errors).toEqual([]);
});
