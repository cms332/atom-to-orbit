import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const folder = 'artifacts/glyph-review/references';
await mkdir(folder, { recursive: true });
const sources = JSON.parse(await readFile('docs/scale-illustration-references.json', 'utf8'));
sources.push(
	{
		id: 'table',
		page: 'https://freesvg.org/table-tennis-table',
		image: 'https://freesvg.org/img/table-tennis-table.png'
	},
	{
		id: 'jupiter',
		page: 'https://science.nasa.gov/jupiter/',
		image: 'https://science.nasa.gov/wp-content/uploads/2024/03/jupiter-marble-pia22946.jpg?w=900'
	},
	{
		id: 'moon',
		page: 'https://science.nasa.gov/moon/moon-phases/',
		image: 'https://science.nasa.gov/wp-content/uploads/2023/08/full.jpg'
	}
);
const results = await Promise.all(
	sources.map(async (source) => {
		try {
			const response = await fetch(source.image, { signal: AbortSignal.timeout(30000) });
			if (!response.ok) throw new Error(String(response.status));
			const type = response.headers.get('content-type');
			if (!type?.startsWith('image/')) throw new Error(type);
			const bytes = Buffer.from(await response.arrayBuffer());
			const extension = type.includes('svg') ? 'svg' : type.includes('png') ? 'png' : 'jpg';
			await writeFile(`${folder}/${source.id}.${extension}`, bytes);
			return {
				...source,
				local: `${folder}/${source.id}.${extension}`,
				data: `data:${type};base64,${bytes.toString('base64')}`
			};
		} catch (error) {
			return { ...source, error: error.message };
		}
	})
);
await writeFile(
	`${folder}/sources.json`,
	JSON.stringify(
		results.map((item) => ({
			id: item.id,
			page: item.page,
			image: item.image,
			local: item.local,
			error: item.error
		})),
		null,
		2
	)
);
const browser = await chromium.launch();
try {
	const page = await browser.newPage({ viewport: { width: 1500, height: 1100 } });
	const good = results.filter((item) => item.data);
	for (let start = 0; start < good.length; start += 6) {
		await page.setContent(
			`<!doctype html><html><meta charset="UTF-8"><style>body{margin:0;padding:24px;background:#eee;font:20px system-ui}main{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}figure{margin:0;background:white;padding:15px}img{width:100%;height:390px;object-fit:contain}figcaption{margin-top:10px}</style><main>${good
				.slice(start, start + 6)
				.map(
					(item) => `<figure><img src="${item.data}"><figcaption>${item.id}</figcaption></figure>`
				)
				.join('')}</main></html>`
		);
		await page
			.locator('img')
			.evaluateAll((images) => Promise.all(images.map((img) => img.decode())));
		await page.screenshot({ path: `${folder}/board-${start / 6 + 1}.png`, fullPage: true });
	}
} finally {
	await browser.close();
}
console.log(
	JSON.stringify(
		results.map(({ id, error }) => ({ id, error })),
		null,
		2
	)
);
