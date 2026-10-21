import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const commit = git('rev-parse', 'HEAD');
if (git('status', '--porcelain'))
	throw new Error('Commit or preserve pending work before deploying');
const release = new Date()
	.toISOString()
	.replace(/[-:]/g, '')
	.replace(/\.\d+Z$/, 'Z');
const stage = path.resolve('.tmp/deploy', release);
await mkdir(stage, { recursive: true });
for (const file of [
	'src',
	'static',
	'deploy',
	'scripts/prepare-release.mjs',
	'docs/scale-illustration-references.json',
	'package.json',
	'bun.lock',
	'svelte.config.js',
	'vite.config.ts',
	'tsconfig.json'
]) {
	const destination = path.join(stage, file);
	await mkdir(path.dirname(destination), { recursive: true });
	await cp(file, destination, { recursive: true });
}
const files = [];
async function walk(dir) {
	for (const entry of await readdir(dir, { withFileTypes: true })) {
		const file = path.join(dir, entry.name);
		if (entry.isDirectory()) await walk(file);
		else files.push(file);
	}
}
await walk(stage);
const hash = createHash('sha256');
for (const file of files.sort()) {
	hash.update(path.relative(stage, file).replaceAll('\\', '/') + '\0');
	hash.update(await readFile(file));
}
const metadata = {
	release,
	commit,
	sourceSha256: hash.digest('hex'),
	packagedAt: new Date().toISOString()
};
await writeFile(path.join(stage, 'release.json'), JSON.stringify(metadata, null, 2) + '\n');
await mkdir(path.join(stage, 'retained-immutable'));
const archive = path.resolve('.tmp/deploy', `${release}.tar.gz`);
execFileSync('tar', ['-czf', archive, '-C', stage, '.']);
await writeFile('.tmp/deploy/latest.json', JSON.stringify({ ...metadata, archive }, null, 2));
console.log(JSON.stringify({ ...metadata, archive }, null, 2));
