#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Please set DATABASE_URL environment variable before running this script."
  echo "Example: export DATABASE_URL=\"postgres://USER:PASS@HOST:PORT/DB\""
  exit 1
fi

echo "Running production migrations against: ${DATABASE_URL}"
pnpm run migrate:prod

echo "Migrations finished."
