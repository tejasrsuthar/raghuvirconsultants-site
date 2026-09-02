from typing import Optional, Dict, Any, List
from contexts.billing.domain.entities import Subscription, Plan
from contexts.billing.domain.ports import SubscriptionRepository, PaymentGatewayPort
from contexts.identity.domain.repositories import InvestorRepository

class BillingUseCases:
    def __init__(
        self, 
        subscription_repo: SubscriptionRepository, 
        payment_gateway: PaymentGatewayPort,
        investor_repo: InvestorRepository
    ):
        self.subscription_repo = subscription_repo
        self.payment_gateway = payment_gateway
        self.investor_repo = investor_repo

    def get_investor_subscriptions(self, investor_id: str) -> List[Subscription]:
        return self.subscription_repo.get_active_for_investor(investor_id)
        
    def get_all_subscriptions(self, skip: int = 0, limit: int = 100) -> List[Subscription]:
        return self.subscription_repo.find_all(skip=skip, limit=limit)

    def subscribe_to_plan(self, investor_id: str, plan_id: str) -> Dict[str, Any]:
        investor = self.investor_repo.get_by_id(investor_id)
        if not investor:
            raise ValueError("Investor not found")
            
        # Hardcoding the gateway plan ID for demonstration based on the generic plan_id.
        # In a real system, you'd fetch the Plan from a repository or config mapping.
        # e.g., plan_id="reports_yearly" -> gateway_plan_id="plan_XXXXXX"
        gateway_plan_id = f"plan_{plan_id}_mock" 

        # Ideally, check if the customer exists in Razorpay, or create them.
        # We will create them for this demonstration if we didn't store a gateway_customer_id yet
        # (Assuming we store it on Investor later, for now we just create a fresh one)
        gateway_cust_id = self.payment_gateway.create_customer(
            investor.full_name, investor.email, investor.phone or "0000000000"
        )
        
        # Create Subscription in Gateway
        gateway_sub = self.payment_gateway.create_subscription(gateway_plan_id, gateway_cust_id)
        
        # Record Pending Subscription locally
        sub = Subscription(
            investor_id=investor_id,
            plan_id=plan_id,
            gateway_subscription_id=gateway_sub["gateway_subscription_id"]
        )
        self.subscription_repo.save(sub)
        
        return {
            "subscription_id": sub.id,
            "gateway_subscription_id": gateway_sub["gateway_subscription_id"],
            "short_url": gateway_sub.get("short_url")
        }

    def cancel_subscription(self, investor_id: str, subscription_id: str) -> bool:
        sub = self.subscription_repo.get_by_id(subscription_id)
        if not sub or sub.investor_id != investor_id:
            raise ValueError("Subscription not found or unauthorized")
            
        if sub.gateway_subscription_id:
            self.payment_gateway.cancel_subscription(sub.gateway_subscription_id)
            
        sub.cancel()
        self.subscription_repo.save(sub)
        return True
