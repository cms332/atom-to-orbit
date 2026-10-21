import { test, expect } from '@playwright/test';

test('public analytics records navigation and actions while stripping private URL values', async ({
	page,
	isMobile
}) => {
	const payloads: Array<Record<string, unknown>> = [];
	await page.addInitScript(() =>
		Object.defineProperty(navigator, 'webdriver', { get: () => false })
	);
	await page.route('https://a2o.kr/**', async (route) => {
		const url = new URL(route.request().url());
		await route.fulfill({
			response: await route.fetch({ url: `http://127.0.0.1:4173${url.pathname}${url.search}` })
		});
	});
	await page.route('https://stats.a2o.kr/script.js', (route) =>
		route.fulfill({
			contentType: 'application/javascript',
			body: `window.umami={track(transform){const payload=transform({url:location.href,hostname:location.hostname,website:document.querySelector('script[data-website-id]').dataset.websiteId}); return fetch('https://stats.a2o.kr/api/send',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});}};`
		})
	);
	await page.route('https://stats.a2o.kr/api/send', async (route) => {
		payloads.push(route.request().postDataJSON());
		await route.fulfill({ json: { ok: true }, headers: { 'Access-Control-Allow-Origin': '*' } });
	});
	await page.goto('https://a2o.kr/scale/?private=value#private');
	await expect.poll(() => payloads.filter((entry) => !entry.name).length).toBe(1);
	if (isMobile) await page.getByRole('combobox').first().selectOption('earth');
	else
		await page
			.getByRole('complementary', { name: '탐험 대상 선택' })
			.getByRole('button', { name: /^지구/ })
			.click();
	await expect
		.poll(() => payloads.some((entry) => entry.name === 'scale_target_select'))
		.toBe(true);
	expect(payloads.every((entry) => !String(entry.url).includes('private'))).toBe(true);
	await page.goto('https://a2o.kr/articles/why-earth-feels-still/');
	await page.getByRole('link', { name: '궤도 탐험에서 직접 보기', exact: false }).click();
	await expect
		.poll(() => payloads.some((entry) => entry.name === 'article_explorer_open'))
		.toBe(true);
	await expect(page.getByTestId('orbit-explorer')).toHaveAttribute('data-status', 'ready', {
		timeout: 30000
	});
	await page.getByRole('button', { name: '스토리', exact: true }).click();
	await expect
		.poll(() => payloads.filter((entry) => entry.name === 'orbit_story_start').length)
		.toBe(1);
	await page.getByRole('button', { name: '태양계', exact: true }).click();
	await expect.poll(() => payloads.some((entry) => entry.name === 'orbit_mode_change')).toBe(true);
});

test('development previews never load the tracker and visitors can opt out', async ({ page }) => {
	let trackerRequests = 0;
	page.on('request', (request) => {
		if (request.url().startsWith('https://stats.a2o.kr/')) trackerRequests++;
	});
	await page.goto('/');
	await page.getByText('방문 통계 안내', { exact: true }).click();
	await page.getByRole('button', { name: '이 브라우저의 통계 수집 중지' }).click();
	await page.waitForLoadState();
	await page.getByText('방문 통계 안내', { exact: true }).click();
	await expect(page.getByRole('button', { name: '이 브라우저의 통계 수집 허용' })).toBeVisible();
	expect(await page.evaluate(() => localStorage.getItem('umami.disabled'))).toBe('1');
	expect(trackerRequests).toBe(0);
});
