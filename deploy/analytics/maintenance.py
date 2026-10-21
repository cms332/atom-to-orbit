"""Private daily logical backup, bounded retention, optional restore test."""
from datetime import datetime, timedelta, timezone
import fcntl
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import uuid

os.umask(0o077)
ROOT = Path.home() / 'web-analytics'
BACKUPS = ROOT / 'backups'
BACKUPS.mkdir(mode=0o700, exist_ok=True)
lock = (ROOT / 'maintenance.lock').open('w')
fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)


def sql(query, database='umami'):
    return subprocess.check_output(['docker', 'exec', '-i', 'analytics-postgres', 'psql', '-U', 'analytics_admin', '-d', database, '-v', 'ON_ERROR_STOP=1', '-At'], input=query, text=True).strip()


now = datetime.now(timezone.utc)
name = now.strftime('umami-%Y%m%dT%H%M%SZ.dump')
destination = BACKUPS / name
temporary = BACKUPS / (name + '.partial')
with temporary.open('xb') as output:
    subprocess.run(['docker', 'exec', 'analytics-postgres', 'pg_dump', '-U', 'analytics_admin', '-d', 'umami', '-Fc', '--no-owner', '--no-acl'], stdout=output, check=True)
temporary.replace(destination)
digest = hashlib.sha256(destination.read_bytes()).hexdigest()
destination.with_suffix('.dump.sha256').write_text(digest + '  ' + name + '\n')
configuration = {'environment': (ROOT / '.env').read_text()}
if (ROOT / 'admin-login.json').exists():
    configuration['initial_admin_login'] = (ROOT / 'admin-login.json').read_text()
destination.with_suffix('.config.json').write_text(json.dumps(configuration) + '\n')

if '--restore-test' in sys.argv:
    # Unique, newly created disposable database; never replace any existing database.
    test_db = 'analytics_restore_check_' + uuid.uuid4().hex
    sql(f'CREATE DATABASE {test_db};', 'postgres')
    try:
        with destination.open('rb') as source:
            subprocess.run(['docker', 'exec', '-i', 'analytics-postgres', 'pg_restore', '-U', 'analytics_admin', '-d', test_db, '--no-owner', '--no-acl', '--exit-on-error'], stdin=source, check=True)
        count = int(sql('SELECT count(*) FROM website;', test_db))
        if count < 1:
            raise RuntimeError('Restored database has no configured websites')
        print(json.dumps({'restore_test': 'passed', 'websites': count}))
    finally:
        sql(f'DROP DATABASE {test_db};', 'postgres')

sql("""BEGIN;
DELETE FROM event_data WHERE created_at < now() - interval '180 days';
DELETE FROM session_replay_saved WHERE created_at < now() - interval '180 days';
DELETE FROM session_replay WHERE created_at < now() - interval '180 days';
DELETE FROM heatmap_event WHERE created_at < now() - interval '180 days';
DELETE FROM revenue WHERE created_at < now() - interval '180 days';
DELETE FROM website_event WHERE created_at < now() - interval '180 days';
DELETE FROM session_data WHERE created_at < now() - interval '180 days';
DELETE FROM session WHERE created_at < now() - interval '180 days' AND NOT EXISTS (SELECT 1 FROM website_event WHERE website_event.session_id = session.session_id);
COMMIT;""")
for old in BACKUPS.glob('umami-*.dump'):
    if datetime.fromtimestamp(old.stat().st_mtime, timezone.utc) < now - timedelta(days=14):
        old.unlink()
        old.with_suffix('.dump.sha256').unlink(missing_ok=True)
        old.with_suffix('.config.json').unlink(missing_ok=True)
print(json.dumps({'backup': name, 'bytes': destination.stat().st_size, 'sha256': digest, 'event_retention_days': 180, 'backup_retention_days': 14, 'completed_at': now.isoformat()}))
