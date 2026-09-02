from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from pydantic import BaseModel
from contexts.billing.application.use_cases import BillingUseCases
from contexts.billing.interfaces.dependencies import get_billing_use_cases
from contexts.identity.domain.entities import Investor
from contexts.identity.interfaces.dependencies import get_current_investor

router = APIRouter(prefix="/billing", tags=["Billing & Subscriptions"])

class SubscribeRequest(BaseModel):
    plan_id: str

class SubscriptionResponse(BaseModel):
    id: str
    plan_id: str
    status: str
    gateway_subscription_id: str | None
    current_period_start: str | None
    current_period_end: str | None

@router.get("/subscriptions", response_model=List[SubscriptionResponse])
def get_my_subscriptions(
    investor: Investor = Depends(get_current_investor),
    use_cases: BillingUseCases = Depends(get_billing_use_cases)
):
    subs = use_cases.get_investor_subscriptions(investor.id.value)
    return [
        SubscriptionResponse(
            id=s.id,
            plan_id=s.plan_id,
            status=s.status.value,
            gateway_subscription_id=s.gateway_subscription_id,
            current_period_start=s.current_period_start.isoformat() if s.current_period_start else None,
            current_period_end=s.current_period_end.isoformat() if s.current_period_end else None
        ) for s in subs
    ]

@router.post("/subscribe")
def subscribe(
    req: SubscribeRequest,
    investor: Investor = Depends(get_current_investor),
    use_cases: BillingUseCases = Depends(get_billing_use_cases)
):
    try:
        result = use_cases.subscribe_to_plan(investor.id.value, req.plan_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/subscriptions/{subscription_id}/cancel")
def cancel_subscription(
    subscription_id: str,
    investor: Investor = Depends(get_current_investor),
    use_cases: BillingUseCases = Depends(get_billing_use_cases)
):
    try:
        success = use_cases.cancel_subscription(investor.id.value, subscription_id)
        return {"status": "cancelled" if success else "failed"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
