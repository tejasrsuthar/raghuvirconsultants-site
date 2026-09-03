from typing import Optional, List
from contexts.billing.domain.entities import Subscription, SubscriptionStatus
from contexts.billing.domain.ports import SubscriptionRepository
from shared_kernel.value_objects import InvestorId
from app.infrastructure.db import db
import re

class MongoSubscriptionRepository(SubscriptionRepository):
    def __init__(self):
        self.collection = db["subscriptions"]
        self.collection.create_index("investor_id")
        self.collection.create_index("gateway_subscription_id")

    def _map_data(self, data: dict) -> Subscription:
        if not data:
            return None
        # Handle legacy field mappings
        if "user_id" in data and "investor_id" not in data:
            data["investor_id"] = data.pop("user_id")
        if "service_id" in data and "plan_id" not in data:
            data["plan_id"] = data.pop("service_id")
        if "rpz_subscription_id" in data and "gateway_subscription_id" not in data:
            data["gateway_subscription_id"] = data.pop("rpz_subscription_id")
        
        # Ensure we have required fields to avoid ValidationError
        if "investor_id" not in data:
            data["investor_id"] = "legacy_unknown_investor"
        if "plan_id" not in data:
            data["plan_id"] = "legacy_unknown_plan"

        return Subscription(**data)

    def save(self, subscription: Subscription) -> None:
        data = subscription.model_dump(mode="json")
        self.collection.update_one(
            {"id": data["id"]},
            {"$set": data},
            upsert=True
        )

    def get_by_id(self, id: str) -> Optional[Subscription]:
        data = self.collection.find_one({"id": id})
        return self._map_data(data)

    def get_by_gateway_id(self, gateway_id: str) -> Optional[Subscription]:
        data = self.collection.find_one({"gateway_subscription_id": gateway_id})
        return self._map_data(data)

    def get_active_for_investor(self, investor_id: str) -> List[Subscription]:
        cursor = self.collection.find({
            "investor_id": investor_id,
            "status": SubscriptionStatus.ACTIVE.value
        })
        return [self._map_data(data) for data in cursor]

    def find_all(self, skip: int = 0, limit: int = 100) -> List[Subscription]:
        cursor = self.collection.find().skip(skip).limit(limit)
        return [self._map_data(data) for data in cursor]
