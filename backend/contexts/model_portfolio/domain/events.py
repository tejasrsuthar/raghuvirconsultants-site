from datetime import datetime, timezone
from typing import List, Dict
from pydantic import BaseModel, Field
import uuid

class PortfolioRebalancedEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    portfolio_id: str
    rebalanced_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    # Dict mapping ticker -> weight for easy diffing/notification
    new_weights: Dict[str, float]
    old_weights: Dict[str, float]
    new_cash_weight: float
    old_cash_weight: float
