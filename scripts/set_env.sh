#!/usr/bin/env bash
# Source this file to load environment variables
# Usage: source scripts/set_env.sh

export NODE_ENV=development
export PORT=3000
export HOST=0.0.0.0
export SERVICE_NAME=talethreads-backend
export SERVICE_VERSION=1.0.0

export CORS_ORIGIN=http://localhost:3000
export RATE_LIMIT_WINDOW_MS=900000
export RATE_LIMIT_MAX_REQUESTS=100

export LOG_LEVEL=info
export LOG_FORMAT=simple

export DATABASE_URL=postgresql://postgres:password@postgres:5432/talethreads
export DB_POOL_MIN=2
export DB_POOL_MAX=10
export DB_SSL=false

export REDIS_HOST=redis
export REDIS_PORT=6379
export REDIS_PASSWORD=
export REDIS_DB=0
export REDIS_KEY_PREFIX=talethreads:
export REDIS_TTL=3600
