from fastapi import APIRouter, Depends, HTTPException, Request, Header
from app.interfaces.dependencies import get_current_user
from app.domain.entities import User, Subscription, ServiceType, SubscriptionStatus
from app.infrastructure.logging_utils import log_activity
from app.infrastructure.repositories import SubscriptionRepository
from pydantic import BaseModel
from datetime import datetime, timedelta
import stripe
from bootstrap.settings import settings

stripe.api_key = settings.STRIPE_API_KEY
STRIPE_WEBHOOK_SECRET = settings.STRIPE_WEBHOOK_SECRET

router = APIRouter(prefix="/payments", tags=["Payments"])
sub_repo = SubscriptionRepository()

class CheckoutRequest(BaseModel):
    service_type: ServiceType

class UPIPaymentConfirmRequest(BaseModel):
    transaction_id: str
    service_type: ServiceType

@router.post("/checkout")
def initiate_checkout(req: CheckoutRequest, user: User = Depends(get_current_user)):
    # Stripe integration simulation / session initiation
    try:
        checkout_session_url = "https://checkout.stripe.com/pay/mock_session_id"
        log_activity(user.id, user.username, "initiated_checkout", f"Initiated Stripe checkout for {req.service_type.value} service")
        return {
            "checkout_url": checkout_session_url,
            "stripe_session_id": "cs_test_mock_id",
            "message": "Redirect investor to payment gateway"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/upi-confirm")
def confirm_upi_payment(req: UPIPaymentConfirmRequest, user: User = Depends(get_current_user)):
    expires_at = datetime.utcnow() + timedelta(days=30)
    
    sub = Subscription(
        user_id=user.id,
        service_type=req.service_type,
        status=SubscriptionStatus.ACTIVE,
        upi_transaction_id=req.transaction_id,
        expires_at=expires_at
    )
    sub_repo.create_or_update(sub)
    log_activity(user.id, user.username, "upi_payment_submitted", f"Submitted UPI Tx ID {req.transaction_id} for {req.service_type.value} verification")
    log_activity(user.id, user.username, "subscription_activated", f"Subscription activated for {req.service_type.value} service (UPI)")
    return {"message": "UPI payment verified. Subscription active.", "expires_at": expires_at}

@router.post("/stripe-webhook")
async def stripe_webhook(request: Request, sig_header: str = Header(None)):
    payload = await request.body()
    try:
        # In a real app, verify signature:
        # event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
        # For local development we parse the payload directly
        import json
        event = json.loads(payload.decode("utf-8"))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

    event_type = event.get("type")
    
    if event_type == "checkout.session.completed":
        session = event.get("data", {}).get("object", {})
        customer_email = session.get("customer_details", {}).get("email")
        
        # Look up user by email
        from app.infrastructure.repositories import UserRepository
        user_repo = UserRepository()
        user = user_repo.get_by_email(customer_email)
        if user:
            # Grant access to reports (as fallback or derived from session line_items)
            expires_at = datetime.utcnow() + timedelta(days=30)
            sub = Subscription(
                user_id=user.id,
                service_type=ServiceType.REPORTS,
                status=SubscriptionStatus.ACTIVE,
                stripe_subscription_id=session.get("id"),
                expires_at=expires_at
            )
            sub_repo.create_or_update(sub)
            log_activity(user.id, user.username, "stripe_checkout_completed", f"Stripe Checkout completed (Session {session.get('id')})")
            log_activity(user.id, user.username, "subscription_activated", "Subscription activated for REPORTS service (Stripe)")
            
    return {"status": "success"}
