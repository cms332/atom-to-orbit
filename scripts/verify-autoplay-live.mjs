import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const output = 'artifacts/autoplay';
const base = process.env.A2O_PREVIEW_URL ?? 'http://127.0.0.1:5173';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
	const page = await browser.newPage({
		viewport: { width: 1014, height: 892 },
		reducedMotion: 'no-preference'
	});
	page.setDefaultTimeout(15000);
	page.setDefaultNavigationTimeout(15000);
	const errors = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto(base);
	const panel = page.getByRole('region', { name: '로그 스케일 탐험기' });
	await panel.getByRole('button', { name: '자동 재생', exact: true }).click();
	const started = await page.evaluate(() => performance.now());
	const states = [];
	async function sample(stage) {
		states.push(
			await page.evaluate(
				({ stage, started }) => ({
					stage,
					elapsed: performance.now() - started,
					exponent: Number(document.querySelector('input[type="range"]').value),
					name: document.querySelector('.readout-content h2').textContent
				}),
				{ stage, started }
			)
		);
	}
	await sample('start');
	const atom = Number(await panel.locator('[data-object="atom"]').getAttribute('data-meters'));
	const atomExponent = Math.log10(atom);
	await page.waitForFunction(
		(value) =>
			Math.abs(Number(document.querySelector('input[type="range"]').value) - value) < 1e-10,
		atomExponent
	);
	await sample('atom-arrival');
	// This intentionally samples real elapsed animation time, without installing a fake clock.
	await page.waitForTimeout(400);
	await sample('atom-hold');
	if (Math.abs(states.at(-1).exponent - atomExponent) > 1e-10) throw new Error('Atom did not hold');
	await page.waitForFunction(
		(value) => Number(document.querySelector('input[type="range"]').value) > value + 0.1,
		atomExponent
	);
	await sample('moving-to-dna');
	await page.waitForFunction(() => {
		const dna = document.querySelector('[data-object="dna"]');
		return (
			dna &&
			Math.abs(
				Number(document.querySelector('input[type="range"]').value) -
					Math.log10(Number(dna.getAttribute('data-meters')))
			) < 1e-10
		);
	});
	await sample('dna-arrival');
	await panel.getByRole('button', { name: '일시 정지', exact: true }).click();
	const paused = await panel.getByRole('slider').inputValue();
	await page.waitForTimeout(300);
	if ((await panel.getByRole('slider').inputValue()) !== paused)
		throw new Error('Playback did not pause');
	const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
	if (errors.length || overflow) throw new Error(JSON.stringify({ errors, overflow }));
	await panel.screenshot({ path: `${output}/live-1014-dna.png` });
	await writeFile(
		`${output}/live-timing.json`,
		JSON.stringify(
			{ base, viewport: { width: 1014, height: 892 }, states, errors, overflow },
			null,
			2
		)
	);
	console.log(JSON.stringify({ stages: states.length, errors, overflow }));
} finally {
	await browser.close();
}
