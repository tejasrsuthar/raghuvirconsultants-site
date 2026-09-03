import razorpay
from typing import Dict, Any
from contexts.billing.domain.ports import PaymentGatewayPort
from bootstrap.settings import settings

class RazorpayGateway(PaymentGatewayPort):
    def __init__(self):
        self.client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        self.webhook_secret = settings.RAZORPAY_WEBHOOK_SECRET

    def create_customer(self, name: str, email: str, contact: str) -> str:
        data = {
            "name": name,
            "email": email,
            "contact": contact
        }
        customer = self.client.customer.create(data=data)
        return customer["id"]

    def create_subscription(self, gateway_plan_id: str, gateway_customer_id: str) -> Dict[str, Any]:
        data = {
            "plan_id": gateway_plan_id,
            "customer_id": gateway_customer_id,
            "total_count": 12 # Adjust based on plan logic if necessary
        }
        subscription = self.client.subscription.create(data=data)
        return {
            "gateway_subscription_id": subscription["id"],
            "short_url": subscription.get("short_url")
        }

    def cancel_subscription(self, gateway_subscription_id: str, at_period_end: bool = True) -> bool:
        cancel_data = {"cancel_at_cycle_end": 1 if at_period_end else 0}
        self.client.subscription.cancel(gateway_subscription_id, cancel_data)
        return True

    def verify_webhook_signature(self, payload: str, signature: str) -> bool:
        try:
            self.client.utility.verify_webhook_signature(payload, signature, self.webhook_secret)
            return True
        except razorpay.errors.SignatureVerificationError:
            return False
