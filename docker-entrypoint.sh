#!/bin/sh
set -e

# Fix ownership of the mounted data volume so the non-root nextjs user can
# write to it (SQLite needs to create -journal/-wal files next to the db).
# Runs as root, then drops privileges via su-exec.
mkdir -p /app/data
chown -R nextjs:nodejs /app/data

su-exec nextjs node ./node_modules/prisma/build/index.js migrate deploy
exec su-exec nextjs node server.js
