"""Prepare only A2O networking and audit existing services; never restart the stack."""
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sqlite3
import subprocess
import sys

os.umask(0o077)
ROOT = Path.home() / 'a2o'
STATE = ROOT / 'state'
STATE.mkdir(parents=True, exist_ok=True)
action, release = sys.argv[1:3]
if not re.fullmatch(r'\d{8}T\d{6}Z', release):
    raise SystemExit('Invalid release')


def command(*args):
    return subprocess.check_output(args, text=True)


def snapshot():
    ids = command('docker', 'ps', '-aq').split()
    containers = json.loads(command('docker', 'inspect', *ids))
    services = {c['Name'].lstrip('/'): {'id': c['Id'], 'started': c['State']['StartedAt'],
                'restarts': c['RestartCount'], 'running': c['State']['Running']}
                for c in containers if not c['Name'].lstrip('/').startswith('a2o-')}
    npm = next(c for c in containers if c['Name'] == '/npm')
    data = Path(next(m['Source'] for m in npm['Mounts'] if m['Destination'] == '/data'))
    configs = {}
    for p in (data / 'nginx' / 'proxy_host').glob('*.conf'):
        content = p.read_bytes()
        if re.search(rb'^\s*server_name\b[^\n;]*\ba2o\.kr\b', content, re.M):
            continue
        configs[p.name] = hashlib.sha256(content).hexdigest()
    return {'services': services, 'configs': configs}, data


audit = STATE / f'audit-{release}-before.json'
if action == 'prepare':
    baseline, data = snapshot()
    audit.write_text(json.dumps(baseline, indent=2) + '\n')
    backup = STATE / 'npm-before-a2o.sqlite'
    if not backup.exists():
        with sqlite3.connect(f'file:{data / "database.sqlite"}?mode=ro', uri=True) as source:
            with sqlite3.connect(backup) as destination:
                source.backup(destination)
    networks = command('docker', 'network', 'ls', '--format', '{{.Name}}').split()
    if 'a2o-web' not in networks:
        command('docker', 'network', 'create', 'a2o-web')
    stack = Path.home() / 'n8n-stack'
    base = stack / 'docker-compose.yml'
    override = stack / 'docker-compose.override.yml'
    old = override.read_text()
    if 'a2o-web' not in old:
        anchor = '    networks:\n      - hgi-preview\n'
        if old.count(anchor) != 1 or not old.strip().endswith('hgi-preview:\n    external: true'):
            raise SystemExit('Unexpected existing override; leaving it untouched')
        new = old.replace(anchor, anchor + '      - a2o-web\n', 1).rstrip() + '\n  a2o-web:\n    external: true\n'
        candidate = stack / '.a2o-compose-check.yml'
        candidate.write_text(new)
        def compose(file):
            return json.loads(command('docker', 'compose', '-f', str(base), '-f', str(file), 'config', '--format', 'json'))
        before, after = compose(override), compose(candidate)
        assert 'a2o-web' in after['services']['npm']['networks']
        after['services']['npm']['networks'].pop('a2o-web')
        after['networks'].pop('a2o-web')
        if before != after:
            candidate.unlink()
            raise SystemExit('Compose changes extend beyond the A2O network')
        shutil.copy2(override, STATE / f'compose-override-before-{release}.yml')
        candidate.chmod(override.stat().st_mode & 0o777)
        os.replace(candidate, override)
    npm = json.loads(command('docker', 'inspect', 'npm'))[0]
    if 'a2o-web' not in npm['NetworkSettings']['Networks']:
        command('docker', 'network', 'connect', 'a2o-web', 'npm')
    print('A2O network prepared; existing stack was not restarted')
elif action == 'verify':
    before = json.loads(audit.read_text())
    after, _ = snapshot()
    for name, state in before['services'].items():
        if after['services'].get(name) != state:
            raise SystemExit(f'Existing service state changed: {name}')
    for name, digest in before['configs'].items():
        if after['configs'].get(name) != digest:
            raise SystemExit(f'Existing proxy configuration changed: {name}')
    (STATE / f'audit-{release}-after.json').write_text(json.dumps(after, indent=2) + '\n')
    print(f'Preserved {len(before["services"])} existing containers and {len(before["configs"])} proxy configurations')
else:
    raise SystemExit('Unknown bootstrap action')
