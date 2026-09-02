from fastapi import APIRouter, Depends
from typing import List
from contexts.compliance.domain.entities import AuditLog
from contexts.compliance.infrastructure.repositories import AuditLogRepository
from contexts.identity.interfaces.dependencies import require_permission
from contexts.identity.domain.entities import Investor

router = APIRouter(prefix="/compliance", tags=["Compliance & Audit"])
audit_repo = AuditLogRepository()

@router.get("/logs", response_model=List[AuditLog])
def get_audit_logs(limit: int = 100, user: Investor = Depends(require_permission("settings:write"))):
    return audit_repo.get_recent(limit)
