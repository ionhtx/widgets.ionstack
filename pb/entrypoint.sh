#!/bin/sh
set -e
FLAGS="--dir=/pb/pb_data --publicDir=/pb/pb_public --hooksDir=/pb/pb_hooks --migrationsDir=/pb/pb_migrations"

# Creates or updates the editor login from Dokploy environment variables.
if [ -n "$PB_ADMIN_EMAIL" ] && [ -n "$PB_ADMIN_PASSWORD" ]; then
  /pb/pocketbase superuser upsert "$PB_ADMIN_EMAIL" "$PB_ADMIN_PASSWORD" $FLAGS
fi

exec /pb/pocketbase serve --http=0.0.0.0:8090 $FLAGS
