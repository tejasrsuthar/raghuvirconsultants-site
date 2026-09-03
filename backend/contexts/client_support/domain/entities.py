from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

class TicketStatus(str):
    OPEN = "open"
    CLOSED = "closed"

class TicketPriority(str):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str  # Investor ID or Admin ID
    content: str
    is_from_admin: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Ticket(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    investor_id: str
    subject: str
    status: str = TicketStatus.OPEN
    priority: str = TicketPriority.NORMAL
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def add_message(self, sender_id: str, content: str, is_from_admin: bool = False):
        if self.status == TicketStatus.CLOSED:
            raise ValueError("Cannot add message to a closed ticket")
        msg = Message(sender_id=sender_id, content=content, is_from_admin=is_from_admin)
        self.messages.append(msg)
        self.updated_at = datetime.now(timezone.utc)

    def close(self):
        self.status = TicketStatus.CLOSED
        self.updated_at = datetime.now(timezone.utc)
