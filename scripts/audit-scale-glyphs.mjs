import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const base = process.env.A2O_PREVIEW_URL ?? 'http://127.0.0.1:5173';
const output = process.env.A2O_GLYPH_AUDIT_DIR ?? 'artifacts/glyph-review/before';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
try {
	const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
	const errors = [];
	page.on('pageerror', (error) => {
		errors.push(error.message);
		console.error(error.message);
	});
	await page.goto(base + '/scale/');
	const ids = await page
		.locator('#object-picker option')
		.evaluateAll((options) => options.map((option) => option.value));
	const studies = [];
	for (const id of ids) {
		console.log('Reviewing ' + id);
		await page.goto(base + '/scale/?object=' + id);
		await page.evaluate(() => document.fonts.ready);
		await page.waitForFunction((selected) => {
			const scene = document.querySelector('[data-testid="scale-scene"]');
			const body = scene?.querySelector('[data-object="' + selected + '"]');
			return (
				body &&
				Math.abs(
					Number(body.getAttribute('data-length')) -
						Number(scene.getAttribute('data-reference-pixels'))
				) < 1e-7
			);
		}, id);
		studies.push(
			await page.evaluate((id) => {
				const body = document.querySelector('[data-object="' + id + '"]');
				const svg = body.querySelector(':scope > svg').cloneNode(true);
				svg.setAttribute('x', '0');
				svg.setAttribute('y', '0');
				svg.setAttribute('width', '350');
				svg.setAttribute('height', '240');
				svg.setAttribute('fill', body.getAttribute('fill'));
				if (id === 'saturn') svg.setAttribute('viewBox', '-75 -30 250 160');
				const ids = Array.from(svg.querySelectorAll('[id]'), (el) => [el.id, id + '-' + el.id]);
				for (const el of [svg, ...svg.querySelectorAll('*')])
					for (const attribute of Array.from(el.attributes)) {
						let value = attribute.value;
						for (const [oldId, newId] of ids) {
							if (attribute.name === 'id' && value === oldId) value = newId;
							value = value.replaceAll('url(#' + oldId + ')', 'url(#' + newId + ')');
						}
						el.setAttribute(attribute.name, value);
					}
				return {
					id,
					name: document.querySelector('.readout-content h2').textContent,
					svg: new XMLSerializer().serializeToString(svg)
				};
			}, id)
		);
		if (studies.length % 6 === 0) console.log('Captured ' + studies.length + '/' + ids.length);
	}
	const board = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	for (let index = 0; index < studies.length; index += 6) {
		const group = studies.slice(index, index + 6);
		await board.setContent(
			'<!doctype html><html lang="ko"><meta charset="UTF-8"><style>body{margin:0;padding:28px;background:#f7f8f4;color:#162a33;font:16px system-ui}h1{font-size:23px;margin:0 0 8px}p{margin:0 0 20px;font-size:13px}main{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}figure{margin:0;background:#102832;color:#f4f6f2;padding:18px;border-radius:12px}figcaption{font-size:19px;margin-bottom:12px}.art{height:240px;display:grid;place-items:center}small{color:#c2d2d5}</style><h1>A2O · SVG 형태 검토 ' +
				(index + 1) +
				'–' +
				(index + group.length) +
				'</h1><p>실제 컴포넌트에서 추출 · 형태 확인용 개별 맞춤 배율 · 대상 간 크기 비교용 아님</p><main>' +
				group
					.map(
						(item) =>
							'<figure><figcaption>' +
							item.name +
							' <small>' +
							item.id +
							'</small></figcaption><div class="art">' +
							item.svg +
							'</div></figure>'
					)
					.join('') +
				'</main></html>'
		);
		await board.evaluate(
			() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
		);
		await board.screenshot({ path: output + '/group-' + (index / 6 + 1) + '.png', fullPage: true });
	}
	if (errors.length) throw new Error(errors.join('\n'));
	await writeFile(output + '/glyphs.json', JSON.stringify(studies, null, 2));
	console.log('Reviewed ' + studies.length + ' glyphs; no page errors.');
} finally {
	await browser.close();
}
