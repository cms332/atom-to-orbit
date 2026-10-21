import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';

const output = 'artifacts/lead-table-sun';
await mkdir(output, { recursive: true });
if (process.argv.includes('--reference-urls')) {
	const html = await (
		await fetch('https://www.butterfly-korea.co.kr/products/detail/centerfold.html')
	).text();
	console.log(
		[...html.matchAll(/(?:src|href)=["']([^"']+\.(?:jpg|png|webp))[^"']*["']/gi)].map(
			(match) =>
				new URL(match[1], 'https://www.butterfly-korea.co.kr/products/detail/centerfold.html').href
		)
	);
} else {
	const browser = await chromium.launch();
	try {
		const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
		const items = [];
		for (const id of ['lead', 'table', 'sun']) {
			await page.goto(
				(process.env.A2O_PREVIEW_URL ?? 'http://127.0.0.1:5173') + '/scale/?object=' + id
			);
			await page.waitForFunction((selected) => {
				const scene = document.querySelector('[data-testid="scale-scene"]');
				const body = scene?.querySelector(`[data-object="${selected}"]`);
				return (
					body &&
					Math.abs(
						Number(body.getAttribute('data-length')) -
							Number(scene.getAttribute('data-reference-pixels'))
					) < 1e-7
				);
			}, id);
			const svg = await page.locator(`[data-object="${id}"] > svg`).evaluate((el) => {
				const svg = el.cloneNode(true);
				svg.setAttribute('x', '0');
				svg.setAttribute('y', '0');
				svg.setAttribute('width', '380');
				svg.setAttribute('height', '260');
				svg.setAttribute('fill', el.parentElement.getAttribute('fill'));
				return new XMLSerializer().serializeToString(svg);
			});
			items.push({ id, svg });
			await page.locator('section.instrument').screenshot({ path: `${output}/desktop-${id}.png` });
		}
		await writeFile(`${output}/current.json`, JSON.stringify(items, null, 2));
		const old = JSON.parse(await readFile('artifacts/glyph-review/after/glyphs.json', 'utf8'));
		await page.setViewportSize({ width: 940, height: 1100 });
		await page.setContent(
			`<!doctype html><html lang="ko"><meta charset="UTF-8"><style>body{margin:0;padding:24px;background:#f7f8f4;font:16px system-ui;color:#162a33}h1{font-size:24px}p{font-size:13px}.row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}figure{padding:15px;margin:0;background:#102832;color:#c2d2d5;border-radius:12px}svg{display:block;margin:auto}h2{font-size:18px;margin:12px 0}</style><h1>샤프심 · 탁구대 · 태양</h1><p>왼쪽: 이전 / 오른쪽: 수정 · 형태 검토를 위한 개별 맞춤 배율</p>${items.map((item) => `<h2>${{ lead: '샤프심', table: '탁구대', sun: '태양' }[item.id]}</h2><div class="row"><figure>${old.find((o) => o.id === item.id).svg}</figure><figure>${item.svg}</figure></div>`).join('')}</html>`
		);
		await page.locator('figure > svg').evaluateAll((elements) => {
			for (const svg of elements) {
				svg.setAttribute('width', '380');
				svg.setAttribute('height', '260');
			}
		});
		await page.screenshot({ path: `${output}/comparison.png`, fullPage: true });
		await page.setViewportSize({ width: 390, height: 844 });
		for (const id of ['lead', 'table', 'sun']) {
			await page.goto(
				(process.env.A2O_PREVIEW_URL ?? 'http://127.0.0.1:5173') + '/scale/?object=' + id
			);
			await page.evaluate(() => document.fonts.ready);
			await page.waitForFunction((selected) => {
				const scene = document.querySelector('[data-testid="scale-scene"]');
				const body = scene?.querySelector(`[data-object="${selected}"]`);
				return (
					body &&
					Math.abs(
						Number(body.getAttribute('data-length')) -
							Number(scene.getAttribute('data-reference-pixels'))
					) < 1e-7
				);
			}, id);
			await page.locator('section.instrument').screenshot({ path: `${output}/mobile-${id}.png` });
		}
	} finally {
		await browser.close();
	}
}
