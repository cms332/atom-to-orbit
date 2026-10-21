import { test, expect, type Locator } from '@playwright/test';
import { objects } from '../src/lib/data/science';
import { MAX_EXPONENT, MIN_EXPONENT, objectLength, scientific } from '../src/lib/utils/scales';
import { OBJECT_HOLD_MS, playbackPlan } from '../src/lib/utils/scale-playback';

const stops = objects.map((object) => Math.log10(object.meters));
async function expectCursor(slider: Locator, exponent: number) {
	// Native range values are serialized with fewer digits than the JS source exponent.
	await expect.poll(async () => Number(await slider.inputValue())).toBeCloseTo(exponent, 12);
}

test('reduced motion moves the full explorer slider, ruler and SVG through intermediate sizes', async ({
	page
}, testInfo) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.clock.install();
	await page.goto('/scale/?object=ecoli');
	const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
	const play = panel.getByRole('button', { name: '자동 재생', exact: true });
	const slider = panel.getByRole('slider');
	await expect(play).toBeEnabled();
	await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 1000)));
	await play.click();
	const leg = playbackPlan(MIN_EXPONENT, stops, true)[1];
	const travel = leg.arrival - leg.start;
	await page.clock.runFor(leg.start + Math.round(travel * 0.1));
	const frames: { exponent: number; cursor: number; atom: number }[] = [];
	for (let index = 0; index < 6; index++) {
		frames.push({
			exponent: Number(await slider.inputValue()),
			cursor: parseFloat((await panel.getByTestId('axis-cursor').getAttribute('d'))!.slice(1)),
			atom: Number(await panel.locator('[data-object="atom"]').getAttribute('data-length'))
		});
		if (index < 5) await page.clock.runFor(Math.round(travel * 0.1));
	}
	for (const [index, frame] of frames.entries()) {
		expect(frame.exponent).toBeGreaterThan(stops[0]);
		expect(frame.exponent).toBeLessThan(stops[1]);
		if (index) {
			const before = frames[index - 1];
			expect(frame.exponent).toBeGreaterThan(before.exponent);
			expect(frame.cursor).toBeGreaterThan(before.cursor);
			expect(frame.atom).toBeLessThan(before.atom);
			expect(before.atom / frame.atom).toBeCloseTo(10 ** (frame.exponent - before.exponent), 9);
		}
	}
	await panel.screenshot({
		path: `artifacts/continuous-playback/${testInfo.project.name}-moving.png`
	});
	await page.clock.runFor(Math.round(travel * 0.4) + 100);
	await expectCursor(slider, stops[1]);
	await page.clock.runFor(OBJECT_HOLD_MS / 2);
	await expectCursor(slider, stops[1]);
	await panel.getByRole('button', { name: '일시 정지', exact: true }).click();
});

test('tour moves, holds, pauses, resumes and yields to manual navigation on both explorers', async ({
	page,
	isMobile
}, testInfo) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.clock.install();
	for (const route of ['/', '/scale/?object=earth']) {
		await page.goto(route);
		await page.evaluate(() => document.fonts.ready);
		const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
		const play = panel.getByRole('button', { name: '자동 재생', exact: true });
		const pause = panel.getByRole('button', { name: '일시 정지', exact: true });
		const slider = panel.getByRole('slider');
		await expect(play).toBeEnabled();
		const historyLength = await page.evaluate(() => history.length);
		await expect(panel.getByTestId('scale-scene')).toHaveAttribute(
			'data-reference-pixels',
			testInfo.project.name === 'desktop' ? '180' : '120'
		);
		await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 1000)));
		await expect(page.getByText('키로 이동', { exact: false })).toHaveCount(0);
		await play.click();
		await expect(pause).toBeVisible();
		await expect(slider).toHaveValue(String(MIN_EXPONENT));
		await page.clock.runFor(350);
		const moving = Number(await slider.inputValue());
		expect(moving).toBeGreaterThan(MIN_EXPONENT);
		expect(moving).toBeLessThan(stops[0]);
		await page.clock.runFor(400);
		await expectCursor(slider, stops[0]);
		await page.clock.fastForward(1000);
		await expectCursor(slider, stops[0]);
		await panel.screenshot({
			path: `artifacts/autoplay/${testInfo.project.name}-${route === '/' ? 'home' : 'scale'}-playing-atom.png`
		});
		await page.clock.fastForward(600);
		expect(Number(await slider.inputValue())).toBeGreaterThan(stops[0]);
		await pause.click();
		await expect(play).toBeVisible();
		if (route !== '/') {
			await page.clock.resume();
			await expect(page).toHaveURL(/at=/);
			await expectCursor(slider, Number(new URL(page.url()).searchParams.get('at')));
			await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 1000)));
		}
		const paused = await slider.inputValue();
		await page.clock.fastForward(5000);
		await expect(slider).toHaveValue(paused);
		await play.click();
		expect(Number(await slider.inputValue())).toBeCloseTo(Number(paused), 2);
		await page.clock.fastForward(900);
		expect(Number(await slider.inputValue())).toBeGreaterThan(Number(paused));
		const previousUrl = page.url();
		const box = (await slider.boundingBox())!;
		await slider.click({ position: { x: box.width * 0.6, y: box.height / 2 } });
		await expect(play).toBeVisible();
		if (route !== '/') {
			await page.clock.resume();
			await expect(page).not.toHaveURL(previousUrl);
			await expectCursor(slider, Number(new URL(page.url()).searchParams.get('at')));
			await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 1000)));
		}
		const pointerValue = await slider.inputValue();
		await page.clock.fastForward(5000);
		await expect(slider).toHaveValue(pointerValue);
		await slider.focus();
		await slider.press('End');
		await expect(play).toBeVisible();
		await expect(slider).toHaveValue(String(MAX_EXPONENT));
		if (route !== '/') {
			await page.clock.resume();
			await expect(page).toHaveURL(/\/scale\/\?object=sun$/);
			await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 1000)));
		}
		await page.clock.fastForward(5000);
		await expect(slider).toHaveValue(String(MAX_EXPONENT));
		await play.click();
		await expect(slider).toHaveValue(String(MIN_EXPONENT));
		const duration = playbackPlan(MIN_EXPONENT, stops).at(-1)!.end;
		await page.clock.fastForward(duration + 100);
		await expect(play).toBeVisible();
		await expect(slider).toHaveValue(String(MAX_EXPONENT));
		await expect(panel.getByTestId('selected-value')).toHaveText(
			scientific(objects.at(-1)!.meters)
		);
		if (route !== '/') await expect(page).toHaveURL(/\/scale\/\?object=sun$/);
		expect(await page.evaluate(() => history.length)).toBe(historyLength);
		await panel.getByText('SCALE EXPLORER', { exact: true }).click();
		await panel.screenshot({
			path: `artifacts/autoplay/${testInfo.project.name}-${route === '/' ? 'home' : 'scale'}-complete-sun.png`
		});
		await play.click();
		await page.clock.fastForward(500);
		await page.clock.resume();
		if (isMobile) {
			await page.getByRole('button', { name: '메뉴', exact: true }).click();
			await page
				.getByRole('navigation', { name: '모바일 탐색' })
				.getByRole('link', { name: '과학 이야기 읽기', exact: true })
				.click();
		} else
			await page
				.getByRole('banner')
				.getByRole('link', { name: '과학 이야기 읽기', exact: true })
				.click();
		await expect(page).toHaveURL(/\/articles\/$/);
		await page.clock.fastForward(100000);
		await page.clock.resume();
	}
	expect(errors).toEqual([]);
});

test('reduced motion retains continuous travel, manual control and concrete entry points', async ({
	page
}, testInfo) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.clock.install();
	await page.goto('/');
	const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
	const play = panel.getByRole('button', { name: '자동 재생', exact: true });
	const slider = panel.getByRole('slider');
	await expect(play).toBeEnabled();
	const starts = page.getByRole('region', { name: '어디에서 시작할까요?' });
	await expect(page.locator('.scale-primer')).toHaveCount(0);
	await expect(starts.getByRole('link')).toHaveCount(3);
	for (const id of ['dna', 'ball', 'earth']) {
		const object = objects.find((item) => item.id === id)!;
		const link = starts.locator(`a[href="/scale/?object=${id}"]`);
		await expect(link).toContainText(object.measurement);
		await expect(link).toContainText(
			`${object.approximation === 'standard' ? '' : '약 '}${objectLength(object)}`
		);
	}
	await starts.screenshot({ path: `artifacts/autoplay/${testInfo.project.name}-entry-points.png` });
	await page.clock.pauseAt(new Date(await page.evaluate(() => Date.now() + 1000)));
	const reducedPlan = playbackPlan(MIN_EXPONENT, stops, true);
	await play.click();
	await expectCursor(slider, MIN_EXPONENT);
	await page.clock.runFor(reducedPlan[0].arrival + 50);
	await expectCursor(slider, stops[0]);
	await page.clock.fastForward(OBJECT_HOLD_MS / 2);
	await expectCursor(slider, stops[0]);
	await page.clock.runFor(OBJECT_HOLD_MS / 2 + 200);
	const moving = Number(await slider.inputValue());
	expect(moving).toBeGreaterThan(stops[0]);
	expect(moving).toBeLessThan(stops[1]);
	await slider.focus();
	await slider.press('ArrowRight');
	await expect(play).toBeVisible();
	const manual = await slider.inputValue();
	await page.clock.fastForward(5000);
	await expect(slider).toHaveValue(manual);
	await play.click();
	await page.clock.runFor(20);
	const beforeHidden = await slider.inputValue();
	await page.evaluate(() => {
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
		document.dispatchEvent(new Event('visibilitychange'));
		Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
	});
	await expect(play).toBeVisible();
	await page.clock.fastForward(5000);
	await expect(slider).toHaveValue(beforeHidden);
	await page.clock.resume();
	await starts.getByRole('link', { name: 'DNA는 얼마나 가늘까?', exact: true }).click();
	await expect(page).toHaveURL(/\/scale\/\?object=dna$/);
	await expect(page.getByTestId('selected-value')).toHaveText(
		scientific(objects.find((object) => object.id === 'dna')!.meters)
	);
	await expect(page.getByRole('button', { name: '자동 재생', exact: true })).toBeVisible();
});
