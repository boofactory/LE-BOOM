#!/bin/sh
set -e

# URL-encode the database password to handle special characters
urlencode() {
  node -e "console.log(encodeURIComponent(process.argv[1]))" "$1"
}

# Build DATABASE_URL with properly encoded password
if [ -n "$POSTGRES_PASSWORD" ]; then
  ENCODED_PASSWORD=$(urlencode "$POSTGRES_PASSWORD")
  export DATABASE_URL="postgresql://${POSTGRES_USER:-boom_admin}:${ENCODED_PASSWORD}@postgres:5432/${POSTGRES_DB:-boom_v2}"
fi

# URL-encode Redis password too
if [ -n "$REDIS_PASSWORD" ]; then
  ENCODED_REDIS_PASSWORD=$(urlencode "$REDIS_PASSWORD")
  export REDIS_URL="redis://:${ENCODED_REDIS_PASSWORD}@redis:6379"
fi

echo "🚀 Starting application with properly encoded credentials..."

# Execute the main command
exec "$@"
