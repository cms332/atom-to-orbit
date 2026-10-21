"""Inventory publication candidates and reachable Git blobs without printing secrets.

Reports and a disposable working-copy scan live under ignored .tmp/github-audit/.
This is a supplementary pattern inventory, not a guarantee of secret detection.
It never changes Git refs, history, the index, remotes, or deployment state.
"""
import collections
import hashlib
import json
from pathlib import Path
import re
import shutil
import subprocess
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / '.tmp' / 'github-audit'
OUT.mkdir(parents=True, exist_ok=True)


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


patterns = {
    'private-key-header': r'-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----',
    'github-token': r'\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,})\b',
    'cloud-key': r'\b(?:AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z_-]{35})\b',
    'slack-token': r'\bxox[baprs]-[A-Za-z0-9-]{20,}\b',
    'credential-url': r'[a-zA-Z][a-zA-Z0-9+.-]*://[^\s/:]+:[^\s/@]+@',
    'secret-assignment-review': r'''(?i)\b(?:password|passwd|client_secret|api_key|access_token)\s*[:=]\s*["'][^"'\n]{6,}["']''',
    'ipv4-review': r'\b(?:\d{1,3}\.){3}\d{1,3}\b',
    'local-profile-review': r'(?i)(?:[A-Z]:[/\\]Users[/\\][^\s/\\"\']+|/home/[^/\s"\']+)',
    'ssh-target-review': r'\b[a-zA-Z0-9_-]+@(?:\d{1,3}\.){3}\d{1,3}\b',
    'key-path-review': r'(?i)(?:id_(?:rsa|ed25519)[^\s"\']*|\.ssh[/\\][^\s"\']+)',
}
compiled = {name: re.compile(pattern) for name, pattern in patterns.items()}


def scan(data, location):
    if b'\0' in data:
        return [], True
    try:
        text = data.decode('utf-8-sig')
    except UnicodeDecodeError:
        return [], True
    findings = []
    for number, line in enumerate(text.splitlines(), 1):
        for category, regex in compiled.items():
            if regex.search(line):
                findings.append({**location, 'line': number, 'category': category})
    return findings, False


files = sorted(set(git('ls-files', '-z', '--cached', '--others', '--exclude-standard').decode().split('\0')) - {''})
manifest, current_findings, binary_files = [], [], []
stage = OUT / 'working-copies' / datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%fZ')
stage.mkdir(parents=True)
for name in files:
    source = ROOT / name
    if not source.is_file():
        continue
    data = source.read_bytes()
    manifest.append({'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
    hits, binary = scan(data, {'path': name})
    current_findings.extend(hits)
    if binary:
        binary_files.append(name)
    target = stage / name
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, target)

objects = {}
for line in git('rev-list', '--objects', '--all').decode().splitlines():
    oid, _, name = line.partition(' ')
    objects[oid] = name
request = ''.join(oid + '\n' for oid in objects).encode()
batch = subprocess.run(['git', 'cat-file', '--batch'], input=request, cwd=ROOT, capture_output=True, check=True).stdout
offset, blob_count, history_findings, binary_blobs = 0, 0, [], []
while offset < len(batch):
    end = batch.index(b'\n', offset)
    oid, kind, size = batch[offset:end].decode().split()
    size = int(size)
    data = batch[end + 1:end + 1 + size]
    offset = end + size + 2
    if kind != 'blob':
        continue
    blob_count += 1
    hits, binary = scan(data, {'path': objects[oid], 'blob': oid})
    history_findings.extend(hits)
    if binary:
        binary_blobs.append({'path': objects[oid], 'blob': oid, 'bytes': size})

history_paths = set()
commits = git('rev-list', '--all').decode().splitlines()
for commit in commits:
    history_paths.update(git('ls-tree', '-r', '--name-only', commit).decode().splitlines())
suspect_name = re.compile(r'(?i)(?:^|/)(?:\.env(?:\.|$)|id_rsa|id_ed25519|credentials|.*\.(?:pfx|pem|key|sqlite3?|db|zip|tar|gz)$)')
write('current-manifest.json', manifest)
write('history-paths.json', sorted(history_paths))
write('pattern-findings.json', {'current': current_findings, 'history': history_findings})
summary = {
    'scannedAt': datetime.now(timezone.utc).isoformat(),
    'head': git('rev-parse', 'HEAD').decode().strip(),
    'branch': git('branch', '--show-current').decode().strip(),
    'commits': len(commits),
    'reachableObjectsIncludingLocalAppRefs': len(objects),
    'reachableBlobs': blob_count,
    'candidateFiles': len(manifest),
    'workingCopyScanDirectory': str(stage.relative_to(ROOT)).replace('\\', '/'),
    'candidateBytes': sum(x['bytes'] for x in manifest),
    'historicalPaths': len(history_paths),
    'historicalSensitiveFilenames': sorted(x for x in history_paths if suspect_name.search(x)),
    'currentCategories': dict(collections.Counter(x['category'] for x in current_findings)),
    'historyCategories': dict(collections.Counter(x['category'] for x in history_findings)),
    'binaryCurrentFilesForLicenseReview': binary_files,
    'binaryHistoryBlobs': binary_blobs,
    'limitations': ['Pattern scan only; binary content requires provenance/license review.',
                    'Unreachable objects are not published by the planned explicit branch/tag push.',
                    'Ignored files are not candidates and are never copied to the scan staging folder.'],
}
write('summary.json', summary)
print(json.dumps({key: value for key, value in summary.items() if key != 'binaryHistoryBlobs'}, ensure_ascii=False, indent=2))
