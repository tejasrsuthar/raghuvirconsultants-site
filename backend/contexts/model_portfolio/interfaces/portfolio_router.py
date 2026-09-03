from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from contexts.model_portfolio.application.use_cases import ModelPortfolioUseCases
from contexts.model_portfolio.interfaces.dependencies import get_portfolio_use_cases
from contexts.identity.interfaces.dependencies import get_current_user, require_permission
from contexts.identity.domain.entities import Investor

router = APIRouter(prefix="/portfolio", tags=["Model Portfolio"])

class PositionModel(BaseModel):
    ticker: str
    weight: float
    conviction_score: int
    entry_price: Optional[float] = None
    target_price: Optional[float] = None
    rationale: Optional[str] = None

class RebalanceRequest(BaseModel):
    holdings: List[PositionModel]
    cash_weight: float

class PortfolioResponse(BaseModel):
    id: str
    name: str
    plan_tier_required: str
    cash_weight: float
    holdings: List[PositionModel]
    last_rebalanced_at: str

@router.get("/", response_model=PortfolioResponse)
def get_model_portfolio(
    investor: Investor = Depends(get_current_user),
    use_cases: ModelPortfolioUseCases = Depends(get_portfolio_use_cases)
):
    portfolio = use_cases.get_portfolio()
    
    # Check access. In real life, verify active subscription to portfolio_yearly.
    # We will simulate the lock logic on frontend.
    
    return PortfolioResponse(
        id=portfolio.id,
        name=portfolio.name,
        plan_tier_required=portfolio.plan_tier_required,
        cash_weight=portfolio.cash_weight,
        holdings=[PositionModel(**h.model_dump()) for h in portfolio.holdings],
        last_rebalanced_at=portfolio.last_rebalanced_at.isoformat()
    )

@router.get("/admin", response_model=PortfolioResponse)
def get_admin_model_portfolio(
    admin: Investor = Depends(require_permission("portfolio:write")),
    use_cases: ModelPortfolioUseCases = Depends(get_portfolio_use_cases)
):
    portfolio = use_cases.get_portfolio()
    return PortfolioResponse(
        id=portfolio.id,
        name=portfolio.name,
        plan_tier_required=portfolio.plan_tier_required,
        cash_weight=portfolio.cash_weight,
        holdings=[PositionModel(**h.model_dump()) for h in portfolio.holdings],
        last_rebalanced_at=portfolio.last_rebalanced_at.isoformat()
    )

@router.post("/admin/rebalance", response_model=PortfolioResponse)
def rebalance_portfolio(
    request: RebalanceRequest,
    admin: Investor = Depends(require_permission("portfolio:write")),
    use_cases: ModelPortfolioUseCases = Depends(get_portfolio_use_cases)
):
    try:
        # Convert PositionModel to PortfolioPosition internally inside usecases, or pass dicts
        # Let's import PortfolioPosition
        from contexts.model_portfolio.domain.entities import PortfolioPosition
        
        holdings = [PortfolioPosition(**h.model_dump()) for h in request.holdings]
        portfolio = use_cases.rebalance_portfolio(holdings, request.cash_weight)
        
        return PortfolioResponse(
            id=portfolio.id,
            name=portfolio.name,
            plan_tier_required=portfolio.plan_tier_required,
            cash_weight=portfolio.cash_weight,
            holdings=[PositionModel(**h.model_dump()) for h in portfolio.holdings],
            last_rebalanced_at=portfolio.last_rebalanced_at.isoformat()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
