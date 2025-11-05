#!/bin/sh
set -e

echo "🔧 Entrypoint script starting..."
echo "   POSTGRES_USER: ${POSTGRES_USER:-boom_admin}"
echo "   POSTGRES_DB: ${POSTGRES_DB:-boom_v2}"
echo "   POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:+***set***}"
echo "   REDIS_PASSWORD: ${REDIS_PASSWORD:+***set***}"

# URL-encode the database password to handle special characters
urlencode() {
  node -e "console.log(encodeURIComponent(process.argv[1]))" "$1"
}

# Build DATABASE_URL with properly encoded password
if [ -n "$POSTGRES_PASSWORD" ]; then
  echo "   Encoding Postgres password..."
  ENCODED_PASSWORD=$(urlencode "$POSTGRES_PASSWORD")
  export DATABASE_URL="postgresql://${POSTGRES_USER:-boom_admin}:${ENCODED_PASSWORD}@postgres:5432/${POSTGRES_DB:-boom_v2}"
  echo "   ✅ DATABASE_URL set"
else
  echo "   ⚠️  WARNING: POSTGRES_PASSWORD not set!"
fi

# URL-encode Redis password too
if [ -n "$REDIS_PASSWORD" ]; then
  echo "   Encoding Redis password..."
  ENCODED_REDIS_PASSWORD=$(urlencode "$REDIS_PASSWORD")
  export REDIS_URL="redis://:${ENCODED_REDIS_PASSWORD}@redis:6379"
  echo "   ✅ REDIS_URL set"
else
  echo "   ⚠️  WARNING: REDIS_PASSWORD not set!"
fi

echo "🚀 Starting application with properly encoded credentials..."
echo "   Command: $@"

# Execute the main command
exec "$@"
