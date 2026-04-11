#!/usr/bin/env bash
# ─────────────────────────────────────────────
# AIVO Learning Platform — Backup Restore Test
# Downloads the latest backup from S3, restores to an ephemeral
# test database, validates row counts, and reports success/failure.
# ─────────────────────────────────────────────

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
TEST_DB="aivo_restore_test_${TIMESTAMP}"
BACKUP_DIR="/tmp/aivo-backup-test-${TIMESTAMP}"
EXIT_CODE=0

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  echo -e "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] $*"
}

log_success() {
  log "${GREEN}✓ $*${NC}"
}

log_warn() {
  log "${YELLOW}⚠ $*${NC}"
}

log_error() {
  log "${RED}✗ $*${NC}"
}

cleanup() {
  log "Cleaning up..."

  if [ -n "${DATABASE_URL:-}" ]; then
    local base_url="${DATABASE_URL%/*}"
    psql "${base_url}/postgres" -c "DROP DATABASE IF EXISTS \"${TEST_DB}\";" 2>/dev/null || true
  fi

  rm -rf "${BACKUP_DIR}" 2>/dev/null || true
  log "Cleanup complete."
}

trap cleanup EXIT

check_prerequisites() {
  log "Checking prerequisites..."

  local missing=()

  if [ -z "${DATABASE_URL:-}" ]; then
    missing+=("DATABASE_URL")
  fi

  if [ -z "${S3_BACKUP_BUCKET:-}" ]; then
    missing+=("S3_BACKUP_BUCKET")
  fi

  command -v psql >/dev/null 2>&1 || missing+=("psql")
  command -v aws >/dev/null 2>&1 || missing+=("aws-cli")
  command -v gunzip >/dev/null 2>&1 || missing+=("gunzip")

  if [ ${#missing[@]} -gt 0 ]; then
    log_error "Missing prerequisites: ${missing[*]}"
    exit 1
  fi

  log_success "All prerequisites met."
}

find_latest_backup() {
  log "Finding latest PostgreSQL backup in S3..."

  local latest
  latest=$(aws s3 ls "s3://${S3_BACKUP_BUCKET}/backups/" \
    | grep "pg-" \
    | sort \
    | tail -1 \
    | awk '{print $4}')

  if [ -z "$latest" ]; then
    log_error "No PostgreSQL backups found in s3://${S3_BACKUP_BUCKET}/backups/"
    exit 1
  fi

  log_success "Latest backup: ${latest}"
  echo "$latest"
}

download_backup() {
  local backup_file="$1"

  log "Downloading backup: ${backup_file}..."
  mkdir -p "${BACKUP_DIR}"

  local start_time
  start_time=$(date +%s)

  aws s3 cp "s3://${S3_BACKUP_BUCKET}/backups/${backup_file}" "${BACKUP_DIR}/${backup_file}" \
    --only-show-errors

  local end_time
  end_time=$(date +%s)
  local duration=$((end_time - start_time))

  local size
  size=$(du -h "${BACKUP_DIR}/${backup_file}" | cut -f1)

  log_success "Downloaded ${backup_file} (${size}) in ${duration}s"

  log "Verifying backup file integrity..."
  if gunzip -t "${BACKUP_DIR}/${backup_file}" 2>/dev/null; then
    log_success "Backup file integrity verified (gzip OK)"
  else
    log_error "Backup file is corrupted (gzip test failed)"
    exit 1
  fi
}

create_test_database() {
  log "Creating ephemeral test database: ${TEST_DB}..."

  local base_url="${DATABASE_URL%/*}"
  psql "${base_url}/postgres" -c "CREATE DATABASE \"${TEST_DB}\";" 2>/dev/null

  log_success "Test database created: ${TEST_DB}"
}

restore_backup() {
  local backup_file="$1"

  log "Restoring backup to test database..."

  local base_url="${DATABASE_URL%/*}"
  local start_time
  start_time=$(date +%s)

  if ! gunzip -c "${BACKUP_DIR}/${backup_file}" \
    | psql "${base_url}/${TEST_DB}" --quiet --no-psqlrc 2>&1; then
    log_error "Database restore failed"
    exit 1
  fi

  local end_time
  end_time=$(date +%s)
  local duration=$((end_time - start_time))

  log_success "Restore completed in ${duration}s"
}

get_table_counts() {
  local db_url="$1"
  psql "${db_url}" --no-psqlrc --tuples-only --no-align -c "
    SELECT tablename || ':' || n_live_tup
    FROM pg_stat_user_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  " 2>/dev/null
}

validate_row_counts() {
  log "Validating row counts..."

  local base_url="${DATABASE_URL%/*}"
  local prod_db_url="${DATABASE_URL}"
  local test_db_url="${base_url}/${TEST_DB}"

  log "Fetching production row counts..."
  psql "${prod_db_url}" --no-psqlrc -c "ANALYZE;" 2>/dev/null || true
  local prod_counts
  prod_counts=$(get_table_counts "${prod_db_url}")

  log "Fetching restored row counts..."
  psql "${test_db_url}" --no-psqlrc -c "ANALYZE;" 2>/dev/null || true
  local test_counts
  test_counts=$(get_table_counts "${test_db_url}")

  local total_tables=0
  local matched_tables=0
  local mismatched_tables=0
  local missing_tables=0

  printf "\n%-40s %12s %12s %s\n" "TABLE" "PRODUCTION" "RESTORED" "STATUS"
  printf "%-40s %12s %12s %s\n" "$(printf '%.0s─' {1..40})" "$(printf '%.0s─' {1..12})" "$(printf '%.0s─' {1..12})" "$(printf '%.0s─' {1..8})"

  while IFS=':' read -r table prod_count; do
    [ -z "$table" ] && continue
    total_tables=$((total_tables + 1))

    local test_count
    test_count=$(echo "$test_counts" | grep "^${table}:" | cut -d: -f2)

    if [ -z "$test_count" ]; then
      printf "%-40s %12s %12s ${RED}%s${NC}\n" "$table" "$prod_count" "MISSING" "FAIL"
      missing_tables=$((missing_tables + 1))
      EXIT_CODE=1
    elif [ "$prod_count" -eq "$test_count" ]; then
      printf "%-40s %12s %12s ${GREEN}%s${NC}\n" "$table" "$prod_count" "$test_count" "OK"
      matched_tables=$((matched_tables + 1))
    else
      local diff=$((prod_count - test_count))
      if [ "$prod_count" -gt 0 ]; then
        local pct_diff=$(( (diff * 100) / prod_count ))
        if [ "$pct_diff" -lt 0 ]; then
          pct_diff=$(( -pct_diff ))
        fi
        if [ "$pct_diff" -le 5 ]; then
          printf "%-40s %12s %12s ${YELLOW}%s${NC}\n" "$table" "$prod_count" "$test_count" "DRIFT"
          matched_tables=$((matched_tables + 1))
        else
          printf "%-40s %12s %12s ${RED}%s${NC}\n" "$table" "$prod_count" "$test_count" "FAIL"
          mismatched_tables=$((mismatched_tables + 1))
          EXIT_CODE=1
        fi
      else
        printf "%-40s %12s %12s ${GREEN}%s${NC}\n" "$table" "$prod_count" "$test_count" "OK"
        matched_tables=$((matched_tables + 1))
      fi
    fi
  done <<< "$prod_counts"

  echo ""
  log "Validation Summary:"
  log "  Total tables:      ${total_tables}"
  log_success "Matched:           ${matched_tables}"
  [ "$mismatched_tables" -gt 0 ] && log_error "Mismatched:        ${mismatched_tables}"
  [ "$missing_tables" -gt 0 ] && log_error "Missing:           ${missing_tables}"
}

validate_schema() {
  log "Validating schema objects..."

  local base_url="${DATABASE_URL%/*}"
  local test_db_url="${base_url}/${TEST_DB}"

  local table_count
  table_count=$(psql "${test_db_url}" --no-psqlrc --tuples-only --no-align -c "
    SELECT count(*) FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  " 2>/dev/null)

  local index_count
  index_count=$(psql "${test_db_url}" --no-psqlrc --tuples-only --no-align -c "
    SELECT count(*) FROM pg_indexes WHERE schemaname = 'public';
  " 2>/dev/null)

  local fk_count
  fk_count=$(psql "${test_db_url}" --no-psqlrc --tuples-only --no-align -c "
    SELECT count(*) FROM pg_constraint WHERE contype = 'f';
  " 2>/dev/null)

  log_success "Tables: ${table_count}, Indexes: ${index_count}, Foreign Keys: ${fk_count}"

  if [ "${table_count:-0}" -eq 0 ]; then
    log_error "No tables found in restored database — restore may have failed"
    EXIT_CODE=1
  fi
}

print_report() {
  echo ""
  echo "═══════════════════════════════════════════════════"
  if [ "$EXIT_CODE" -eq 0 ]; then
    log_success "BACKUP RESTORE TEST: PASSED"
  else
    log_error "BACKUP RESTORE TEST: FAILED"
  fi
  echo "═══════════════════════════════════════════════════"
  echo ""
}

main() {
  echo "═══════════════════════════════════════════════════"
  log "AIVO Backup Restore Test — Starting"
  echo "═══════════════════════════════════════════════════"
  echo ""

  check_prerequisites

  local backup_file
  backup_file=$(find_latest_backup)

  download_backup "$backup_file"
  create_test_database
  restore_backup "$backup_file"
  validate_schema
  validate_row_counts
  print_report

  exit "$EXIT_CODE"
}

main "$@"
