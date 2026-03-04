#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMA_FILE="$ROOT_DIR/packages/api/sql/schema.sql"

POSTGRES_CONTAINER="mqc-postgres-local"
POSTGRES_IMAGE="postgres:16-alpine"
POSTGRES_PORT="5432"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="postgres"
POSTGRES_DB="mqc_platform"

log() {
  printf '[init-local] %s\n' "$*"
}

if ! command -v docker >/dev/null 2>&1; then
  log "docker not found; cannot bootstrap local postgres"
  exit 1
fi

if command -v stellar >/dev/null 2>&1; then
  log "starting stellar-local container (idempotent)"
  if ! stellar network container start local >/dev/null 2>&1; then
    log "warning: could not start stellar-local via CLI (it may already be managed by scaffold watch)"
  fi
else
  log "warning: stellar CLI not found; skipping explicit stellar-local start"
fi

if docker ps -a --format '{{.Names}}' | grep -Fxq "$POSTGRES_CONTAINER"; then
  if ! docker ps --format '{{.Names}}' | grep -Fxq "$POSTGRES_CONTAINER"; then
    log "starting existing postgres container: $POSTGRES_CONTAINER"
    docker start "$POSTGRES_CONTAINER" >/dev/null
  else
    log "postgres container already running: $POSTGRES_CONTAINER"
  fi
else
  log "creating postgres container: $POSTGRES_CONTAINER"
  docker run -d \
    --name "$POSTGRES_CONTAINER" \
    -e POSTGRES_USER="$POSTGRES_USER" \
    -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    -e POSTGRES_DB="$POSTGRES_DB" \
    -p "$POSTGRES_PORT:5432" \
    "$POSTGRES_IMAGE" >/dev/null
fi

log "waiting for postgres readiness"
for _ in {1..60}; do
  if docker exec "$POSTGRES_CONTAINER" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

docker exec "$POSTGRES_CONTAINER" pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null

if [[ ! -f "$SCHEMA_FILE" ]]; then
  log "schema file not found: $SCHEMA_FILE"
  exit 1
fi

log "applying schema and seed data"
docker exec -i "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" < "$SCHEMA_FILE" >/dev/null

if [[ -x "$ROOT_DIR/scripts/sync-onchain-projects.sh" ]]; then
  log "syncing approved projects to crowdfunding_core (best effort)"
  if ! "$ROOT_DIR/scripts/sync-onchain-projects.sh"; then
    log "warning: on-chain project sync failed; continue"
  fi
fi

log "done"
log "database url: postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$POSTGRES_PORT/$POSTGRES_DB"
