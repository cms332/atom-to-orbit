import { test, expect } from '@playwright/test';
const route = '/articles/why-moon-shows-same-face/';
test('half orbit faces Earth only in the rotating model', async ({ page }) => {
	await page.goto(route);
	const half = page.getByRole('button', { name: '반 바퀴', exact: true });
	await half.focus();
	await half.press('Enter');
	const directions = await page.locator('.lab [data-moon]').evaluateAll((groups) =>
		groups.map((group) => {
			const m = (group as SVGGraphicsElement).transform.baseVal.consolidate()!.matrix;
			const center = new DOMPoint(0, 0).matrixTransform(m),
				mark = new DOMPoint(-14, 0).matrixTransform(m);
			return Math.sign((mark.x - center.x) * -center.x + (mark.y - center.y) * -center.y);
		})
	);
	expect(directions).toEqual([1, -1]);
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.getByRole('button', { name: '▶ 재생' }).click();
	await expect(page.getByRole('button', { name: 'Ⅱ 일시정지' })).toBeVisible();
	await page.evaluate(() => {
		Object.defineProperty(document, 'hidden', { value: true, configurable: true });
		document.dispatchEvent(new Event('visibilitychange'));
	});
	await expect(page.getByRole('button', { name: '▶ 재생' })).toBeVisible();
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await expect(page.getByRole('button', { name: '▶ 재생' })).toHaveCount(0);
	for (const width of [320, 390, 768, 1440]) {
		await page.setViewportSize({ width, height: 900 });
		await half.click();
		expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
			true
		);
		for (const [name, selector] of [
			['rotation', '.lab'],
			['light', '.lights'],
			['quiz', 'aside:has-text("내가 달이라면?")']
		]) {
			await page.locator(selector).screenshot({ path: `artifacts/moon-face/${width}-${name}.png` });
		}
	}
});
test('static comparison and quiz work without JavaScript', async ({ browser, baseURL }) => {
	const page = await browser.newPage({ javaScriptEnabled: false, baseURL });
	await page.goto(route);
	await page.getByText('다섯 장면을 글로 비교하기').click();
	await expect(page.getByText(/가상의 달 표식은 다섯 장면/)).toBeVisible();
	await page.getByText('생각한 뒤 정답 보기').click();
	await expect(page.getByText(/한 바퀴예요!/)).toBeVisible();
	await page.close();
});

test('one orbit takes twelve seconds and ends at one revolution', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'no-preference' });
	await page.goto(route);
	await page.clock.install();
	const slider = page.locator('.lab input');
	await page.getByRole('button', { name: '▶ 재생' }).click();
	await page.clock.runFor(6000);
	expect(Number(await slider.inputValue())).toBeCloseTo(0.5, 1);
	await page.getByRole('button', { name: 'Ⅱ 일시정지' }).click();
	const paused = await slider.inputValue();
	await page.clock.fastForward(1000);
	expect(await slider.inputValue()).toBe(paused);
	await page.getByRole('button', { name: '▶ 재생' }).click();
	await page.clock.runFor(6100);
	await expect(slider).toHaveValue('1');
	await expect(page.getByRole('button', { name: '▶ 재생' })).toBeVisible();
	await page.getByRole('button', { name: '처음으로' }).click();
	await expect(slider).toHaveValue('0');
});
