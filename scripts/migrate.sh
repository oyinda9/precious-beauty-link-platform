#!/bin/bash

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install
fi

# Run Prisma migrations
echo "Running Prisma migrations..."
pnpm prisma migrate dev --name init

echo "Database migration completed successfully!"
