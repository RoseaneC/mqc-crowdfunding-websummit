#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CONTRACT_IDS_FILE="$ROOT_DIR/.config/stellar/contract-ids/crowdfunding_core.json"

POSTGRES_CONTAINER="mqc-postgres-local"
POSTGRES_USER="postgres"
POSTGRES_DB="mqc_platform"
NETWORK_NAME="local"

log() {
  printf '[sync-onchain] %s\n' "$*"
}

map_tax_category() {
  case "$1" in
    EDUCACAO) echo 1 ;;
    SAUDE) echo 2 ;;
    SEGURANCA) echo 3 ;;
    ESPORTE) echo 4 ;;
    SOCIAL) echo 5 ;;
    CULTURA) echo 6 ;;
    *) echo 99 ;;
  esac
}

if ! command -v stellar >/dev/null 2>&1; then
  log "stellar CLI not found; skipping"
  exit 0
fi

if ! command -v docker >/dev/null 2>&1; then
  log "docker not found; skipping"
  exit 0
fi

if [[ ! -f "$CONTRACT_IDS_FILE" ]]; then
  log "contract id file not found: $CONTRACT_IDS_FILE; skipping"
  exit 0
fi

CONTRACT_ID="$(sed -n 's/.*"Standalone Network ; February 2017":"\([^"]*\)".*/\1/p' "$CONTRACT_IDS_FILE")"
if [[ -z "$CONTRACT_ID" ]]; then
  log "could not read crowdfunding_core contract id; skipping"
  exit 0
fi

if ! stellar contract invoke --id "$CONTRACT_ID" --source me --network "$NETWORK_NAME" --send no -- admin >/dev/null 2>&1; then
  log "crowdfunding_core is not reachable yet; skipping (run again after contract deploy)"
  exit 0
fi

ADMIN_ADDRESS="$(stellar keys address me --quiet)"
if [[ -z "$ADMIN_ADDRESS" ]]; then
  log "could not resolve local admin address from identity 'me'; skipping"
  exit 0
fi

query="select id, ngo_wallet, tax_category, ((target_xlm * 10000000)::numeric(20,0))::text as target_stroops, metadata_uri from projects where status = 'APPROVED' order by id"
rows="$(docker exec "$POSTGRES_CONTAINER" psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -A -F $'\t' -t -c "$query")"

if [[ -z "$rows" ]]; then
  log "no approved projects found in database"
  exit 0
fi

while IFS=$'\t' read -r project_id ngo_wallet tax_category target_stroops metadata_uri; do
  if [[ -z "$project_id" ]]; then
    continue
  fi

  if stellar contract invoke --id "$CONTRACT_ID" --source me --network "$NETWORK_NAME" --send no -- get_project --project_id "$project_id" >/dev/null 2>&1; then
    log "project $project_id already exists on-chain"
    continue
  fi

  tax_category_num="$(map_tax_category "$tax_category")"
  metadata_json="$(printf '"%s"' "$metadata_uri")"
  onchain_wallet="$ngo_wallet"
  if [[ ! "$ngo_wallet" =~ ^[GC][A-Z2-7]{55}$ ]]; then
    onchain_wallet="$ADMIN_ADDRESS"
    log "project $project_id has invalid ngo_wallet in DB; using admin address on-chain"
  fi

  log "creating on-chain project $project_id"
  stellar contract invoke --id "$CONTRACT_ID" --source me --network "$NETWORK_NAME" -- \
    create_project \
    --ngo_wallet "$onchain_wallet" \
    --tax_category "$tax_category_num" \
    --target_stroops "$target_stroops" \
    --metadata_uri "$metadata_json" >/dev/null
done <<< "$rows"

log "on-chain project sync complete"
