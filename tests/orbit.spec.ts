import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { orbitBodySizes } from '../src/lib/data/orbit-body-sizes';

const calmFinalRate = (0.169 / 1.5) * 0.8;

async function expectUncoveredBody(page: Page, body: 'sun' | 'earth') {
	const canvas = page.getByTestId('orbit-canvas');
	await expect(canvas).toHaveAttribute('data-transitioning', 'false');
	await expect
		.poll(async () =>
			canvas.evaluate((element, body) => {
				const data = (element as HTMLCanvasElement).dataset;
				const [x, y, width, height] = data.framingArea!.split(',').map(Number);
				const [sunX, sunY, radius] = data[`${body}Screen`]!.split(',').map(Number);
				const origin = element.getBoundingClientRect();
				const story = document.querySelector('.story')!.getBoundingClientRect();
				const scene = {
					left: origin.left + x,
					top: origin.top + y,
					right: origin.left + x + width,
					bottom: origin.top + y + height
				};
				const overlap =
					Math.min(scene.right, story.right) > Math.max(scene.left, story.left) &&
					Math.min(scene.bottom, story.bottom) > Math.max(scene.top, story.top);
				const minimumHeight = matchMedia('(max-height: 600px) and (min-width: 600px)').matches
					? 99
					: 179;
				return (
					!overlap &&
					height >= minimumHeight &&
					sunX - radius >= x &&
					sunX + radius <= x + width &&
					sunY - radius >= y &&
					sunY + radius <= y + height
				);
			}, body)
		)
		.toBe(true);
	await expect(
		page.getByRole('button', {
			name: `${body === 'sun' ? '태양' : '지구'} 가까이 보기`,
			exact: true
		})
	).toBeVisible();
}

const expectUncoveredSun = (page: Page) => expectUncoveredBody(page, 'sun');

async function expectExtendedPaths(page: Page) {
	const canvas = page.getByTestId('orbit-canvas');
	// Hide HTML without changing layout; paths must continue beyond the caption-safe area.
	const hide = await page.addStyleTag({
		content: '.bottom-ui,.stage-heading,.stage-actions,.orbit-labels{visibility:hidden!important}'
	});
	const screenshot = await canvas.screenshot();
	await hide.evaluate((element) => (element as HTMLStyleElement).remove());
	const extension = await canvas.evaluate(async (element, png) => {
		const image = new Image();
		image.src = `data:image/png;base64,${png}`;
		await image.decode();
		const probe = document.createElement('canvas');
		probe.width = image.width;
		probe.height = image.height;
		const context = probe.getContext('2d')!;
		context.drawImage(image, 0, 0);
		const pixels = context.getImageData(0, 0, image.width, image.height).data;
		const box = element.getBoundingClientRect();
		const [left, top, width, height] = (element as HTMLCanvasElement).dataset
			.framingArea!.split(',')
			.map(Number);
		let warm = 0;
		for (let y = 0; y < image.height; y++)
			for (let x = 0; x < image.width; x++) {
				const cssX = (x * box.width) / image.width,
					cssY = (y * box.height) / image.height;
				if (cssX >= left && cssX <= left + width && cssY >= top && cssY <= top + height) continue;
				const i = (y * image.width + x) * 4;
				if (pixels[i] > 30 && pixels[i] > pixels[i + 1] * 1.04 && pixels[i] > pixels[i + 2] * 1.04)
					warm++;
			}
		return warm;
	}, screenshot.toString('base64'));
	expect(extension).toBeGreaterThan(20);
}

async function expectPhysicalBodySizes(page: Page) {
	const canvas = page.getByTestId('orbit-canvas');
	await expect(canvas).toHaveAttribute('data-size-mode', 'physical');
	const radii = JSON.parse((await canvas.getAttribute('data-body-radii-au'))!) as Record<
		string,
		number
	>;
	expect(Object.keys(radii)).toHaveLength(9);
	for (const body of orbitBodySizes) expect(radii[body.id]).toBeCloseTo(body.radiusAU, 14);
	expect(radii.sun / radii.earth).toBeCloseTo(109.2, 1);
	const distance = await canvas.evaluate((element) => {
		const data = (element as HTMLCanvasElement).dataset;
		const camera = data.camera!.split(',').map(Number);
		const target = data.target!.split(',').map(Number);
		return Math.hypot(...camera.map((value, axis) => value - target[axis]));
	});
	expect(distance / radii.earth).toBeGreaterThan(3);
	expect(distance / radii.earth).toBeLessThan(12);
}

async function expectLiveTrace(page: Page, toleranceAU = 0.00001) {
	const frames = await page.getByTestId('orbit-canvas').evaluate(async (element) => {
		const data = (element as HTMLCanvasElement).dataset;
		const result: {
			age: number;
			gap: number;
			gapAU: number;
			closeUp: boolean;
			error: number;
			limited: boolean;
			points: number;
			limit: number;
		}[] = [];
		let previous = '';
		await new Promise<void>((resolve) => {
			function sample() {
				if (data.year !== previous) {
					previous = data.year!;
					const [x, y] = data.focusScreen!.split(',').map(Number);
					const [headX, headY] = data.traceHeadScreen!.split(',').map(Number);
					result.push({
						age: Number(data.year) - Number(data.traceYear),
						gap: Math.hypot(x - headX, y - headY),
						gapAU: Number(data.traceHeadGapAu),
						closeUp: data.preset === 'earth-journey',
						error: Number(data.traceProjectionError),
						limited: data.traceBudgetLimited === 'true',
						points: Number(data.traceSamplingPoints),
						limit: innerWidth < 768 ? 1025 : 2049
					});
				}
				if (result.length >= 8) resolve();
				else requestAnimationFrame(sample);
			}
			requestAnimationFrame(sample);
		});
		return result;
	});
	for (const sample of frames) {
		expect(sample.age).toBe(0);
		expect(sample.gap).toBeLessThan(0.05);
		expect(sample.gapAU).toBeLessThan(toleranceAU);
		if (sample.closeUp) {
			expect(sample.error).toBeLessThanOrEqual(0.351);
			expect(sample.limited).toBe(false);
			expect(sample.points).toBeLessThanOrEqual(sample.limit);
			expect(sample.points).toBeGreaterThan(2);
		}
	}
}

async function expectPausedStory(page: Page, title: string) {
	await expect(page.locator('.story h2')).toHaveText(title);
	const story = page.getByRole('button', { name: '스토리', exact: true });
	await expect(story).toHaveAttribute('aria-pressed', 'false');
	await expect(story).toHaveAttribute('data-active', 'true');
	await expect(story.locator('polygon')).toHaveCount(1);
	await expect(story.locator('rect')).toHaveCount(0);
	for (const name of ['태양계', '은하 궤적'])
		await expect(page.getByRole('button', { name, exact: true })).toHaveAttribute(
			'aria-pressed',
			'false'
		);
}

async function expectGalacticComposition(page: Page) {
	const canvas = page.getByTestId('orbit-canvas');
	await expect(canvas).toHaveAttribute('data-transitioning', 'false');
	const composition = await canvas.evaluate((element) => {
		const data = (element as HTMLCanvasElement).dataset;
		const [x, y, width, height] = data.framingArea!.split(',').map(Number);
		const [sunX, sunY, radius] = data.sunScreen!.split(',').map(Number);
		const [tailX, tailY] = data.trailStartScreen!.split(',').map(Number);
		return {
			inside:
				sunX - radius >= x &&
				sunX + radius <= x + width &&
				sunY - radius >= y &&
				sunY + radius <= y + height,
			portrait: width < height,
			sunX: (sunX - x) / width,
			sunY: (sunY - y) / height,
			horizontalSpan: (sunX - tailX) / width,
			verticalSpan: (sunY - tailY) / height
		};
	});
	expect(composition.inside).toBe(true);
	if (composition.portrait) {
		expect(composition.sunX).toBeGreaterThan(0.6);
		expect(composition.sunX).toBeLessThan(0.8);
		expect(composition.sunY).toBeGreaterThan(0.6);
		expect(composition.sunY).toBeLessThan(0.82);
		expect(composition.verticalSpan).toBeGreaterThan(0.25);
		expect(composition.horizontalSpan).toBeGreaterThan(0.25);
	} else {
		expect(composition.horizontalSpan).toBeGreaterThan(0.15);
		expect(composition.verticalSpan).toBeGreaterThan(0.05);
	}
}

test('continuous motion, three-button dock and inner-planet solar entry survive view changes and revisits', async ({
	page,
	isMobile
}, info) => {
	test.setTimeout(90000);
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => {
		if (m.type() === 'error') errors.push(m.text());
	});
	await page.goto('/orbit/');
	const panel = page.getByTestId('orbit-explorer');
	const canvas = page.getByTestId('orbit-canvas');
	await expect(panel).toHaveAttribute('data-status', 'ready', { timeout: 20000 });
	await expect(canvas).toHaveAttribute('data-camera-controls', isMobile ? 'trackball' : 'orbit');
	await expect(page.getByRole('navigation', { name: '궤도 보기' }).getByRole('button')).toHaveText([
		/스토리/,
		'태양계',
		'은하 궤적'
	]);
	await expect(page.getByRole('button', { name: /^(재생|일시 정지|3D 탐험 시작)$/ })).toHaveCount(
		0
	);
	await expect(canvas).toHaveAttribute('data-years-per-second', '0.169');
	await expectGalacticComposition(page);
	const initialTime = Number(await canvas.getAttribute('data-year'));
	const initialEarth = await canvas.getAttribute('data-earth-position');
	const initialSun = await canvas.getAttribute('data-sun-rotation');
	await page.waitForTimeout(650);
	expect(Number(await canvas.getAttribute('data-year')) - initialTime).toBeGreaterThan(0.02);
	expect(await canvas.getAttribute('data-earth-position')).not.toBe(initialEarth);
	expect(await canvas.getAttribute('data-sun-rotation')).not.toBe(initialSun);
	await page.screenshot({ path: `artifacts/orbit-continuous/${info.project.name}-entry.png` });
	for (let i = 0; i < 2; i++) {
		const before = Number(await canvas.getAttribute('data-year'));
		await page.getByRole('button', { name: '태양계', exact: true }).click();
		await expect(canvas).toHaveAttribute('data-frame', 'solar');
		await expect(canvas).toHaveAttribute('data-preset', 'inner');
		await expect(canvas).toHaveAttribute('data-transitioning', 'false', { timeout: 5000 });
		const solarCameraValue = await canvas.getAttribute('data-camera');
		const solarCamera = solarCameraValue!.split(',').map(Number);
		expect(Math.hypot(...solarCamera)).toBeLessThan(info.project.name === 'mobile' ? 13 : 6);
		expect(Number(await canvas.getAttribute('data-year')) - before).toBeGreaterThan(0);
		expect(Number(await canvas.getAttribute('data-year')) - before).toBeLessThan(1);
		if (i === 0)
			await page.screenshot({ path: `artifacts/orbit-continuous/${info.project.name}-solar.png` });
		await page.getByRole('button', { name: '은하 궤적', exact: true }).click();
		await expect(canvas).toHaveAttribute('data-frame', 'galactic');
		await expect(canvas).toHaveAttribute('data-preset', 'trail');
		await expect(canvas).toHaveAttribute('data-transitioning', 'false', { timeout: 5000 });
		expect(await canvas.getAttribute('data-camera')).not.toBe(solarCameraValue);
		await expectGalacticComposition(page);
	}
	await page.getByRole('button', { name: '설정', exact: true }).click();
	await page.getByRole('button', { name: '실제 속도 비율', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-speed-factor', '1');
	await page.getByRole('button', { name: '시각적 강조', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-speed-factor', '0.05');
	await page.getByLabel('이동 궤적', { exact: true }).uncheck();
	await expect(canvas).toHaveAttribute('data-trails', '0');
	await page.getByLabel('이동 궤적', { exact: true }).check();
	await page.getByLabel('시간 배속', { exact: true }).selectOption('0.5');
	await expect(canvas).toHaveAttribute('data-years-per-second', '0.845');
	await page.getByLabel('가까이 보기', { exact: true }).selectOption('earth');
	await expect(canvas).toHaveAttribute('data-focus', 'earth');
	await expect(canvas).toHaveAttribute('data-preset', 'track-earth');
	await expect(canvas).toHaveAttribute('data-transitioning', 'false', { timeout: 5000 });
	if (!isMobile) await page.getByRole('button', { name: '설정 닫기', exact: true }).click();
	await page.screenshot({ path: `artifacts/orbit-continuous/${info.project.name}-earth.png` });
	await page.getByRole('button', { name: '태양계', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-transitioning', 'false', { timeout: 5000 });
	await page.getByRole('button', { name: '설정', exact: true }).click();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('button', { name: '설정', exact: true })).toBeFocused();
	const keyCamera = await canvas.getAttribute('data-camera');
	await page.getByRole('button', { name: '3D 장면 조작', exact: true }).focus();
	await page.keyboard.press('ArrowLeft');
	await expect.poll(() => canvas.getAttribute('data-camera')).not.toBe(keyCamera);
	await page.getByRole('button', { name: '설정', exact: true }).focus();
	expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
	const mobile = info.project.name === 'mobile';
	if (mobile) await page.getByRole('button', { name: '메뉴', exact: true }).click();
	await page
		.getByRole('navigation', { name: mobile ? '모바일 탐색' : '주요 탐색', exact: true })
		.getByRole('link', { name: '과학 이야기 읽기', exact: false })
		.click();
	await expect(canvas).toHaveCount(0);
	if (mobile) await page.getByRole('button', { name: '메뉴', exact: true }).click();
	await page
		.getByRole('navigation', { name: mobile ? '모바일 탐색' : '주요 탐색', exact: true })
		.getByRole('link', { name: '궤도 탐험하기', exact: false })
		.click();
	await expect(panel).toHaveAttribute('data-status', 'ready');
	await expect(canvas).toHaveCount(1);
	await expect(canvas).toHaveAttribute('data-frame', 'galactic');
	await expect(canvas).toHaveAttribute('data-years-per-second', '0.169');
	await expectGalacticComposition(page);
	expect(errors).toEqual([]);
});

test('settings dismiss outside with mouse or touch while panel controls and the trigger keep working', async ({
	page,
	isMobile
}, info) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/orbit/');
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	const trigger = page.getByRole('button', { name: '설정', exact: true });
	const panel = page.getByRole('complementary', { name: '탐험 설정', exact: true });
	await trigger.click();
	await expect(panel).toBeVisible();
	await panel.getByRole('heading', { name: '탐험 설정', exact: true }).click();
	await expect(panel).toBeVisible();
	await page.getByLabel('공전 궤도', { exact: true }).uncheck();
	await page.getByLabel('공전 궤도', { exact: true }).check();
	await page.getByLabel('시간 배속', { exact: true }).selectOption('0.5');
	await expect(panel).toBeVisible();
	const target = page.getByLabel('가까이 보기', { exact: true });
	for (const id of ['earth', 'saturn']) {
		await target.focus();
		await target.selectOption(id);
		if (isMobile) {
			await expect(panel).toHaveCount(0);
			await expect(trigger).toHaveAttribute('aria-expanded', 'false');
			await expect(trigger).toBeFocused();
		} else {
			await expect(target).toHaveValue(id);
			await expect(target).toBeFocused();
			await expect(panel).toBeVisible();
			await expect(trigger).toHaveAttribute('aria-expanded', 'true');
		}
		await expect(page.getByTestId('orbit-canvas')).toHaveAttribute('data-preset', `track-${id}`);
		await expect(page.getByTestId('orbit-canvas')).toHaveAttribute('data-transitioning', 'false');
		if (id === 'saturn')
			await page.screenshot({
				path: `artifacts/orbit-settings-responsive/${info.project.name}-saturn.png`
			});
		if (isMobile) {
			await trigger.click();
			await expect(target).toHaveValue(id);
		}
	}
	const canvas = (await page.getByTestId('orbit-canvas').boundingBox())!;
	const outside = { x: canvas.x + 8, y: canvas.y + 120 };
	// A gesture beginning on a slider remains an in-panel interaction even if it ends outside.
	const range = (await page.getByLabel('모델 시각', { exact: false }).boundingBox())!;
	await page.mouse.move(range.x + range.width / 2, range.y + range.height / 2);
	await page.mouse.down();
	await page.mouse.move(outside.x, range.y + range.height / 2, { steps: 5 });
	await page.mouse.up();
	await expect(panel).toBeVisible();
	if (isMobile) await page.touchscreen.tap(outside.x, outside.y);
	else await page.mouse.click(outside.x, outside.y);
	await expect(panel).toHaveCount(0);
	await expect(trigger).toHaveAttribute('aria-expanded', 'false');
	await page.screenshot({
		path: `artifacts/orbit-settings-dismiss/${info.project.name}-outside-dismissed.png`
	});
	await trigger.click();
	await expect(panel).toBeVisible();
	await trigger.click();
	await expect(panel).toHaveCount(0);
	await trigger.click();
	await page.keyboard.press('Escape');
	await expect(panel).toHaveCount(0);
	await expect(trigger).toBeFocused();
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	await trigger.click();
	if (isMobile) await page.touchscreen.tap(outside.x, outside.y);
	else await page.mouse.click(outside.x, outside.y);
	await expect(panel).toHaveCount(0);
	await expect(page.locator('.story h2')).toHaveText('곁을 지나는 이웃들');
	await expect(page.getByRole('button', { name: '스토리', exact: true })).toHaveAttribute(
		'aria-pressed',
		'false'
	);
	await expect(page.getByTestId('orbit-canvas')).toHaveAttribute('data-preset', 'top');
	await trigger.click();
	await page.getByRole('button', { name: '설정 닫기', exact: true }).click();
	await expect(panel).toHaveCount(0);
	await expect(trigger).toBeFocused();
});

test('mobile gestures recover from mixed inputs, capture loss and cancellation without losing the story', async ({
	page,
	isMobile
}, info) => {
	test.skip(!isMobile, 'Actual touch input regression uses the mobile Chromium context.');
	test.setTimeout(60000);
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/orbit/');
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	const canvas = page.getByTestId('orbit-canvas');
	const cdp = await page.context().newCDPSession(page);
	const direction = () =>
		canvas.evaluate((element) => {
			const data = (element as HTMLCanvasElement).dataset;
			const camera = data.camera!.split(',').map(Number);
			const target = data.target!.split(',').map(Number);
			const delta = camera.map((v, axis) => v - target[axis]);
			const length = Math.hypot(...delta);
			return delta.map((v) => v / length);
		});
	const distance = () =>
		canvas.evaluate((element) => {
			const data = (element as HTMLCanvasElement).dataset;
			const camera = data.camera!.split(',').map(Number);
			const target = data.target!.split(',').map(Number);
			return Math.hypot(...camera.map((v, axis) => v - target[axis]));
		});
	async function point() {
		const box = (await canvas.boundingBox())!;
		const [x, y, w, h] = (await canvas.getAttribute('data-framing-area'))!.split(',').map(Number);
		return { x: box.x + x + w * 0.2, y: box.y + y + h * 0.4 };
	}
	async function drag() {
		const before = await direction();
		const p = await point();
		await cdp.send('Input.dispatchTouchEvent', {
			type: 'touchStart',
			touchPoints: [{ ...p, id: 10 }]
		});
		for (let step = 1; step <= 6; step++)
			await cdp.send('Input.dispatchTouchEvent', {
				type: 'touchMove',
				touchPoints: [{ x: p.x + step * 10, y: p.y + step * 3, id: 10 }]
			});
		await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
		await expect
			.poll(async () => Math.hypot(...(await direction()).map((v, axis) => v - before[axis])))
			.toBeGreaterThan(0.04);
	}
	// Repeated ordinary taps and drags must remain independent gestures.
	const p = await point();
	// Visible labels are part of the same drag surface; moving from a tag must not select it.
	const tagBefore = await direction();
	const tag = (await page
		.getByRole('button', { name: '태양 가까이 보기', exact: true })
		.boundingBox())!;
	const tagX = tag.x + tag.width / 2,
		tagY = tag.y + tag.height / 2;
	const tagPreset = await canvas.getAttribute('data-preset');
	await cdp.send('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [{ x: tagX, y: tagY, id: 10 }]
	});
	for (let step = 1; step <= 8; step++) {
		await cdp.send('Input.dispatchTouchEvent', {
			type: 'touchMove',
			touchPoints: [{ x: tagX - step * 7, y: tagY - step * 2, id: 10 }]
		});
		await page.waitForTimeout(40);
	}
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	await expect
		.poll(async () => Math.hypot(...(await direction()).map((v, axis) => v - tagBefore[axis])))
		.toBeGreaterThan(0.04);
	await expect(canvas).toHaveAttribute('data-preset', tagPreset!);
	await page.touchscreen.tap(p.x, p.y);
	await drag();
	await drag();
	// Continue over the old world-up poles instead of clamping at them.
	for (let sweep = 0; sweep < 2; sweep++) {
		const beforeUp = (await canvas.getAttribute('data-camera-up'))!.split(',').map(Number);
		const at = await point();
		await cdp.send('Input.dispatchTouchEvent', {
			type: 'touchStart',
			touchPoints: [{ ...at, id: 10 }]
		});
		for (let step = 1; step <= 10; step++) {
			await cdp.send('Input.dispatchTouchEvent', {
				type: 'touchMove',
				touchPoints: [{ x: at.x, y: at.y + step * 35, id: 10 }]
			});
			await page.waitForTimeout(40);
		}
		await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
		await expect
			.poll(async () =>
				(await canvas.getAttribute('data-camera-up'))!
					.split(',')
					.map(Number)
					.reduce((dot, value, axis) => dot + value * beforeUp[axis], 0)
			)
			.toBeLessThan(-0.3);
	}
	const portraitDirection = await direction();
	const portraitUp = await canvas.getAttribute('data-camera-up');
	await page.setViewportSize({ width: 844, height: 390 });
	await expect
		.poll(() => canvas.evaluate((element) => element.getBoundingClientRect().width))
		.toBe(844);
	await expect(canvas).toHaveAttribute('data-camera-up', portraitUp!);
	const landscapeDirection = await direction();
	expect(
		Math.hypot(...landscapeDirection.map((v, axis) => v - portraitDirection[axis]))
	).toBeLessThan(0.001);
	await page.setViewportSize({ width: 390, height: 844 });
	await expect
		.poll(() => canvas.evaluate((element) => element.getBoundingClientRect().width))
		.toBe(390);
	// Reproduce the reported undefined x: a mouse pointer has no touch coordinates.
	await page.mouse.move(p.x, p.y);
	await page.mouse.down();
	await drag();
	await page.mouse.up();
	// An explicit capture loss or window interruption must not poison the next drag.
	await page.mouse.down();
	await page.mouse.move(p.x + 1, p.y, { steps: 1 });
	await canvas.evaluate((element) => {
		const surface = element.parentElement!;
		if (surface.hasPointerCapture(1)) surface.releasePointerCapture(1);
	});
	await page.mouse.move(p.x + 2, p.y, { steps: 1 });
	await page.mouse.up();
	await drag();
	const beforeBlur = await direction();
	const presetBeforeBlur = await canvas.getAttribute('data-preset');
	await page.mouse.down();
	await page.evaluate(() => window.dispatchEvent(new Event('blur')));
	await page.mouse.up();
	await expect
		.poll(async () => Math.hypot(...(await direction()).map((v, axis) => v - beforeBlur[axis])))
		.toBeLessThan(0.001);
	await expect(canvas).toHaveAttribute('data-preset', presetBeforeBlur!);
	await drag();
	const cancelAt = await point();
	await cdp.send('Input.dispatchTouchEvent', {
		type: 'touchStart',
		touchPoints: [{ ...cancelAt, id: 10 }]
	});
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
	await drag();
	// Complete a native pinch, then start an independent one-finger rotation.
	const pinchAt = await point();
	const touches = (span: number) => [
		{ x: pinchAt.x, y: pinchAt.y, id: 10 },
		{ x: pinchAt.x + span, y: pinchAt.y, id: 11 }
	];
	const beforeZoom = await distance();
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: touches(40) });
	for (let span = 45; span <= 70; span += 5)
		await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touches(span) });
	await expect.poll(distance).toBeLessThan(beforeZoom * 0.9);
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	await drag();
	// A two-finger twist rolls around the viewing direction without requiring a world axis.
	const beforeTwist = (await canvas.getAttribute('data-camera-up'))!.split(',').map(Number);
	const center = await point();
	const twist = (angle: number) =>
		[-1, 1].map((side, index) => ({
			x: center.x + side * 30 * Math.cos(angle),
			y: center.y + side * 30 * Math.sin(angle),
			id: 10 + index
		}));
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: twist(0) });
	for (let step = 1; step <= 6; step++) {
		await cdp.send('Input.dispatchTouchEvent', {
			type: 'touchMove',
			touchPoints: twist((step * Math.PI) / 24)
		});
		await page.waitForTimeout(40);
	}
	await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	await expect
		.poll(async () =>
			(await canvas.getAttribute('data-camera-up'))!
				.split(',')
				.map(Number)
				.reduce((dot, value, axis) => dot + value * beforeTwist[axis], 0)
		)
		.toBeLessThan(0.9);
	const settledUp = await canvas.getAttribute('data-camera-up');
	await page.waitForTimeout(150);
	expect(await canvas.getAttribute('data-camera-up')).toBe(settledUp);
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	for (let chapter = 2; chapter <= 6; chapter++)
		await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expectUncoveredBody(page, 'earth');
	await expectPhysicalBodySizes(page);
	await drag();
	await expectPausedStory(page, '지구는 꿈을 싣고');
	await expect(canvas).toHaveAttribute('data-preset', 'earth-journey');
	await expect(canvas).toHaveAttribute('data-size-mode', 'physical');
	await expectLiveTrace(page, 1e-10);
	await page.getByRole('button', { name: '설정', exact: true }).click();
	const box = (await canvas.boundingBox())!;
	await page.touchscreen.tap(box.x + 4, box.y + 180);
	await expect(page.getByRole('complementary', { name: '탐험 설정', exact: true })).toHaveCount(0);
	await drag();
	await expectPausedStory(page, '지구는 꿈을 싣고');
	await page.screenshot({
		path: `artifacts/orbit-mobile-free-rotation/${info.project.name}-recovered.png`
	});
	await cdp.detach();
	expect(errors).toEqual([]);
});

test('story toggles progress and pause without leaving the current chapter or resetting its timer', async ({
	page
}, info) => {
	test.setTimeout(45000);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/orbit/');
	const canvas = page.getByTestId('orbit-canvas');
	const story = page.getByRole('button', { name: '스토리', exact: true });
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	await expect(story.locator('polygon')).toHaveCount(1);
	await story.click();
	await expect(story).toHaveAttribute('aria-pressed', 'true');
	await expect(story.locator('rect')).toHaveCount(2);
	for (let chapter = 2; chapter <= 3; chapter++)
		await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'trail');
	await expect(canvas).toHaveAttribute('data-transitioning', 'false');
	await page.waitForTimeout(4000);
	const camera = await canvas.getAttribute('data-camera');
	const frame = await canvas.getAttribute('data-frame');
	const area = await canvas.getAttribute('data-framing-area');
	const time = Number(await canvas.getAttribute('data-year'));
	const earth = await canvas.getAttribute('data-earth-position');
	await story.click();
	await expect(story).toHaveAttribute('aria-pressed', 'false');
	await expect(story).toHaveAttribute('data-active', 'true');
	await expect(story.locator('polygon')).toHaveCount(1);
	await expect(story.locator('rect')).toHaveCount(0);
	await page.screenshot({ path: `artifacts/orbit-story-pause/${info.project.name}-paused.png` });
	// Longer than a complete chapter: captions pause while the requested 3D motion continues.
	await page.waitForTimeout(12000);
	await expect(page.locator('.story h2')).toHaveText('태양과 함께, 은하 속으로');
	await expect(canvas).toHaveAttribute('data-preset', 'trail');
	await expect(canvas).toHaveAttribute('data-camera', camera!);
	await expect(canvas).toHaveAttribute('data-frame', frame!);
	await expect(canvas).toHaveAttribute('data-framing-area', area!);
	expect(Number(await canvas.getAttribute('data-year'))).toBeGreaterThan(time);
	expect(await canvas.getAttribute('data-earth-position')).not.toBe(earth);
	await story.click();
	await expect(story).toHaveAttribute('aria-pressed', 'true');
	await expect(story.locator('rect')).toHaveCount(2);
	// Resume the remaining ~5.2 seconds instead of starting a fresh 9.2-second chapter.
	await expect(page.locator('.story h2')).toHaveText('태양계의 다정한 동행', { timeout: 8500 });
	await story.click();
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expect(page.locator('.story h2')).toHaveText('멀리까지 이어지는 발자취');
	await expect(story).toHaveAttribute('aria-pressed', 'false');
	await expect(story.locator('polygon')).toHaveCount(1);
	await page.getByRole('button', { name: '태양계', exact: true }).click();
	await expect(page.locator('.story')).toHaveCount(0);
});

test('all six story chapters advance automatically with moving geometry under reduced motion', async ({
	page
}, info) => {
	test.setTimeout(100000);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/orbit/');
	const canvas = page.getByTestId('orbit-canvas');
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	const story = page.getByRole('button', { name: '스토리', exact: true });
	await story.click();
	const storyStart = Date.now();
	const chapterTimes = [{ chapter: 1, seconds: 0 }];
	await expect(canvas).toHaveAttribute('data-preset', 'focus-earth');
	const first = await canvas.screenshot();
	const firstTime = Number(await canvas.getAttribute('data-year'));
	await page.waitForTimeout(650);
	expect((await canvas.screenshot()).equals(first)).toBe(false);
	expect(Number(await canvas.getAttribute('data-year'))).toBeGreaterThan(firstTime);
	for (const [index, title, preset, frame, factor] of [
		[2, '곁을 지나는 이웃들', 'top', 'solar', '0.05'],
		[3, '태양과 함께, 은하 속으로', 'trail', 'galactic', '0.05'],
		[4, '태양계의 다정한 동행', 'journey', 'galactic', '0.05'],
		[5, '멀리까지 이어지는 발자취', 'trail', 'galactic', '1'],
		[6, '지구는 꿈을 싣고', 'earth-journey', 'galactic', '0.05']
	] as const) {
		// Deliberately no arrow clicks or Play interaction: the reported failure occurred here.
		await expect(page.locator('.story h2')).toHaveText(title, { timeout: 16000 });
		chapterTimes.push({ chapter: index, seconds: (Date.now() - storyStart) / 1000 });
		await expect(canvas).toHaveAttribute('data-preset', preset);
		await expect(canvas).toHaveAttribute('data-frame', frame);
		await expect(canvas).toHaveAttribute('data-speed-factor', factor);
		await expect(canvas).toHaveAttribute('data-transitioning', 'false');
		expect(Number(await canvas.getAttribute('data-years-per-second'))).toBeCloseTo(
			index === 6 ? calmFinalRate : index === 2 ? 0.169 / 1.5 : 0.169,
			8
		);
		const time = Number(await canvas.getAttribute('data-year'));
		const earth = await canvas.getAttribute('data-earth-position');
		const sun = await canvas.getAttribute('data-sun-rotation');
		await page.waitForTimeout(400);
		expect(Number(await canvas.getAttribute('data-year'))).toBeGreaterThan(time);
		expect(await canvas.getAttribute('data-earth-position')).not.toBe(earth);
		expect(await canvas.getAttribute('data-sun-rotation')).not.toBe(sun);
		if ([3, 5, 6].includes(index)) {
			await expectUncoveredBody(page, index === 6 ? 'earth' : 'sun');
			await page.screenshot({
				path: `artifacts/orbit-chapter-tuning/${info.project.name}-auto-story-${index}.png`
			});
		}
		if (index === 6) {
			await expect(story).toHaveAttribute('aria-pressed', 'true');
			await expect(story.locator('rect')).toHaveCount(2);
			const radius = Number((await canvas.getAttribute('data-earth-screen'))!.split(',')[2]);
			expect(radius).toBeGreaterThan(85);
			expect(radius).toBeLessThanOrEqual(145);
			await expectPhysicalBodySizes(page);
			const camera = (await canvas.getAttribute('data-camera'))!.split(',').map(Number);
			expect(Math.hypot(...camera)).toBeLessThan(12);
			for (const name of ['지구'])
				await expect(
					page.getByRole('button', { name: `${name} 가까이 보기`, exact: true })
				).toBeVisible();
		}
	}
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	const finalTime = Number(await canvas.getAttribute('data-year'));
	await page.waitForTimeout(400);
	expect(Number(await canvas.getAttribute('data-year'))).toBeGreaterThan(finalTime);
	await expect(page.locator('.story h2')).toHaveText('지구는 꿈을 싣고');
	// The last caption gets its full reading time before the replay action appears.
	await expect(story).toHaveAttribute('aria-pressed', 'false', { timeout: 11000 });
	await expect(story).toHaveAttribute('title', '스토리 처음부터 다시 보기');
	await expect(story.locator('polygon')).toHaveCount(1);
	await expect(story.locator('rect')).toHaveCount(0);
	await expect(page.locator('.story h2')).toHaveText('지구는 꿈을 싣고');
	await expect(canvas).toHaveAttribute('data-preset', 'earth-journey');
	const completedTime = Number(await canvas.getAttribute('data-year'));
	await page.waitForTimeout(500);
	expect(Number(await canvas.getAttribute('data-year'))).toBeGreaterThan(completedTime);
	await page.screenshot({
		path: `artifacts/orbit-story-replay/${info.project.name}-completed.png`
	});
	await story.click();
	await expect(page.locator('.story h2')).toHaveText('우리의 집 지구');
	await expect(story).toHaveAttribute('aria-pressed', 'true');
	await expect(story).toHaveAttribute('title', '스토리 일시 중지');
	await expect(story.locator('rect')).toHaveCount(2);
	await expect(canvas).toHaveAttribute('data-preset', 'focus-earth');
	await expect(canvas).toHaveAttribute('data-transitioning', 'false');
	await page.screenshot({
		path: `artifacts/orbit-story-replay/${info.project.name}-restarted.png`
	});
	await info.attach('automatic-chapter-timing', {
		body: JSON.stringify(chapterTimes),
		contentType: 'application/json'
	});
});

test('opening and final Earth views survive resize, follow motion and keep translucent story context', async ({
	page,
	isMobile
}, info) => {
	test.setTimeout(60000);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/orbit/');
	const canvas = page.getByTestId('orbit-canvas');
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	await expect(page.locator('.story h2')).toHaveText('우리의 집 지구');
	const focusDistance = () =>
		canvas.evaluate((element) => {
			const data = (element as HTMLCanvasElement).dataset;
			const position = data.camera!.split(',').map(Number);
			const target = data.target!.split(',').map(Number);
			return Math.hypot(...position.map((value, axis) => value - target[axis]));
		});
	await expect.poll(focusDistance).toBeLessThan(0.34);
	const originalArea = await canvas.getAttribute('data-framing-area');
	await page.setViewportSize({
		width: info.project.name === 'mobile' ? 360 : 1226,
		height: info.project.name === 'mobile' ? 844 : 1000
	});
	await expect.poll(() => canvas.getAttribute('data-framing-area')).not.toBe(originalArea);
	await expect.poll(focusDistance).toBeLessThan(0.36);
	await page.screenshot({ path: `artifacts/orbit-story-surface/${info.project.name}-opening.png` });
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expectUncoveredSun(page);
	const color = await page
		.locator('.story')
		.evaluate((element) => getComputedStyle(element).backgroundColor);
	expect(Number(color.match(/,\s*([\d.]+)\)$/)?.[1])).toBeLessThan(0.8);
	await page.screenshot({
		path: `artifacts/orbit-story-surface/${info.project.name}-translucent-story.png`
	});
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'trail');
	await expectUncoveredSun(page);
	await expectExtendedPaths(page);
	// The final Earth stays central while its neighbourhood continues moving.
	for (let chapter = 4; chapter <= 6; chapter++) {
		if (chapter === 6) await page.emulateMedia({ reducedMotion: 'no-preference' });
		await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	}
	await expect(canvas).toHaveAttribute('data-preset', 'earth-journey');
	await expectUncoveredBody(page, 'earth');
	await expect(canvas).toHaveAttribute('data-earth-camera', 'original-close');
	await expect(canvas).toHaveAttribute('data-trace-end-on-fade', 'true');
	await expect(canvas).toHaveAttribute('data-earth-orbit', 'false');
	await expect(canvas).toHaveAttribute('data-orbits', '7');
	await expect(page.locator('.story > p')).toHaveText(
		'다시 우리의 지구를 바라보세요. 지구에서 살아가는 모든 존재의 삶과 꿈을 싣고 지금도 고요한 여정을 이어가고 있습니다.'
	);
	await expect(page.locator('.scale-note')).toContainText('실제 크기·거리 비례');
	await expectPhysicalBodySizes(page);
	await expectLiveTrace(page, 1e-10);
	await page.screenshot({
		path: `artifacts/orbit-finale-trail-readability/${info.project.name}-applied.png`
	});
	const initialEarth = await canvas.getAttribute('data-earth-position');
	const initialScreen = (await canvas.getAttribute('data-earth-screen'))!.split(',').map(Number);
	expect(initialScreen[2]).toBeGreaterThan(85);
	expect(initialScreen[2]).toBeLessThanOrEqual(145);
	await expect
		.poll(async () => Number(await canvas.getAttribute('data-years-per-second')))
		.toBeCloseTo(calmFinalRate, 8);
	await page.waitForTimeout(1500);
	expect(await canvas.getAttribute('data-earth-position')).not.toBe(initialEarth);
	const movingScreen = (await canvas.getAttribute('data-earth-screen'))!.split(',').map(Number);
	for (const axis of [0, 1, 2]) expect(movingScreen[axis]).toBeCloseTo(initialScreen[axis], 1);
	await page.setViewportSize({ width: 320, height: 844 });
	for (let sample = 0; sample < 4; sample++) {
		await page.waitForTimeout(120);
		const centered = await canvas.evaluate((element) => {
			const data = (element as HTMLCanvasElement).dataset;
			const [x, y, width, height] = data.framingArea!.split(',').map(Number);
			const [earthX, earthY] = data.earthScreen!.split(',').map(Number);
			return Math.hypot(earthX - x - width / 2, earthY - y - height / 2);
		});
		expect(centered).toBeLessThan(1);
	}
	await expectUncoveredBody(page, 'earth');
	await expectLiveTrace(page, 1e-10);
	await expect(page.getByRole('button', { name: '스토리', exact: true })).toHaveAttribute(
		'title',
		'스토리 처음부터 다시 보기',
		{ timeout: 15000 }
	);
	const completedEarth = await canvas.getAttribute('data-earth-position');
	await expect
		.poll(async () => Number(await canvas.getAttribute('data-years-per-second')))
		.toBeCloseTo(calmFinalRate, 8);
	await page.waitForTimeout(500);
	expect(await canvas.getAttribute('data-earth-position')).not.toBe(completedEarth);
	await expectUncoveredBody(page, 'earth');
	await expectLiveTrace(page, 1e-10);
	await page.getByRole('button', { name: '3D 장면 조작', exact: true }).focus();
	await page.keyboard.press('ArrowRight');
	await expect(canvas).toHaveAttribute('data-preset', 'earth-journey');
	await expectLiveTrace(page, 1e-10);
	await expect(canvas).toHaveAttribute('data-earth-orbit', 'false');
	await page.screenshot({
		path: `artifacts/orbit-earth-free-camera/${info.project.name}-completed.png`
	});
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	await expect(page.locator('.story h2')).toHaveText('우리의 집 지구');
	await expect(canvas).toHaveAttribute('data-preset', 'focus-earth');
	await expect(page.getByRole('button', { name: '스토리', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await expect(canvas).toHaveAttribute('data-years-per-second', '0.169');
	await page.getByRole('button', { name: '은하 궤적', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'trail');
	await expect(canvas).toHaveAttribute('data-focus', '');
	await expect(canvas).toHaveAttribute('data-size-mode', 'illustrative');
	await expect(canvas).toHaveAttribute('data-trace-end-on-fade', 'false');
	await expect(canvas).toHaveAttribute('data-trace-suppressed-points', '0');
	await expect(canvas).toHaveAttribute('data-earth-orbit', 'true');
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	for (let chapter = 2; chapter <= 6; chapter++)
		await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expectUncoveredBody(page, 'earth');
	await expectPhysicalBodySizes(page);
	const [earthX, earthY] = (await canvas.getAttribute('data-earth-screen'))!.split(',').map(Number);
	const canvasBounds = (await canvas.boundingBox())!;
	if (isMobile) await page.touchscreen.tap(canvasBounds.x + earthX, canvasBounds.y + earthY);
	else await page.mouse.click(canvasBounds.x + earthX, canvasBounds.y + earthY);
	await expectPausedStory(page, '지구는 꿈을 싣고');
	await expect(canvas).toHaveAttribute('data-preset', 'track-earth');
	await expect(canvas).toHaveAttribute('data-size-mode', 'illustrative');
	await expect(canvas).toHaveAttribute('data-trace-end-on-fade', 'false');
	await expect(canvas).toHaveAttribute('data-trace-suppressed-points', '0');
	await expect(canvas).toHaveAttribute('data-transitioning', 'false');
});

test('chapter three reuses Galactic motion and chapter four preserves the former broadside journey', async ({
	page
}, info) => {
	await page.goto('/orbit/');
	const canvas = page.getByTestId('orbit-canvas');
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	await expect(canvas).toHaveAttribute('data-transitioning', 'false');
	const direction = () =>
		canvas.evaluate((element) => {
			const data = (element as HTMLCanvasElement).dataset;
			const target = data.target!.split(',').map(Number);
			const offset = data.camera!.split(',').map((v, i) => Number(v) - target[i]);
			const length = Math.hypot(...offset);
			return offset.map((value) => value / length);
		});
	const galacticDirection = await direction();
	const galacticRate = await canvas.getAttribute('data-years-per-second');
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expect
		.poll(async () => Number(await canvas.getAttribute('data-years-per-second')))
		.toBeCloseTo(0.169 / 1.5, 8);
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'trail');
	await expectUncoveredSun(page);
	// Caption space reduces the available height; measure against the shorter scene edge,
	// not the full window width used by the caption-free Galactic mode.
	const trailSpan = await canvas.evaluate((element) => {
		const data = (element as HTMLCanvasElement).dataset;
		const [, , width, height] = data.framingArea!.split(',').map(Number);
		const [sunX, sunY] = data.sunScreen!.split(',').map(Number);
		const [pastX, pastY] = data.trailStartScreen!.split(',').map(Number);
		return { x: sunX - pastX, y: sunY - pastY, edge: Math.min(width, height) };
	});
	expect(trailSpan.x).toBeGreaterThan(trailSpan.edge * 0.25);
	expect(trailSpan.y).toBeGreaterThan(trailSpan.edge * 0.1);
	await expect(canvas).toHaveAttribute('data-speed-factor', '0.05');
	await expect(canvas).toHaveAttribute('data-years-per-second', galacticRate!);
	(await direction()).forEach((value, axis) =>
		expect(value).toBeCloseTo(galacticDirection[axis], 7)
	);
	const before = await canvas.getAttribute('data-earth-position');
	await expect.poll(() => canvas.getAttribute('data-earth-position')).not.toBe(before);
	await page.screenshot({
		path: `artifacts/orbit-story-reorder/${info.project.name}-chapter3.png`
	});
	// A foreground planet can cross the disc; the explicit Sun name remains selectable.
	await page.getByRole('button', { name: '태양 가까이 보기', exact: true }).focus();
	await page.keyboard.press('Enter');
	await expectPausedStory(page, '태양과 함께, 은하 속으로');
	await expect(canvas).toHaveAttribute('data-preset', 'track-sun');
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'journey');
	await expectUncoveredSun(page);
	await expect(canvas).toHaveAttribute('data-years-per-second', '0.169');
	const composition = await canvas.evaluate((element) => {
		const data = (element as HTMLCanvasElement).dataset;
		const [x, y, width, height] = data.framingArea!.split(',').map(Number);
		const [sunX, sunY] = data.sunScreen!.split(',').map(Number);
		const [pastX, pastY] = data.trailStartScreen!.split(',').map(Number);
		return { sunX, sunY, pastX, pastY, x, y, width, height };
	});
	// Chapter 4 now inherits the former chapter-3 broadside framing and mobile inset.
	expect(composition.sunX).toBeGreaterThan(composition.x + composition.width * 0.55);
	if (info.project.name === 'mobile')
		expect(composition.sunX).toBeLessThan(composition.x + composition.width * 0.75);
	expect(composition.sunX - composition.pastX).toBeGreaterThan(composition.width * 0.2);
	expect(Math.abs(composition.sunY - composition.pastY)).toBeLessThan(
		(composition.sunX - composition.pastX) * 0.2
	);
	const journeyDirection = await direction();
	expect(
		Math.hypot(...journeyDirection.map((value, axis) => value - galacticDirection[axis]))
	).toBeGreaterThan(0.5);
	await page.screenshot({
		path: `artifacts/orbit-story-reorder/${info.project.name}-chapter4.png`
	});
	await page.getByRole('button', { name: '이전 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'trail');
	await expectUncoveredSun(page);
	await page.getByRole('button', { name: '은하 궤적', exact: true }).click();
	await expectGalacticComposition(page);
	await expect(canvas).toHaveAttribute('data-years-per-second', galacticRate!);
});

test('story framing adapts to tablet, landscape, chapter height and enlarged text', async ({
	page
}, info) => {
	test.setTimeout(60000);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.setViewportSize({ width: info.project.name === 'mobile' ? 390 : 650, height: 892 });
	await page.goto('/orbit/');
	const canvas = page.getByTestId('orbit-canvas');
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	for (let chapter = 2; chapter <= 5; chapter++) {
		await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
		if (![3, 4, 5].includes(chapter)) continue;
		await expectUncoveredSun(page);
		if (chapter === 4) {
			const framing = await canvas.evaluate((element) => {
				const data = (element as HTMLCanvasElement).dataset;
				return {
					area: data.framingArea!.split(',').map(Number),
					sun: data.sunScreen!.split(',').map(Number),
					past: data.trailStartScreen!.split(',').map(Number)
				};
			});
			expect(Math.abs(framing.sun[1] - framing.past[1])).toBeLessThan(
				(framing.sun[0] - framing.past[0]) * 0.2
			);
			await page.screenshot({
				path: `artifacts/orbit-story-reorder/${info.project.name}-responsive-chapter4.png`
			});
		}
		if (chapter === 5) {
			const framing = await canvas.evaluate((element) => {
				const data = (element as HTMLCanvasElement).dataset;
				return {
					area: data.framingArea!.split(',').map(Number),
					sun: data.sunScreen!.split(',').map(Number),
					past: data.trailStartScreen!.split(',').map(Number)
				};
			});
			const [x, y, width, height] = framing.area;
			expect(framing.sun[0]).toBeCloseTo(x + width * 0.77, 0);
			expect(framing.sun[1]).toBeCloseTo(y + height * 0.8, 0);
			expect(framing.past[0]).toBeLessThan(framing.sun[0]);
			expect(framing.past[1]).toBeLessThan(framing.sun[1]);
			const slope = (framing.sun[1] - framing.past[1]) / (framing.sun[0] - framing.past[0]);
			expect(slope).toBeGreaterThan(0.6);
			expect(slope).toBeLessThan(1.4);
			await expect(canvas).toHaveAttribute('data-speed-factor', '1');
		}
		await page.screenshot({
			path:
				chapter === 5
					? `artifacts/orbit-chapter5-lower-right/${info.project.name}-chapter5.png`
					: `artifacts/orbit-story-layout/${info.project.name}-reported-story-${chapter}.png`
		});
	}
	const before = Number(await canvas.getAttribute('data-year'));
	await page.setViewportSize({ width: 844, height: 390 });
	await expectUncoveredSun(page);
	await page.getByRole('button', { name: '설정', exact: true }).click({ trial: true });
	await page.screenshot({
		path: `artifacts/orbit-story-layout/${info.project.name}-landscape.png`
	});
	await page.setViewportSize({ width: info.project.name === 'mobile' ? 320 : 650, height: 892 });
	await page.addStyleTag({ content: '.story p,.story h2,.story-count{font-size:200% !important}' });
	await expectUncoveredSun(page);
	await page.screenshot({
		path: `artifacts/orbit-story-layout/${info.project.name}-large-story-text.png`,
		fullPage: true
	});
	// Both reassigned views must still fit when the portrait caption grows.
	await page.getByRole('button', { name: '이전 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'journey');
	await expectUncoveredSun(page);
	await page.screenshot({
		path: `artifacts/orbit-story-reorder/${info.project.name}-chapter4-large-text.png`,
		fullPage: true
	});
	await page.getByRole('button', { name: '이전 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'trail');
	await expectUncoveredSun(page);
	await page.screenshot({
		path: `artifacts/orbit-story-reorder/${info.project.name}-chapter3-large-text.png`,
		fullPage: true
	});
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
		)
	).toBe(true);
	expect(Number(await canvas.getAttribute('data-year'))).toBeGreaterThan(before);
	await page.getByRole('button', { name: '태양계', exact: true }).click();
	await expect(page.locator('.story')).toHaveCount(0);
	await expect(canvas).toHaveAttribute('data-preset', 'inner');
});

test('picking a celestial body pauses and retains its story chapter', async ({
	page,
	isMobile
}) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/orbit/');
	const canvas = page.getByTestId('orbit-canvas');
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'top');
	await expectUncoveredSun(page);
	const [x, y] = (await canvas.getAttribute('data-sun-screen'))!.split(',').map(Number);
	if (isMobile) await canvas.tap({ position: { x, y } });
	else await canvas.click({ position: { x, y } });
	await expectPausedStory(page, '곁을 지나는 이웃들');
	await expect(canvas).toHaveAttribute('data-preset', 'track-sun');
	await expect(page.getByRole('button', { name: '태양 가까이 보기', exact: true })).toBeVisible();
	await page.getByRole('button', { name: '태양계', exact: true }).click();
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'top');
	await expectUncoveredSun(page);
	// Reproduce Chromium's observed touch adjustment: a sphere tap is sent to
	// a nearby name tag even though its coordinates lie outside that tag.
	// Capture-only events isolate hit testing; native label gestures are tested above.
	await canvas.evaluate((element) => {
		const c = element as HTMLCanvasElement;
		const box = c.getBoundingClientRect();
		const [x, y] = c.dataset.sunScreen!.split(',').map(Number);
		const clientX = box.x + x,
			clientY = box.y + y;
		const tag = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-body-id]')).find(
			(tag) => {
				const b = tag.getBoundingClientRect();
				return (
					!tag.hidden &&
					tag.dataset.bodyId !== 'sun' &&
					!(clientX >= b.left && clientX <= b.right && clientY >= b.top && clientY <= b.bottom)
				);
			}
		)!;
		for (const type of ['pointerdown', 'pointerup'])
			tag.dispatchEvent(
				new PointerEvent(type, {
					bubbles: false,
					isPrimary: true,
					pointerType: 'touch',
					pointerId: 37,
					clientX,
					clientY
				})
			);
	});
	await expectPausedStory(page, '곁을 지나는 이웃들');
	await expect(canvas).toHaveAttribute('data-preset', 'track-sun');
	await page.getByRole('button', { name: '태양계', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'inner');
	// Address the named moving tag directly: a forced screen click can hit an overlapping neighbor.
	await page.getByRole('button', { name: '수성 가까이 보기', exact: true }).evaluate((tag) => {
		const box = tag.getBoundingClientRect();
		for (const type of ['pointerdown', 'pointerup'])
			tag.dispatchEvent(
				new PointerEvent(type, {
					bubbles: false,
					isPrimary: true,
					pointerType: 'mouse',
					pointerId: 45,
					clientX: box.x + box.width / 2,
					clientY: box.y + box.height / 2
				})
			);
	});
	await expect(canvas).toHaveAttribute('data-preset', 'track-mercury');
});

test('target tracking keeps every body and path while the selected body stays fixed and spins', async ({
	page,
	isMobile
}, info) => {
	test.setTimeout(120000);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/orbit/');
	const canvas = page.getByTestId('orbit-canvas');
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	const read = () =>
		canvas.evaluate((element) => {
			const data = (element as HTMLCanvasElement).dataset;
			return {
				camera: data.camera!.split(',').map(Number),
				target: data.target!.split(',').map(Number),
				position: data.focusPosition!.split(',').map(Number),
				screen: data.focusScreen!.split(',').map(Number),
				rotation: data.focusRotation,
				sun: data.sunScreen,
				earth: data.earthScreen,
				area: data.framingArea!.split(',').map(Number)
			};
		});
	await page.getByRole('button', { name: '설정', exact: true }).click();
	for (const id of [
		'sun',
		'mercury',
		'venus',
		'earth',
		'mars',
		'jupiter',
		'saturn',
		'uranus',
		'neptune'
	]) {
		if (isMobile && id !== 'sun')
			await page.getByRole('button', { name: '설정', exact: true }).click();
		const select = page.getByLabel('가까이 보기', { exact: true });
		if (id === 'sun') await expect(select).toHaveValue('');
		await select.focus();
		expect(await select.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('none');
		expect(await select.evaluate((element) => getComputedStyle(element).boxShadow)).toContain(
			'inset'
		);
		await select.selectOption(id);
		const settings = page.getByRole('complementary', { name: '탐험 설정', exact: true });
		if (isMobile) await expect(settings).toHaveCount(0);
		else await expect(settings).toBeVisible();
		await expect(canvas).toHaveAttribute('data-preset', `track-${id}`);
		await expect(canvas).toHaveAttribute('data-transitioning', 'false');
		await expect(canvas).toHaveAttribute('data-sun-visible', 'true');
		await expect(canvas).toHaveAttribute(
			'data-bodies',
			'mercury,venus,earth,mars,jupiter,saturn,uranus,neptune'
		);
		await expect(canvas).toHaveAttribute('data-trails', '8');
		await expect(canvas).toHaveAttribute('data-orbits', '8');
		await expect(canvas).toHaveAttribute('data-sun-trail', 'true');
		const before = await read();
		await page.waitForTimeout(650);
		await expectLiveTrace(page);
		const after = await read();
		const [x, y, width, height] = after.area;
		expect(after.screen[0]).toBeCloseTo(x + width / 2, 1);
		expect(after.screen[1]).toBeCloseTo(y + height / 2, 1);
		for (const axis of [0, 1, 2]) {
			expect(after.screen[axis]).toBeCloseTo(before.screen[axis], 1);
			expect(after.target[axis]).toBeCloseTo(after.position[axis], 7);
			expect(after.camera[axis] - before.camera[axis]).toBeCloseTo(
				after.position[axis] - before.position[axis],
				7
			);
		}
		expect(after.rotation).not.toBe(before.rotation);
		expect(id === 'sun' ? after.earth : after.sun).not.toBe(
			id === 'sun' ? before.earth : before.sun
		);
		if (['sun', 'earth', 'saturn'].includes(id))
			await page.screenshot({
				path: `artifacts/orbit-target-tracking/${info.project.name}-${id}.png`
			});
	}
	if (isMobile) await page.getByRole('button', { name: '설정', exact: true }).click();
	await page.getByLabel('가까이 보기', { exact: true }).selectOption('earth');
	await page.setViewportSize({ width: 320, height: 844 });
	await expect(canvas).toHaveAttribute('data-transitioning', 'false');
	await expect
		.poll(async () => Number((await canvas.getAttribute('data-focus-screen'))!.split(',')[0]))
		.toBeCloseTo(160, 1);
	const narrow = await read();
	expect(narrow.screen[0]).toBeCloseTo(160, 1);
	expect(narrow.screen[2]).toBeGreaterThan(30);
	expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
	if (!isMobile) await page.getByRole('button', { name: '설정 닫기', exact: true }).click();
	await page.getByRole('button', { name: '태양계', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-focus', '');
	await page.getByRole('button', { name: '설정', exact: true }).click();
	await page.getByLabel('가까이 보기', { exact: true }).selectOption('venus');
	await expect(canvas).toHaveAttribute('data-preset', 'track-venus');
	await expect(canvas).toHaveAttribute('data-frame', 'solar');
	await expect(canvas).toHaveAttribute(
		'data-bodies',
		'mercury,venus,earth,mars,jupiter,saturn,uranus,neptune'
	);
	await expect(canvas).toHaveAttribute('data-trails', '8');
	await expect(canvas).toHaveAttribute('data-sun-trail', 'false');
});

test('free story camera pauses the chapter, preserves its scene and resumes progress', async ({
	page,
	isMobile
}, info) => {
	test.setTimeout(70000);
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.goto('/orbit/');
	const canvas = page.getByTestId('orbit-canvas');
	const story = page.getByRole('button', { name: '스토리', exact: true });
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	await story.click();
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'top');
	await page.getByRole('button', { name: '이전 이야기', exact: true }).click();
	await expect(canvas).toHaveAttribute('data-preset', 'focus-earth');
	const cdp = isMobile ? await page.context().newCDPSession(page) : undefined;
	async function dragScene() {
		const box = (await canvas.boundingBox())!;
		const [x, y, width, height] = (await canvas.getAttribute('data-framing-area'))!
			.split(',')
			.map(Number);
		const startX = box.x + x + width * 0.28;
		const startY = box.y + y + height * 0.35;
		if (cdp) {
			await cdp.send('Input.dispatchTouchEvent', {
				type: 'touchStart',
				touchPoints: [{ x: startX, y: startY }]
			});
			for (let step = 1; step <= 8; step++)
				await cdp.send('Input.dispatchTouchEvent', {
					type: 'touchMove',
					touchPoints: [{ x: startX + (width * 0.18 * step) / 8, y: startY }]
				});
			await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
		} else {
			await page.mouse.move(startX, startY);
			await page.mouse.down();
			await page.mouse.move(startX + width * 0.18, startY, { steps: 8 });
			await page.mouse.up();
		}
	}
	await dragScene();
	await expectPausedStory(page, '우리의 집 지구');
	await expect(canvas).toHaveAttribute('data-frame', 'solar');
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await story.click();
	await expect(canvas).toHaveAttribute('data-preset', 'trail');
	const originalCamera = await canvas.getAttribute('data-camera');
	await dragScene();
	await expectPausedStory(page, '태양과 함께, 은하 속으로');
	await expect(canvas).toHaveAttribute('data-frame', 'galactic');
	await expect(canvas).not.toHaveAttribute('data-camera', originalCamera!);
	const time = Number(await canvas.getAttribute('data-year'));
	await page.waitForTimeout(12000);
	await expectPausedStory(page, '태양과 함께, 은하 속으로');
	expect(Number(await canvas.getAttribute('data-year'))).toBeGreaterThan(time);
	const cameraDistance = () =>
		canvas.evaluate((element) => {
			const data = (element as HTMLCanvasElement).dataset;
			const camera = data.camera!.split(',').map(Number);
			const target = data.target!.split(',').map(Number);
			return Math.hypot(...camera.map((value, axis) => value - target[axis]));
		});
	const beforeZoom = await cameraDistance();
	const box = (await canvas.boundingBox())!;
	const [x, y, width, height] = (await canvas.getAttribute('data-framing-area'))!
		.split(',')
		.map(Number);
	const zoomX = box.x + x + width / 2,
		zoomY = box.y + y + height / 2;
	if (cdp) {
		const touches = (span: number) => [
			{ x: zoomX - span, y: zoomY, id: 0 },
			{ x: zoomX + span, y: zoomY, id: 1 }
		];
		await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: touches(30) });
		for (let span = 35; span <= 60; span += 5)
			await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touches(span) });
		await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
	} else {
		await page.mouse.move(zoomX, zoomY);
		await page.mouse.wheel(0, -160);
	}
	await expect.poll(cameraDistance).toBeLessThan(beforeZoom * 0.99);
	await expectPausedStory(page, '태양과 함께, 은하 속으로');
	const sceneKeys = page.getByRole('button', { name: '3D 장면 조작', exact: true });
	await sceneKeys.focus();
	await page.keyboard.press('+');
	await page.keyboard.press('ArrowRight');
	await expectPausedStory(page, '태양과 함께, 은하 속으로');
	await page.screenshot({
		path: `artifacts/orbit-earth-free-camera/${info.project.name}-free-paused.png`
	});
	await story.click();
	await expect(story.locator('rect')).toHaveCount(2);
	await expect(page.locator('.story h2')).toHaveText('태양계의 다정한 동행', { timeout: 13000 });
	for (let chapter = 5; chapter <= 6; chapter++)
		await page.getByRole('button', { name: '다음 이야기', exact: true }).click();
	await expectUncoveredBody(page, 'earth');
	await dragScene();
	await expectPausedStory(page, '지구는 꿈을 싣고');
	await expect(canvas).toHaveAttribute('data-size-mode', 'physical');
	await expect(canvas).toHaveAttribute('data-preset', 'earth-journey');
	await expect
		.poll(async () => Number(await canvas.getAttribute('data-years-per-second')))
		.toBeCloseTo(calmFinalRate, 8);
	await cdp?.detach();
	await page.getByRole('button', { name: '설정', exact: true }).click();
	await page.getByLabel('모델 시각', { exact: false }).fill('39.99');
	await expect.poll(async () => Number(await canvas.getAttribute('data-year'))).toBeLessThan(1);
	const wrapped = Number(await canvas.getAttribute('data-year'));
	await page.waitForTimeout(500);
	expect(Number(await canvas.getAttribute('data-year'))).toBeGreaterThan(wrapped);
	await canvas.evaluate((c) =>
		c.dispatchEvent(new Event('webglcontextlost', { cancelable: true }))
	);
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'error');
	await expect(page.getByRole('button', { name: '다시 시도', exact: true })).toBeVisible();
});

test('scientific fallback survives missing JavaScript and missing WebGL', async ({
	browser,
	viewport,
	isMobile
}) => {
	const context = await browser.newContext({
		javaScriptEnabled: false,
		viewport,
		isMobile,
		hasTouch: isMobile
	});
	const page = await context.newPage();
	await page.goto('http://127.0.0.1:4173/orbit/');
	await expect(page.locator('noscript p')).toBeVisible();
	await page.getByText('이 장면의 과학적 근사와 출처', { exact: true }).click();
	await expect(page.locator('tbody tr')).toHaveCount(8);
	await context.close();
	const blocked = await browser.newContext({ viewport, isMobile, hasTouch: isMobile });
	await blocked.addInitScript(() => {
		const original = HTMLCanvasElement.prototype.getContext;
		Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
			value: function (this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
				return kind.includes('webgl') ? null : Reflect.apply(original, this, [kind, ...args]);
			}
		});
	});
	const blockedPage = await blocked.newPage();
	await blockedPage.goto('http://127.0.0.1:4173/orbit/');
	await expect(blockedPage.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'error');
	await expect(blockedPage.getByRole('button', { name: '다시 시도', exact: true })).toBeVisible();
	await blocked.close();
});

test('mobile dock, settings, navigation and enlarged text stay inside the viewport', async ({
	page,
	isMobile
}, info) => {
	await page.goto('/');
	await expect(page.locator('.hero-actions').getByRole('link')).toHaveText([
		'크기 탐험하기 ↗',
		'궤도 탐험하기 ↗',
		'과학 이야기 읽기 →'
	]);
	if (isMobile) await page.getByRole('button', { name: '메뉴', exact: true }).click();
	await page
		.getByRole('navigation', { name: isMobile ? '모바일 탐색' : '주요 탐색', exact: true })
		.getByRole('link', { name: '궤도 탐험하기', exact: false })
		.click();
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready');
	for (const width of isMobile ? [390, 320] : [1440, 1024, 768, 390, 320]) {
		await page.setViewportSize({ width, height: 900 });
		expect(
			await page.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
			)
		).toBe(true);
		const dock = (await page.getByRole('navigation', { name: '궤도 보기' }).boundingBox())!;
		expect(dock.x).toBeGreaterThanOrEqual(0);
		expect(dock.x + dock.width).toBeLessThanOrEqual(width);
	}
	await page.setViewportSize({ width: 844, height: 390 });
	const dock = (await page.getByRole('navigation', { name: '궤도 보기' }).boundingBox())!;
	expect(dock.y + dock.height).toBeLessThanOrEqual(390);
	await page.setViewportSize({ width: isMobile ? 390 : 1440, height: isMobile ? 844 : 1000 });
	await page.getByRole('button', { name: '설정', exact: true }).click();
	await page.addStyleTag({
		content: 'p,button,label,summary,h1,h2,select{font-size:200% !important}'
	});
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
		)
	).toBe(true);
	await page.screenshot({ path: `artifacts/orbit-continuous/${info.project.name}-large-text.png` });
});
