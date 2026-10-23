"""Remove only inactive dated web containers; keep the healthy, routed release."""
import argparse
from contextlib import nullcontext
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import subprocess


SERVICES = {
    'a2o': ('a2o-web', {'a2o.kr', 'www.a2o.kr'}),
    'hgi-preview': ('hgi-preview', {'preview.hgi.kr'}),
}
NPM_SNAPSHOT = r'''
import db from '/app/db.js';
import hosts from '/app/models/proxy_host.js';
import {readdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
try {
  const routes = (await hosts.query().where({is_deleted:0})).map(h => ({
    id:h.id, domains:h.domain_names, target:h.forward_host, port:h.forward_port,
    enabled:!!h.enabled, online:!!h.meta?.nginx_online
  })).sort((a,b) => a.id-b.id);
  const configs = {};
  for (const name of (await readdir('/data/nginx/proxy_host')).sort()) {
    if (!/^\d+\.conf$/.test(name)) continue;
    configs[name] = createHash('sha256').update(await readFile('/data/nginx/proxy_host/'+name)).digest('hex');
  }
  console.log('CLEANUP_SNAPSHOT='+JSON.stringify({routes,configs}));
} finally { await db().destroy(); }
'''


def command(*args, input=None):
    return subprocess.check_output(args, input=input, text=True)


def containers():
    ids = command('docker', 'ps', '-aq').split()
    if not ids:
        return []
    return json.loads(command('docker', 'inspect', *ids))


def proxy_snapshot():
    output = command('docker', 'exec', '-i', '-w', '/app', 'npm',
                     'node', '--input-type=module', input=NPM_SNAPSHOT)
    marker = next(line for line in output.splitlines() if line.startswith('CLEANUP_SNAPSHOT='))
    return json.loads(marker.split('=', 1)[1])


def identity(container):
    return {
        'id': container['Id'], 'name': container['Name'].lstrip('/'),
        'started': container['State']['StartedAt'],
        'status': container['State']['Status'], 'restarts': container['RestartCount'],
    }


def deletion_plan(service, keep, inventory, proxy):
    image, domains = SERVICES[service]
    pattern = re.compile(re.escape(service) + r'-\d{8}T\d{6}Z')
    if not pattern.fullmatch(keep):
        raise ValueError('Invalid retained release name')
    managed = {c['Name'].lstrip('/'): c for c in inventory if pattern.fullmatch(c['Name'].lstrip('/'))}
    retained = managed.get(keep)
    if not retained or not retained['State']['Running'] or retained['State'].get('Health', {}).get('Status') != 'healthy':
        raise ValueError('Retained release must already be running and healthy')
    expected_image = image + ':' + keep[len(service) + 1:]
    if retained['Config']['Image'] != expected_image:
        raise ValueError('Retained container image does not match its release')
    routes = [r for r in proxy['routes'] if set(r['domains']) & domains]
    if len(routes) != 1 or set(routes[0]['domains']) != domains or routes[0]['target'] != keep or not routes[0]['enabled'] or not routes[0]['online']:
        raise ValueError('Current service proxy must point exclusively to the retained release')
    candidates = []
    protected = {r['target'] for r in proxy['routes'] if r['enabled']}
    for name, container in sorted(managed.items()):
        if name == keep:
            continue
        if container['Config']['Image'] != image + ':' + name[len(service) + 1:]:
            raise ValueError('Unexpected image on candidate: ' + name)
        if container.get('Mounts'):
            raise ValueError('Refusing to delete a container with mounted data: ' + name)
        aliases = {name, container['Id'], container['Id'][:12]}
        for network in container.get('NetworkSettings', {}).get('Networks', {}).values():
            aliases.update(network.get('Aliases') or [])
            aliases.update(filter(None, (network.get('IPAddress'), network.get('GlobalIPv6Address'))))
        if protected & aliases:
            raise ValueError('Another proxy still references candidate: ' + name)
        candidates.append(container)
    return candidates


def run(service, apply=False, lock_held=False):
    root = Path.home() / service
    state = root / 'state'
    if not state.is_dir():
        raise ValueError('Missing existing deployment state')
    lock = nullcontext() if lock_held else (state / 'deploy.lock').open('a')
    with lock as handle:
        if not lock_held:
            import fcntl
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        release = (state / 'current').read_text().strip()
        keep = service + '-' + release
        before = containers()
        proxy = proxy_snapshot()
        candidates = deletion_plan(service, keep, before, proxy)
        result = {'service': service, 'keep': keep, 'remove': [identity(c) for c in candidates], 'applied': apply}
        if not apply:
            return result
        removed = set()
        for candidate in candidates:
            # Recheck all routes and the retained container before each irreversible removal.
            current_proxy = proxy_snapshot()
            if current_proxy != proxy:
                raise ValueError('Proxy changed during cleanup; stopping')
            fresh = containers()
            safe = deletion_plan(service, keep, fresh, current_proxy)
            actual = next((c for c in safe if c['Id'] == candidate['Id']), None)
            if actual is None:
                raise ValueError('Candidate identity changed; stopping')
            if actual['State']['Running']:
                command('docker', 'stop', '--time', '10', actual['Id'])
            command('docker', 'rm', actual['Id'])
            removed.add(actual['Id'])
        after = containers()
        unchanged = {c['Id']: identity(c) for c in before if c['Id'] not in removed}
        if unchanged != {c['Id']: identity(c) for c in after}:
            raise ValueError('A retained or unrelated container changed during cleanup')
        if proxy_snapshot() != proxy or deletion_plan(service, keep, after, proxy):
            raise ValueError('Final routing or single-container verification failed')
        (state / 'previous').unlink(missing_ok=True)
        result.update({'removedCount': len(removed), 'remainingCount': 1, 'unrelatedPreserved': True})
        stamp = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
        (state / ('container-cleanup-' + stamp + '.json')).write_text(json.dumps(result, indent=2) + '\n')
        return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('service', choices=SERVICES)
    parser.add_argument('--apply', action='store_true')
    parser.add_argument('--lock-held', action='store_true', help='Internal: release.sh already holds deploy.lock')
    args = parser.parse_args()
    print(json.dumps(run(args.service, args.apply, args.lock_held)))
