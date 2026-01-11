#!/bin/sh
set -e

echo " Running database migrations..."
npx prisma db push --accept-data-loss

echo " Checking if seed is needed..."
# Check if Admin table is empty
ADMIN_COUNT=$(npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Admin\"" 2>/dev/null | grep -o '[0-9]*' | head -1 || echo "0")

if [ "$ADMIN_COUNT" = "0" ] || [ -z "$ADMIN_COUNT" ]; then
  echo " Seeding database..."
  npx prisma db seed || echo " Seed skipped or failed"
else
  echo " Database already seeded, skipping..."
fi

echo " Starting Next.js server..."
exec node server.js