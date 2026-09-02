from abc import ABC, abstractmethod
from typing import Optional, Dict, Any
from contexts.billing.domain.entities import Plan, Subscription

class PaymentGatewayPort(ABC):
    @abstractmethod
    def create_customer(self, name: str, email: str, contact: str) -> str:
        """Create a customer in the payment gateway and return the gateway customer ID."""
        pass

    @abstractmethod
    def create_subscription(self, gateway_plan_id: str, gateway_customer_id: str) -> Dict[str, Any]:
        """Create a subscription in the payment gateway and return details including checkout URL/ID."""
        pass

    @abstractmethod
    def cancel_subscription(self, gateway_subscription_id: str, at_period_end: bool = True) -> bool:
        """Cancel an active subscription in the payment gateway."""
        pass
        
    @abstractmethod
    def verify_webhook_signature(self, payload: str, signature: str) -> bool:
        """Verify that a webhook came from the payment gateway."""
        pass

class SubscriptionRepository(ABC):
    @abstractmethod
    def save(self, subscription: Subscription) -> None:
        pass
        
    @abstractmethod
    def get_by_id(self, id: str) -> Optional[Subscription]:
        pass
        
    @abstractmethod
    def get_by_gateway_id(self, gateway_id: str) -> Optional[Subscription]:
        pass
        
    @abstractmethod
    def get_active_for_investor(self, investor_id: str) -> list[Subscription]:
        pass
