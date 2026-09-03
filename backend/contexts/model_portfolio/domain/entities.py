from typing import List, Optional
from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
import uuid

class PortfolioPosition(BaseModel):
    ticker: str
    weight: float = Field(ge=0.0, le=100.0)
    conviction_score: int = Field(ge=1, le=5) # 1 to 5 stars/level
    entry_price: Optional[float] = None
    target_price: Optional[float] = None
    rationale: Optional[str] = None

class ModelPortfolio(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Core Equity Portfolio"
    plan_tier_required: str = "portfolio_yearly"
    holdings: List[PortfolioPosition] = Field(default_factory=list)
    cash_weight: float = Field(default=100.0, ge=0.0, le=100.0)
    last_rebalanced_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def rebalance(self, new_holdings: List[PortfolioPosition], new_cash_weight: float):
        total_weight = sum(h.weight for h in new_holdings) + new_cash_weight
        if abs(total_weight - 100.0) > 0.01:
            raise ValueError(f"Total portfolio weight (holdings + cash) must equal 100%. Got {total_weight}%")
        
        self.holdings = new_holdings
        self.cash_weight = new_cash_weight
        self.last_rebalanced_at = datetime.now(timezone.utc)
        self.updated_at = datetime.now(timezone.utc)
