"""Run on the approved Ubuntu host after CI; no existing services are restarted."""
import json
import os
from pathlib import Path
import secrets
import subprocess
import time
import urllib.request

os.umask(0o077)
ROOT = Path.home() / 'web-analytics'
ROOT.mkdir(mode=0o700, exist_ok=True)
os.chdir(ROOT)


def command(*args, **kwargs):
    return subprocess.check_output(args, text=True, **kwargs)


def compose(*args):
    return command('docker', 'compose', '-f', str(ROOT / 'compose.yml'), *args)


def wait_health(name):
    for _ in range(120):
        state = json.loads(command('docker', 'inspect', name))[0]['State']
        if state.get('Health', {}).get('Status') == 'healthy':
            return
        if state['Status'] in ('exited', 'dead'):
            raise SystemExit(f'{name} exited; existing services were not changed')
        time.sleep(2)
    raise SystemExit(f'{name} did not become healthy')


env_file = ROOT / '.env'
if not env_file.exists():
    password = secrets.token_hex(32)
    db_password = secrets.token_hex(32)
    settings = {
        'UMAMI_IMAGE': 'ghcr.io/umami-software/umami:3.4.0@sha256:85909afc45bdcda1917394594a087421fdbb05610fded0fa9f6fb861abb2f367',
        'POSTGRES_IMAGE': 'postgres:17-alpine@sha256:b0f9560a2de083e2cc7382e75f808c7381a32852a7ec49117deedb300e552b24',
        'POSTGRES_PASSWORD': password,
        'DATABASE_URL': f'postgresql://umami:{db_password}@db:5432/umami',
        'APP_SECRET': secrets.token_hex(32),
        'TWO_FACTOR_ENCRYPTION_KEY': secrets.token_hex(32),
    }
    env_file.write_text(''.join(f'{key}={value}\n' for key, value in settings.items()))
else:
    settings = dict(line.split('=', 1) for line in env_file.read_text().splitlines() if '=' in line)
    db_password = settings['DATABASE_URL'].split(':', 2)[2].split('@', 1)[0]
env_file.chmod(0o600)

networks = command('docker', 'network', 'ls', '--format', '{{.Name}}').split()
if 'analytics-web' not in networks:
    command('docker', 'network', 'create', 'analytics-web')

compose('config', '--quiet')
compose('up', '-d', 'db')
wait_health('analytics-postgres')
exists = command('docker', 'exec', 'analytics-postgres', 'psql', '-U', 'analytics_admin', '-d', 'postgres', '-Atc', "SELECT 1 FROM pg_database WHERE datname='umami'").strip()
if not exists:
    sql = f"CREATE ROLE umami LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD '{db_password}';\nCREATE DATABASE umami OWNER umami;\n"
    command('docker', 'exec', '-i', 'analytics-postgres', 'psql', '-U', 'analytics_admin', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', input=sql)
compose('up', '-d', 'umami')
wait_health('analytics-umami')


def api(path, body=None, token=None):
    headers = {'Content-Type': 'application/json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    request = urllib.request.Request('http://127.0.0.1:4371/api/' + path, data=json.dumps(body).encode() if body is not None else None, headers=headers)
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.load(response)


login_file = ROOT / 'admin-login.json'
if not login_file.exists():
    admin = {'username': 'admin', 'password': secrets.token_urlsafe(30)}
    login = api('auth/login', {'username': 'admin', 'password': 'umami'})
    api('me/password', {'currentPassword': 'umami', 'newPassword': admin['password']}, login['token'])
    login_file.write_text(json.dumps(admin, indent=2) + '\n')
    login_file.chmod(0o600)
else:
    admin = json.loads(login_file.read_text())
token = api('auth/login', admin)['token']
websites = api('websites', token=token)
entries = websites.get('data', []) if isinstance(websites, dict) else websites
website_id = '7f85f813-47a4-4490-9c09-98b794433b93'
if not any(site['id'] == website_id for site in entries):
    api('websites', {'id': website_id, 'name': 'A2O — Atom to Orbit', 'domain': 'a2o.kr'}, token)

# Add only this network to the existing NPM service's saved Compose configuration.
stack = Path.home() / 'n8n-stack'
base = stack / 'docker-compose.yml'
override = stack / 'docker-compose.override.yml'
old = override.read_text()
if 'analytics-web' not in old:
    anchor = '      - a2o-web\n'
    if old.count(anchor) != 1:
        raise SystemExit('Unexpected proxy Compose structure; no existing settings were changed')
    new = old.replace(anchor, anchor + '      - analytics-web\n', 1).rstrip() + '\n  analytics-web:\n    external: true\n'
    candidate = stack / '.analytics-compose-check.yml'
    candidate.write_text(new)
    def config(path):
        return json.loads(command('docker', 'compose', '-f', str(base), '-f', str(path), 'config', '--format', 'json'))
    before, after = config(override), config(candidate)
    after['services']['npm']['networks'].pop('analytics-web')
    after['networks'].pop('analytics-web')
    if before != after:
        candidate.unlink()
        raise SystemExit('Proxy Compose changes exceeded the authorized network addition')
    (ROOT / 'proxy-compose-before.yml').write_text(old)
    candidate.chmod(override.stat().st_mode & 0o777)
    os.replace(candidate, override)
npm = json.loads(command('docker', 'inspect', 'npm'))[0]
if 'analytics-web' not in npm['NetworkSettings']['Networks']:
    command('docker', 'network', 'connect', 'analytics-web', 'npm')

# Only this user's dedicated maintenance entry is added; preserve every existing entry.
job = f'23 3 * * * /usr/bin/python3 {ROOT}/maintenance.py >> {ROOT}/maintenance.log 2>&1 # web-analytics-maintenance'
current = subprocess.run(['crontab', '-l'], capture_output=True, text=True)
if current.returncode not in (0, 1):
    raise SystemExit('Cannot read existing crontab')
lines = [line for line in current.stdout.splitlines() if '# web-analytics-maintenance' not in line]
command('crontab', '-', input='\n'.join(lines + [job]) + '\n')
command('docker', 'exec', 'analytics-postgres', 'psql', '-U', 'analytics_admin', '-d', 'umami', '-v', 'ON_ERROR_STOP=1', '-c', 'UPDATE "user" SET two_factor_required = true WHERE username = \'admin\';')
print(json.dumps({'healthy': True, 'website_id': website_id, 'admin_credentials': str(login_file), 'backup_schedule': 'daily 03:23 server time', 'existing_services_restarted': False}))
