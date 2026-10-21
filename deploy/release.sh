#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
ROOT="$HOME/a2o"
mkdir -p "$ROOT/releases" "$ROOT/state"
cd "$ROOT"
exec 9>"$ROOT/state/deploy.lock"
flock -n 9 || { echo 'Another A2O deployment is running'; exit 1; }
action="${1:-}"
release="${2:-}"
proxy() { docker exec -i -w /app npm node --input-type=module - "$@" < "$ROOT/npm-a2o.mjs"; }
healthy() {
  for attempt in $(seq 1 40); do
    state=$(docker inspect --format '{{.State.Health.Status}}' "$1" 2>/dev/null || true)
    [ "$state" = healthy ] && return 0
    [ "$state" = unhealthy ] && return 1
    sleep 1
  done
  return 1
}
if [ "$action" = status ] || [ "$action" = tls ]; then proxy "$action"; exit; fi
if [ "$action" = rollback ]; then
  [ -s state/previous ] || { echo 'No previous A2O release'; exit 1; }
  release=$(cat state/previous)
  [[ "$release" =~ ^[0-9]{8}T[0-9]{6}Z$ ]] || exit 1
  target="a2o-$release"
  docker start "$target" >/dev/null
  healthy "$target" || { echo 'Previous A2O target is unhealthy'; exit 1; }
  proxy switch "$target"
  old=$(cat state/current)
  printf '%s\n' "$old" > state/previous
  printf '%s\n' "$release" > state/current
  echo "A2O restored to $release"
  exit
fi
[ "$action" = deploy ] || { echo 'Usage: release.sh deploy RELEASE | rollback | status | tls'; exit 1; }
[[ "$release" =~ ^[0-9]{8}T[0-9]{6}Z$ ]] || { echo 'Invalid release'; exit 1; }
python3 "$ROOT/bootstrap.py" prepare "$release"
[ ! -e "releases/$release" ] || { echo 'Release already exists'; exit 1; }
python3 - "$ROOT/uploads/$release.tar.gz" <<'PY'
import sys, tarfile
from pathlib import PurePosixPath
with tarfile.open(sys.argv[1]) as archive:
    for member in archive.getmembers():
        p = PurePosixPath(member.name)
        if p.is_absolute() or '..' in p.parts or not (member.isfile() or member.isdir()):
            raise SystemExit('Unsafe archive member')
PY
mkdir "releases/$release"
tar -xzf "uploads/$release.tar.gz" -C "releases/$release"
old=$(cat state/current 2>/dev/null || true)
if [ -n "$old" ]; then
  [[ "$old" =~ ^[0-9]{8}T[0-9]{6}Z$ ]] || exit 1
  docker cp "a2o-$old:/usr/share/nginx/html/_app/immutable/." "releases/$release/retained-immutable/"
fi
docker build -f "releases/$release/deploy/Dockerfile" -t "a2o-web:$release" "releases/$release"
target="a2o-$release"
docker run -d --name "$target" --network a2o-web --restart unless-stopped \
  --memory 128m --cpus 1 --pids-limit 128 --read-only --tmpfs /tmp:rw,noexec,nosuid,size=32m \
  --cap-drop ALL --security-opt no-new-privileges --log-opt max-size=10m --log-opt max-file=3 \
  --label "kr.a2o.release=$release" "a2o-web:$release"
healthy "$target" || { docker logs --tail 30 "$target"; echo 'New A2O release unhealthy; routing was not changed'; exit 1; }
if ! proxy switch "$target"; then
  [ -z "$old" ] || proxy switch "a2o-$old"
  echo 'A2O switch failed; previous route restored when available'
  exit 1
fi
[ -z "$old" ] || printf '%s\n' "$old" > state/previous
printf '%s\n' "$release" > state/current
proxy tls
python3 "$ROOT/bootstrap.py" verify "$release"
echo "DEPLOYED A2O $release"
