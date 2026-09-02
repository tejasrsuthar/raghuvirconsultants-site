#!/bin/bash
# Backup script for Raghuvir Consultants
# Handles MongoDB dump and MinIO data snapshot

set -e

BACKUP_DIR="/tmp/raghuvir_backups/$(date +%Y%m%d_%H%M%S)"
MONGO_URI="mongodb://localhost:27017/raghuvir"
MINIO_DATA_DIR="/tmp/minio_data"

echo "Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

echo "Dumping MongoDB..."
mongodump --uri="$MONGO_URI" --out="$BACKUP_DIR/mongo"

echo "Backing up MinIO objects..."
if [ -d "$MINIO_DATA_DIR" ]; then
    cp -r "$MINIO_DATA_DIR" "$BACKUP_DIR/minio"
else
    echo "WARNING: MinIO data directory not found at $MINIO_DATA_DIR"
fi

echo "Compressing backup..."
cd /tmp/raghuvir_backups
tar -czf "$BACKUP_DIR.tar.gz" "$(basename $BACKUP_DIR)"

echo "Cleaning up uncompressed files..."
rm -rf "$BACKUP_DIR"

echo "Backup complete: $BACKUP_DIR.tar.gz"
