from typing import Optional, List
from datetime import datetime, timezone
from pydantic import BaseModel, Field, field_validator
import uuid

class ReportStatus(str):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class Report(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    summary: Optional[str] = None
    plan_tier_required: str = "reports_yearly"
    status: str = ReportStatus.DRAFT
    storage_key: Optional[str] = None  # Key in MinIO bucket
    original_filename: Optional[str] = None
    parent_report_id: Optional[str] = None  # For addenda
    published_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @field_validator('parent_report_id')
    def validate_addendum(cls, v, info):
        if v is not None and v == info.data.get('id'):
            raise ValueError("A report cannot be an addendum to itself")
        return v

    def publish(self):
        if self.status == ReportStatus.PUBLISHED:
            raise ValueError("Report is already published")
        if not self.storage_key:
            raise ValueError("Cannot publish report without a stored document")
        self.status = ReportStatus.PUBLISHED
        self.published_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)

    def mark_updated(self):
        self.updated_at = datetime.now(timezone.utc)
