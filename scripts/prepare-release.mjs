import { readFile, writeFile, readdir, access } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import path from 'node:path';

const release = JSON.parse(await readFile('release.json', 'utf8'));
if (!/^\d{8}T\d{6}Z$/.test(release.release) || !/^[a-f0-9]{40}$/.test(release.commit))
	throw new Error('Missing real release/commit metadata');
for (const file of [
	'index.html',
	'orbit/index.html',
	'scale/index.html',
	'articles/index.html',
	'fonts/OFL.txt',
	'licenses/orbit-textures.txt',
	'licenses/three-MIT.txt',
	'licenses/erfa-icrs2g.txt'
])
	await access(path.join('build', file));
await writeFile(
	'build/build-info.json',
	JSON.stringify(
		{
			release: release.release,
			commit: release.commit,
			sourceSha256: release.sourceSha256,
			builtAt: new Date().toISOString()
		},
		null,
		2
	) + '\n'
);
async function compress(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const file = path.join(dir, entry.name);
		if (entry.isDirectory()) await compress(file);
		else if (/\.(html|js|css|json|svg|xml|txt)$/.test(entry.name)) {
			const source = await readFile(file);
			const packed = gzipSync(source, { level: 9 });
			if (packed.length < source.length) await writeFile(file + '.gz', packed);
		}
	}
}
await compress('build');
console.log(`Prepared static release ${release.release} at ${release.commit}`);
