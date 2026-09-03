from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, Any
import uuid

class AuditLog(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    investor_id: Optional[str] = None
    action: str
    resource: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
