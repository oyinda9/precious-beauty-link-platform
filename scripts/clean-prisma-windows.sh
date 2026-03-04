#!/usr/bin/env bash
set -eu
echo "Cleaning Prisma temp artifacts (Unix/WSL)..."
rm -rf node_modules/.pnpm/@prisma*
rm -rf node_modules/@prisma
rm -rf node_modules/.prisma
rm -rf .prisma
echo "Done."
