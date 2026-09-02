# ADR-003: MinIO WORM Object Storage for Research Publishing

## Status
Accepted

## Context
SEBI compliance mandates that published institutional research reports must be tamper-proof and retained for a minimum of 5 years. Standard file storage on VPS disks is susceptible to accidental deletion or unauthorized modification.

## Decision
We decided to deploy MinIO as an S3-compatible object storage layer alongside the FastAPI application. We explicitly rely on MinIO's Write-Once-Read-Many (WORM) Object Lock capabilities.
- The `raghuvir-reports` bucket is configured with Object Lock.
- Once a report PDF is uploaded via the `MinIOStorage` adapter, it cannot be mutated or deleted by any user (including the admin) until the retention period expires.
- We implemented a dynamic `PDFWatermarker` utility using `pypdf` and `reportlab` that securely stamps the investor's ID and timestamp onto the PDF at download time, leaving the immutable source object pristine.

## Consequences
- **Positive:** Full regulatory compliance for data immutability. Decouples heavy file storage from the MongoDB metadata database.
- **Negative:** Requires running an additional Docker container (MinIO server + Console) on the VPS, consuming more memory.
