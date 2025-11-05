#!/bin/sh
set -e

echo "🔧 Starting LE BOOM application..."

# URL-encode function for handling special characters in passwords
urlencode() {
  node -e "console.log(encodeURIComponent(process.argv[1]))" "$1"
}

# Build DATABASE_URL with properly encoded password
if [ -n "$POSTGRES_PASSWORD" ]; then
  ENCODED_PASSWORD=$(urlencode "$POSTGRES_PASSWORD")
  export DATABASE_URL="postgresql://${POSTGRES_USER:-boom_admin}:${ENCODED_PASSWORD}@postgres:5432/${POSTGRES_DB:-boom_v2}"
  echo "✅ DATABASE_URL configured"
else
  echo "❌ ERROR: POSTGRES_PASSWORD not set!"
  exit 1
fi

# Build REDIS_URL with properly encoded password
if [ -n "$REDIS_PASSWORD" ]; then
  ENCODED_REDIS_PASSWORD=$(urlencode "$REDIS_PASSWORD")
  export REDIS_URL="redis://:${ENCODED_REDIS_PASSWORD}@redis:6379"
  echo "✅ REDIS_URL configured"
else
  echo "❌ ERROR: REDIS_PASSWORD not set!"
  exit 1
fi

echo "🚀 Launching Node.js application..."

# Start the application
exec node server.js
