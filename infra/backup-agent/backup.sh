#!/usr/bin/env bash
# ─────────────────────────────────────────────
# AIVO Learning Platform — Backup Agent
# Performs PostgreSQL and Redis backups with S3 upload
# ─────────────────────────────────────────────

set -euo pipefail

LOG_FILE="/app/logs/last-run.log"
BACKUP_DIR="/app/backups"
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")

log() {
  echo "[$(date -u +"%Y-%m-%d %H:%M:%S UTC")] $*" | tee -a "$LOG_FILE"
}

cleanup_old_backups() {
  log "Cleaning up backups older than ${BACKUP_RETENTION_DAYS:-30} days..."
  find "$BACKUP_DIR" -type f -mtime "+${BACKUP_RETENTION_DAYS:-30}" -delete 2>/dev/null || true
}

backup_postgres() {
  local db_url="${DATABASE_URL:?DATABASE_URL is required}"
  local output_file="$BACKUP_DIR/pg-${TIMESTAMP}.sql.gz"

  log "Starting PostgreSQL backup..."
  pg_dump "$db_url" \
    --no-owner \
    --no-privileges \
    --clean \
    --if-exists \
    --verbose 2>>"$LOG_FILE" | gzip > "$output_file"

  local size
  size=$(du -h "$output_file" | cut -f1)
  log "PostgreSQL backup complete: $output_file ($size)"
  echo "$output_file"
}

backup_redis() {
  local redis_url="${REDIS_URL:-}"
  if [ -z "$redis_url" ]; then
    log "REDIS_URL not set, skipping Redis backup"
    return 0
  fi

  local output_file="$BACKUP_DIR/redis-${TIMESTAMP}.rdb.gz"

  log "Starting Redis backup..."
  # Trigger BGSAVE and wait
  redis-cli -u "$redis_url" BGSAVE 2>>"$LOG_FILE" || true
  sleep 5

  # Dump and compress
  redis-cli -u "$redis_url" --rdb - 2>>"$LOG_FILE" | gzip > "$output_file" || {
    log "WARNING: Redis backup failed (non-fatal)"
    return 0
  }

  local size
  size=$(du -h "$output_file" | cut -f1)
  log "Redis backup complete: $output_file ($size)"
  echo "$output_file"
}

upload_to_s3() {
  local file="$1"
  local bucket="${S3_BACKUP_BUCKET:-}"

  if [ -z "$bucket" ]; then
    log "S3_BACKUP_BUCKET not set, skipping upload for $(basename "$file")"
    return 0
  fi

  local s3_key="backups/$(basename "$file")"
  log "Uploading $(basename "$file") to s3://$bucket/$s3_key..."

  aws s3 cp "$file" "s3://$bucket/$s3_key" \
    --storage-class STANDARD_IA \
    --only-show-errors 2>>"$LOG_FILE"

  log "Upload complete: s3://$bucket/$s3_key"
}

main() {
  log "═══════════════════════════════════════"
  log "AIVO Backup Agent — Starting"
  log "═══════════════════════════════════════"

  cleanup_old_backups

  # PostgreSQL backup
  pg_file=$(backup_postgres)
  upload_to_s3 "$pg_file"

  # Redis backup
  redis_file=$(backup_redis)
  if [ -n "$redis_file" ]; then
    upload_to_s3 "$redis_file"
  fi

  log "═══════════════════════════════════════"
  log "AIVO Backup Agent — Complete"
  log "═══════════════════════════════════════"
}

main "$@"
