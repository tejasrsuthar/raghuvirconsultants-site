# Disaster Recovery & Backup Plan

## Overview
This document outlines the backup and disaster recovery procedures for the Raghuvir Consultants site.

## Architecture
The system relies on two primary data stores:
1. **MongoDB**: Stores all relational and document data (Investors, Portfolios, Reports Metadata, Tickets).
2. **MinIO**: Object storage for secure WORM (Write Once Read Many) compliant PDF research reports.

## Backup Script
A backup script is available at `scripts/backup.sh`.
It performs a `mongodump` of the MongoDB database and copies the MinIO data directory.

```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

## Restoration Procedure
1. Extract the backup tarball.
2. Use `mongorestore` to restore the MongoDB dump.
3. Replace the MinIO data directory with the backed-up version and restart the MinIO server.

## MinIO WORM Compliance
MinIO is configured with Object Lock enabled for WORM compliance, ensuring that published research reports cannot be deleted or modified for a specific retention period. Backups capture the exact state of these locked objects.
