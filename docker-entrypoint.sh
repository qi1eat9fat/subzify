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

# In rootless Docker/Podman the container-root is mapped to the host user and
# setgroups(2) is forbidden, which makes su-exec fail with
# "setgroups(0): Operation not permitted". Probe first; if we can't drop
# privileges, just run as the current (already-unprivileged) identity.
if [ "$CURRENT_UID" = "$DATA_UID" ] || ! su-exec "$RUN_AS" true 2>/dev/null; then
  node ./node_modules/prisma/build/index.js migrate deploy
  exec node server.js
fi

su-exec "$RUN_AS" node ./node_modules/prisma/build/index.js migrate deploy
exec su-exec "$RUN_AS" node server.js
