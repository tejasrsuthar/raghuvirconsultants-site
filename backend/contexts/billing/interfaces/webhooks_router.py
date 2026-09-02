from fastapi import APIRouter, Request, HTTPException, Depends
from contexts.billing.infrastructure.razorpay_gateway import RazorpayGateway
# In a real app we'd inject this via DI, but instantiating directly for now
gateway = RazorpayGateway()

router = APIRouter(prefix="/webhooks/razorpay", tags=["Billing & Payments Webhooks"])

@router.post("")
async def razorpay_webhook(request: Request):
    payload = await request.body()
    signature = request.headers.get("X-Razorpay-Signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing signature")
        
    if not gateway.verify_webhook_signature(payload.decode('utf-8'), signature):
        raise HTTPException(status_code=400, detail="Invalid signature")
        
    try:
        event = await request.json()
        event_type = event.get("event")
        
        # Here we would dispatch domain events based on the webhook
        # e.g. subscription.charged, subscription.cancelled, subscription.halted
        
        return {"status": "success"}
    except Exception as e:
        import structlog
        logger = structlog.get_logger()
        logger.error("razorpay_webhook_processing_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Webhook processing failed")
