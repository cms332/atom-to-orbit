// Runs through SSH stdin inside the existing NPM container. Scope: A2O hosts only.
import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve4 } from 'node:dns/promises';
import db from '/app/db.js';
import proxy from '/app/internal/proxy-host.js';
import cert from '/app/internal/certificate.js';
import users from '/app/models/user.js';
import hosts from '/app/models/proxy_host.js';
import certificates from '/app/models/certificate.js';

const domains = ['a2o.kr', 'www.a2o.kr'];
const action = process.argv[2];
let host;
async function otherConfigs() {
	const result = {};
	for (const file of (await readdir('/data/nginx/proxy_host')).sort()) {
		if (!/^\d+\.conf$/.test(file) || file === `${host?.id}.conf`) continue;
		result[file] = createHash('sha256')
			.update(await readFile(`/data/nginx/proxy_host/${file}`))
			.digest('hex');
	}
	return result;
}
try {
	const matches = (await hosts.query().where({ is_deleted: 0 })).filter((h) =>
		h.domain_names.some((d) => domains.includes(d))
	);
	if (matches.length > 1 || matches.some((h) => h.domain_names.some((d) => !domains.includes(d))))
		throw new Error('A2O domains overlap another proxy host; refusing shared-host changes');
	host = matches[0];
	const before = await otherConfigs();
	const admin = (await users.query().where({ is_deleted: 0, is_disabled: 0 })).find((u) =>
		u.roles.includes('admin')
	);
	if (!admin) throw new Error('No existing NPM administrator');
	const access = {
		can: async () => ({ permission_visibility: 'all' }),
		token: { getUserId: () => admin.id }
	};
	if (action === 'switch') {
		const target = process.argv[3];
		if (!/^a2o-\d{8}T\d{6}Z$/.test(target)) throw new Error('Invalid A2O release target');
		const response = await fetch(`http://${target}:8080/healthz`);
		if (!response.ok || (await response.json()).release !== target.slice(4))
			throw new Error('Target health/version mismatch');
		if (host)
			await proxy.update(access, {
				id: host.id,
				domain_names: domains,
				forward_host: target,
				forward_port: 8080
			});
		else
			host = await proxy.create(access, {
				domain_names: domains,
				forward_scheme: 'http',
				forward_host: target,
				forward_port: 8080,
				access_list_id: 0,
				certificate_id: 0,
				ssl_forced: false,
				caching_enabled: false,
				block_exploits: true,
				allow_websocket_upgrade: false,
				http2_support: true,
				hsts_enabled: false,
				hsts_subdomains: false,
				locations: [],
				advanced_config: '',
				meta: {}
			});
	} else if (action === 'tls') {
		if (!host) throw new Error('Deploy the healthy A2O target first');
		for (const domain of domains) {
			if (!(await resolve4(domain)).includes('112.167.19.32'))
				throw new Error(`Owner DNS is not ready: ${domain}`);
		}
		let certificate = (await certificates.query().where({ is_deleted: 0 })).find(
			(c) =>
				c.domain_names.length === domains.length && domains.every((d) => c.domain_names.includes(d))
		);
		if (!certificate)
			certificate = await cert.create(access, {
				provider: 'letsencrypt',
				domain_names: domains,
				meta: { letsencrypt_email: admin.email, letsencrypt_agree: true, dns_challenge: false }
			});
		await proxy.update(access, {
			id: host.id,
			certificate_id: certificate.id,
			ssl_forced: true,
			http2_support: true
		});
	} else if (action !== 'status') throw new Error('Unknown A2O action');
	const current = host ? await hosts.query().findById(host.id) : null;
	if (action !== 'status' && !current?.meta?.nginx_online)
		throw new Error('A2O Nginx configuration is offline');
	const after = await otherConfigs();
	if (JSON.stringify(before) !== JSON.stringify(after))
		throw new Error('An unrelated proxy configuration changed');
	console.log(
		JSON.stringify(
			current && {
				id: current.id,
				domains: current.domain_names,
				target: current.forward_host,
				port: current.forward_port,
				certificate: current.certificate_id,
				https: current.ssl_forced,
				online: current.meta?.nginx_online
			}
		)
	);
} finally {
	await db().destroy();
}
