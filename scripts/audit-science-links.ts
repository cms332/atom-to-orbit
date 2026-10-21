import { sources } from '../src/lib/data/science';
import refs from '../docs/scale-illustration-references.json';
import { mkdir, writeFile } from 'node:fs/promises';
const urls = [...new Set([...sources.map((s) => s.url), ...refs.map((r) => r.page)])];
const output = process.env.A2O_AUDIT_OUTPUT ?? 'artifacts/scale-expansion';
const results: {
	url: string;
	status?: number;
	finalURL?: string;
	challenge?: boolean;
	error?: string;
}[] = [];
for (let offset = 0; offset < urls.length; offset += 4) {
	results.push(
		...(await Promise.all(
			urls.slice(offset, offset + 4).map(async (url) => {
				try {
					const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
					const result = { url, status: response.status, finalURL: response.url, challenge: false };
					if (response.headers.get('content-type')?.includes('text/html')) {
						const text = await response.text();
						result.challenge =
							/Checking your browser|Verify you are human|recaptcha challenge/i.test(text);
					} else await response.body?.cancel();
					return result;
				} catch (error) {
					return { url, error: String(error) };
				}
			})
		))
	);
}
await mkdir(output, { recursive: true });
await writeFile(
	`${output}/source-link-audit.json`,
	JSON.stringify(
		{
			checkedAt: new Date().toISOString(),
			scientificSources: sources.length,
			illustrationReferences: refs.length,
			results
		},
		null,
		2
	)
);
console.log(
	JSON.stringify(
		{ urls: urls.length, issues: results.filter((r) => r.status !== 200 || r.challenge) },
		null,
		2
	)
);
