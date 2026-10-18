#!/bin/sh
# Local dev: ./dev.sh  (needs the pocketbase binary in ./bin, see README)
# Optional first run: PB_ADMIN_EMAIL=you@example.com PB_ADMIN_PASSWORD=... ./dev.sh
set -e
cd "$(dirname "$0")"
FLAGS="--dir=./pb_data --publicDir=./public --hooksDir=./pb/pb_hooks --migrationsDir=./pb/pb_migrations"
if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
  ./bin/pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" $FLAGS
fi
exec ./bin/pocketbase serve --http=127.0.0.1:8090 $FLAGS
