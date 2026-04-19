#!/bin/sh
set -e

mkdir -p /app/data

# Best-effort: align /app/data ownership with the in-image nextjs user.
# Fails silently on rootless Docker / Podman / restricted bind mounts.
chown -R nextjs:nodejs /app/data 2>/dev/null || true

DATA_UID=$(stat -c '%u' /app/data)
DATA_GID=$(stat -c '%g' /app/data)
CURRENT_UID=$(id -u)
RUN_AS="${DATA_UID}:${DATA_GID}"

# Pick whether to drop privileges. Rootless Docker/Podman forbids setgroups(0),
# so su-exec fails there — probe first and fall back to current identity.
if [ "$CURRENT_UID" = "$DATA_UID" ] || ! su-exec "$RUN_AS" true 2>/dev/null; then
  AS=""
else
  AS="su-exec $RUN_AS"
fi

# Fail fast with a clear hint if /app/data is not writable as the runtime
# user. Otherwise SQLite later surfaces the same problem as SQLITE_READONLY.
if ! $AS sh -c ': >/app/data/.write-test && rm /app/data/.write-test' 2>/dev/null; then
  echo "ERROR: /app/data is not writable inside the container." >&2
  echo "       Host bind mount owner uid=${DATA_UID}, runtime uid=${CURRENT_UID}." >&2
  echo "       Fix on the host (pick one):" >&2
  echo "         sudo chown -R \$(id -u):\$(id -g) ./data" >&2
  echo "         # or in docker-compose.yml, add:  user: \"\${UID}:\${GID}\"" >&2
  exit 1
fi

$AS node ./node_modules/prisma/build/index.js migrate deploy
exec $AS node server.js
