#!/bin/sh
set -e

mkdir -p /app/data

# Best-effort: align /app/data ownership with the in-image nextjs user.
# This fails silently on rootless Docker / Podman / restricted bind mounts,
# where even the container-root cannot chown host-owned paths.
chown -R nextjs:nodejs /app/data 2>/dev/null || true

# Drop privileges to whoever actually owns /app/data. On a normal Docker
# daemon this resolves to 1001:1001 (nextjs:nodejs) after the chown above;
# on rootless setups it resolves to the host user's mapped uid/gid, which is
# the only identity allowed to write to the bind-mounted volume.
DATA_UID=$(stat -c '%u' /app/data)
DATA_GID=$(stat -c '%g' /app/data)
RUN_AS="${DATA_UID}:${DATA_GID}"

su-exec "$RUN_AS" node ./node_modules/prisma/build/index.js migrate deploy
exec su-exec "$RUN_AS" node server.js
