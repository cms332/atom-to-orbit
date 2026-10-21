import { readFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const before = JSON.parse(await readFile('artifacts/glyph-review/before/glyphs.json', 'utf8'));
const after = JSON.parse(await readFile('artifacts/glyph-review/after/glyphs.json', 'utf8'));
const browser = await chromium.launch();
try {
	const page = await browser.newPage({ viewport: { width: 940, height: 1100 } });
	const rows = ['table', 'whale', 'earth'].map((id) => {
		const old = before.find((item) => item.id === id);
		const current = after.find((item) => item.id === id);
		return `<section><h2>${current.name}</h2><div class="pair"><figure><figcaption>수정 전</figcaption>${old.svg}</figure><figure><figcaption>수정 후</figcaption>${current.svg}</figure></div></section>`;
	});
	await page.setContent(
		`<!doctype html><html lang="ko"><meta charset="UTF-8"><style>body{margin:0;padding:28px;background:#f7f8f4;color:#162a33;font:16px system-ui}h1{font-size:25px;margin:0 0 8px}p{font-size:13px;margin:0 0 20px}h2{font-size:17px;margin:18px 0 10px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0;border-radius:10px;background:#102832;color:#d4dfdc;padding:12px;text-align:center}figcaption{font-size:13px;text-align:left}svg{display:block;margin:auto}</style><h1>A2O · SVG 형태 개선</h1><p>대표 3개 비교 · 형태 확인용 개별 맞춤 배율</p>${rows.join('')}</html>`
	);
	await page.evaluate(
		() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
	);
	await page.screenshot({ path: 'artifacts/glyph-review/before-after.png', fullPage: true });
} finally {
	await browser.close();
}
