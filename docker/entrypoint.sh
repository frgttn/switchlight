#!/bin/sh
set -eu

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Applying database migrations..."
  node dist/database/migrate.js
fi

echo "Starting Switchlight bot..."
exec node dist/main.js
