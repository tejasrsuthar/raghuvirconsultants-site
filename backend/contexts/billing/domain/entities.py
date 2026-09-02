from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from enum import Enum
from datetime import datetime
import uuid

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"
    EXPIRED = "expired"
    PENDING = "pending"

class Plan(BaseModel):
    id: str
    name: str
    description: str
    amount: float
    currency: str = "INR"
    interval: str = "yearly"
    gateway_plan_id: Optional[str] = None # e.g. plan_HXXXXXX in Razorpay

class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    investor_id: str
    plan_id: str
    status: SubscriptionStatus = SubscriptionStatus.PENDING
    gateway_subscription_id: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    def activate(self, start: datetime, end: datetime, gateway_id: str):
        self.status = SubscriptionStatus.ACTIVE
        self.current_period_start = start
        self.current_period_end = end
        self.gateway_subscription_id = gateway_id
        self.updated_at = datetime.utcnow()
        
    def cancel(self):
        self.cancel_at_period_end = True
        self.updated_at = datetime.utcnow()
