import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'artifacts/continuous-playback';
const base = process.env.A2O_PREVIEW_URL ?? 'http://127.0.0.1:5173';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
	for (const setup of [
		{ name: 'desktop', width: 1440, height: 1000, motion: 'no-preference', route: '/' },
		{
			name: '625-reduced',
			width: 625,
			height: 892,
			motion: 'reduce',
			route: '/scale/?object=ecoli'
		},
		{
			name: 'mobile-reduced',
			width: 390,
			height: 844,
			motion: 'reduce',
			route: '/scale/?object=ecoli'
		}
	]) {
		const context = await browser.newContext({
			viewport: { width: setup.width, height: setup.height },
			reducedMotion: setup.motion,
			recordVideo: {
				dir: `${output}/raw-video`,
				size: { width: setup.width, height: setup.height }
			}
		});
		const page = await context.newPage();
		page.setDefaultTimeout(15000);
		const video = page.video();
		const errors = [];
		page.on('pageerror', (error) => errors.push(error.message));
		await page.goto(`${base}${setup.route}`);
		await page.evaluate(() => document.fonts.ready);
		const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
		// Off-screen microscopic bodies are intentionally culled at the initial Earth camera.
		await panel.getByRole('button', { name: '자동 재생', exact: true }).click();
		const atom = Math.log10(
			Number(await panel.locator('[data-object="atom"]').getAttribute('data-meters'))
		);
		const dna = Math.log10(
			Number(await panel.locator('[data-object="dna"]').getAttribute('data-meters'))
		);
		await panel.evaluate((element) =>
			window.scrollTo(0, scrollY + element.getBoundingClientRect().top)
		);
		await page.waitForFunction(
			({ atom, dna }) => {
				const cursor = Number(document.querySelector('input[type="range"]').value);
				return cursor > atom + (dna - atom) * 0.2 && cursor < atom + (dna - atom) * 0.6;
			},
			{ atom, dna }
		);
		await panel.screenshot({ path: `${output}/${setup.name}-between-1.png` });
		const frames = await page.evaluate(async () => {
			const frames = [];
			const started = performance.now();
			do {
				await new Promise(requestAnimationFrame);
				frames.push({
					time: performance.now() - started,
					exponent: Number(document.querySelector('input[type="range"]').value),
					atom: Number(document.querySelector('[data-object="atom"]').getAttribute('data-length'))
				});
			} while (performance.now() - started < 300);
			return frames;
		});
		if (new Set(frames.map((frame) => frame.exponent)).size < 5)
			throw new Error(`${setup.name}: camera did not move continuously`);
		for (let index = 1; index < frames.length; index++) {
			const before = frames[index - 1];
			const after = frames[index];
			if (after.exponent < before.exponent || after.atom > before.atom)
				throw new Error(`${setup.name}: camera or SVG reversed`);
		}
		await panel.screenshot({ path: `${output}/${setup.name}-between-2.png` });
		await page.waitForFunction(
			(dna) => Math.abs(Number(document.querySelector('input[type="range"]').value) - dna) < 1e-10,
			dna
		);
		await page.waitForTimeout(400);
		const held = Number(await panel.getByRole('slider').inputValue());
		if (Math.abs(held - dna) > 1e-10) throw new Error(`${setup.name}: DNA did not hold`);
		await panel.screenshot({ path: `${output}/${setup.name}-dna-hold.png` });
		await panel.getByRole('button', { name: '일시 정지', exact: true }).click();
		const paused = await panel.getByRole('slider').inputValue();
		await page.waitForTimeout(200);
		if ((await panel.getByRole('slider').inputValue()) !== paused)
			throw new Error(`${setup.name}: pause did not stop the camera`);
		if (errors.length) throw new Error(JSON.stringify(errors));
		results.push({ ...setup, frames, held, paused, errors });
		await context.close();
		await video.saveAs(`${output}/${setup.name}.webm`);
		await video.delete();
	}
	await writeFile(`${output}/live-samples.json`, JSON.stringify({ base, results }, null, 2));
	console.log(
		JSON.stringify(
			results.map(({ name, frames, errors }) => ({ name, samples: frames.length, errors }))
		)
	);
} finally {
	await browser.close();
}
