import { chromium } from '@playwright/test';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const allRefs = JSON.parse(await readFile('docs/scale-illustration-references.json', 'utf8'));
const selectedIds = process.env.A2O_SUBJECT_IDS?.split(',');
const refs = selectedIds ? allRefs.filter((ref) => selectedIds.includes(ref.id)) : allRefs;
const output = process.env.A2O_CAPTURE_DIR ?? 'artifacts/scale-expansion/references';
await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const results = [];
for (let offset = 0; offset < refs.length; offset += 5) {
	const group = refs.slice(offset, offset + 5);
	await page.setContent(
		`<style>body{font:16px system-ui;background:#eef1ed;margin:20px}main{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}figure{margin:0;background:white;padding:16px}img{width:100%;height:290px;object-fit:contain}figcaption{font-weight:700;margin-top:8px}</style><main>${group.map((r) => `<figure><img src="${r.image.replaceAll('&', '&amp;')}" alt="${r.id}"><figcaption>${r.id}</figcaption></figure>`).join('')}</main>`,
		{ waitUntil: 'domcontentloaded' }
	);
	await page.evaluate(async () => {
		await Promise.all(
			Array.from(document.images, (img) =>
				Promise.race([img.decode().catch(() => {}), new Promise((r) => setTimeout(r, 20000))])
			)
		);
	});
	results.push(
		...(await page.locator('img').evaluateAll((imgs) =>
			imgs.map((img) => ({
				id: img.alt,
				loaded: img.complete && img.naturalWidth > 0,
				width: img.naturalWidth
			}))
		))
	);
	await page.screenshot({
		path: `${output}/board-${offset / 5 + 1}.png`,
		fullPage: true
	});
}
await writeFile(`${output}/load-results.json`, JSON.stringify(results, null, 2));
console.log(JSON.stringify(results));
await browser.close();
