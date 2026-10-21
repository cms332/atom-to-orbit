import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const allRefs = JSON.parse(await readFile('docs/scale-illustration-references.json', 'utf8'));
const refs = process.env.A2O_SUBJECT_IDS
	? process.env.A2O_SUBJECT_IDS.split(',').map((id) => ({ id }))
	: allRefs;
const output = process.env.A2O_CAPTURE_DIR ?? 'artifacts/scale-expansion';
const title = process.env.A2O_CAPTURE_TITLE ?? `${refs.length}개 크기 기준`;
const base = process.env.A2O_PREVIEW_URL ?? 'http://127.0.0.1:4173';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const audit = [];
for (const [device, width] of [
	['desktop', 1440],
	['mobile', 390]
]) {
	const context = await browser.newContext({
		viewport: { width, height: 1000 },
		isMobile: device === 'mobile',
		hasTouch: device === 'mobile'
	});
	const page = await context.newPage();
	const errors = [];
	page.on('pageerror', (error) => errors.push(error.message));
	const studies = [];
	for (const ref of refs) {
		await page.goto(`${base}/scale/?object=${ref.id}`);
		await page.evaluate(() => document.fonts.ready);
		// A target may already be visible behind the SSR default object. Wait for URL hydration.
		await page.waitForFunction((id) => {
			const scene = document.querySelector('[data-testid="scale-scene"]');
			const body = scene?.querySelector(`[data-object="${id}"]`);
			return (
				body &&
				Math.abs(scene.viewBox.baseVal.width - Math.max(200, scene.clientWidth)) < 1e-7 &&
				Math.abs(
					Number(body.getAttribute('data-length')) -
						Number(scene.getAttribute('data-reference-pixels'))
				) < 1e-7
			);
		}, ref.id);
		await page.evaluate(
			() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
		);
		const details = await page.evaluate(() => {
			const panel = document.querySelector('.instrument');
			return {
				name: panel.querySelector('.readout-content h2').textContent,
				measurement: panel.querySelector('.value .readout-content .small-label').textContent,
				value: panel.querySelector('.converted').textContent,
				svg: document.querySelector('[data-testid="scale-scene"]').outerHTML,
				overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
			};
		});
		audit.push({
			device,
			id: ref.id,
			selectedName: details.name,
			baseURL: base,
			overflow: details.overflow
		});
		studies.push(details);
		if (['dna', 'whale', 'iss', 'tower'].includes(ref.id) || process.env.A2O_SUBJECT_IDS)
			await page
				.locator('.instrument')
				.screenshot({ path: `${output}/${device}-${ref.id}-final.png` });
	}
	const gallery = await context.newPage();
	await gallery.setViewportSize({
		width: 1440,
		height: Math.min(1100, 100 + Math.ceil(refs.length / 3) * 250)
	});
	await gallery.setContent(
		`<style>body{margin:0;background:#f7f8f4;font-family:system-ui,sans-serif;color:#162a33;padding:32px}h1{font-size:25px;margin:0 0 24px}main{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}figure{margin:0;background:#102832;color:#f4f6f2;border-radius:12px;padding:18px;overflow:hidden}figure svg{width:100%;height:125px;display:block}figcaption{font-size:17px;font-weight:700;margin-bottom:6px}p{font-size:11px;color:#c2d2d5;margin:4px 0}text{font-family:monospace}</style><h1>A2O · ${title} · ${device === 'mobile' ? '모바일' : '데스크톱'} 실제 탐험 화면</h1><main>${studies.map((s) => `<figure><figcaption>${s.name}</figcaption><p>${s.measurement}</p>${s.svg}<p>${s.value}</p></figure>`).join('')}</main>`
	);
	await gallery.screenshot({ path: `${output}/${device}-gallery.png`, fullPage: true });
	if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
	await context.close();
}
await writeFile(`${output}/display-audit.json`, JSON.stringify(audit, null, 2));
console.log(
	JSON.stringify({
		subjects: refs.length,
		pages: audit.length,
		overflow: audit.filter((r) => r.overflow)
	})
);
await browser.close();
