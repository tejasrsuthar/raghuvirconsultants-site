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

    def save(self, subscription: Subscription) -> None:
        data = subscription.model_dump(mode="json")
        self.collection.update_one(
            {"id": data["id"]},
            {"$set": data},
            upsert=True
        )

    def get_by_id(self, id: str) -> Optional[Subscription]:
        data = self.collection.find_one({"id": id})
        if not data:
            return None
        return Subscription(**data)

    def get_by_gateway_id(self, gateway_id: str) -> Optional[Subscription]:
        data = self.collection.find_one({"gateway_subscription_id": gateway_id})
        if not data:
            return None
        return Subscription(**data)

    def get_active_for_investor(self, investor_id: str) -> List[Subscription]:
        cursor = self.collection.find({
            "investor_id": investor_id,
            "status": SubscriptionStatus.ACTIVE.value
        })
        return [Subscription(**data) for data in cursor]

    def find_all(self, skip: int = 0, limit: int = 100) -> List[Subscription]:
        cursor = self.collection.find().skip(skip).limit(limit)
        return [Subscription(**data) for data in cursor]
