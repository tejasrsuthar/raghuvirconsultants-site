from datetime import datetime, timezone
from pydantic import BaseModel, Field
import uuid

class ReportPublishedEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    report_id: str
    title: str
    plan_tier_required: str
    published_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_addendum: bool = False
    parent_report_id: str | None = None
