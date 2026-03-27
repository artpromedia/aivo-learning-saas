FROM alpine:3.20

RUN apk add --no-cache \
    postgresql16-client \
    redis \
    bash \
    curl \
    gzip \
    jq \
    aws-cli \
    ca-certificates \
    tzdata

RUN addgroup -g 1001 -S backup && \
    adduser -S backup -u 1001 -G backup

WORKDIR /app

COPY backup.sh /app/backup.sh
RUN chmod +x /app/backup.sh

# Create directories for backup staging
RUN mkdir -p /app/backups /app/logs && \
    chown -R backup:backup /app

USER backup

ENV BACKUP_RETENTION_DAYS=30
ENV BACKUP_COMPRESSION=gzip
ENV TZ=UTC

HEALTHCHECK --interval=60s --timeout=10s --start-period=5s --retries=3 \
  CMD test -f /app/logs/last-run.log || echo "no backups yet"

ENTRYPOINT ["/app/backup.sh"]
