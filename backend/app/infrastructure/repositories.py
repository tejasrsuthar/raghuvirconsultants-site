from typing import Optional, List, Tuple, TypeVar, Generic, Type, Any
import uuid
from datetime import datetime
from pydantic import BaseModel
from app.infrastructure.db import db
from app.domain.entities import (
    ResearchReport, Stock, Subscription, ActivityLog,
    SmallcaseItem, ServiceOffering, Notification, BlogPost, PlatformSettings, NewsItem
)

T = TypeVar("T", bound=BaseModel)

class BaseMongoRepository(Generic[T]):
    def __init__(self, collection_name: str, entity_class: Type[T], sort_field: str = "created_at"):
        self.collection = db[collection_name]
        self.entity_class = entity_class
        self.sort_field = sort_field

    def _to_entity(self, data: Optional[dict]) -> Optional[T]:
        return self.entity_class(**data) if data else None

    def create(self, item: T) -> T:
        d = item.model_dump()
        if not d.get("id"):
            d["id"] = str(uuid.uuid4())
        
        # Inject standard timestamp if present in model
        if hasattr(self.entity_class, "__fields__"):
            fields = self.entity_class.__fields__
        else:
            fields = self.entity_class.model_fields # Pydantic v2
            
        if self.sort_field in fields and self.sort_field not in d:
            d[self.sort_field] = datetime.utcnow()
            
        self.collection.insert_one(d)
        return self._to_entity(d)

    def get_by_id(self, item_id: str) -> Optional[T]:
        res = self.collection.find_one({"id": item_id})
        return self._to_entity(res)

    def get_all_paginated(self, page: int = 1, limit: int = 10, query: dict = None) -> Tuple[List[T], int]:
        if query is None:
            query = {}
        total = self.collection.count_documents(query)
        skip = (page - 1) * limit
        cursor = self.collection.find(query).sort(self.sort_field, -1).skip(skip).limit(limit)
        return [self._to_entity(doc) for doc in cursor], total

    def update(self, item_id: str, item_data: Any) -> Optional[T]:
        # Handle both Pydantic models and dicts
        if isinstance(item_data, BaseModel):
            d = item_data.model_dump(exclude_unset=True)
        else:
            d = dict(item_data)
            
        d.pop("id", None)
        if not d:
            return self.get_by_id(item_id)
            
        self.collection.update_one({"id": item_id}, {"$set": d})
        return self.get_by_id(item_id)

    def delete(self, item_id: str) -> bool:
        res = self.collection.delete_one({"id": item_id})
        return res.deleted_count > 0

class ResearchReportRepository(BaseMongoRepository[ResearchReport]):
    def __init__(self):
        super().__init__("research_reports", ResearchReport, "published_at")
        
    def update_status(self, report_id: str, status: str) -> Optional[ResearchReport]:
        return self.update(report_id, {"status": status})


class StockRepository(BaseMongoRepository[Stock]):
    def __init__(self):
        super().__init__("stocks", Stock, "added_at")


class SubscriptionRepository(BaseMongoRepository[Subscription]):
    def __init__(self):
        super().__init__("subscriptions", Subscription)

    def create_or_update(self, sub: Subscription) -> Subscription:
        sub_dict = sub.model_dump()
        if not sub_dict.get("id"):
            sub_dict["id"] = str(uuid.uuid4())
        self.collection.update_one(
            {"user_id": sub.user_id, "service_type": sub.service_type},
            {"$set": sub_dict},
            upsert=True
        )
        data = self.collection.find_one({"user_id": sub.user_id, "service_type": sub.service_type})
        return self._to_entity(data)

    def get_active_subscription(self, user_id: str, service_type: str) -> Optional[Subscription]:
        data = self.collection.find_one({
            "user_id": user_id,
            "service_type": service_type,
            "status": "active",
            "expires_at": {"$gt": datetime.utcnow()}
        })
        return self._to_entity(data)


class ActivityLogRepository(BaseMongoRepository[ActivityLog]):
    def __init__(self):
        super().__init__("activity_logs", ActivityLog, "timestamp")

    def get_by_user_id(self, user_id: str) -> List[ActivityLog]:
        cursor = self.collection.find({"user_id": user_id}).sort("timestamp", -1)
        return [self._to_entity(doc) for doc in cursor]


class SmallcaseRepository(BaseMongoRepository[SmallcaseItem]):
    def __init__(self):
        super().__init__("smallcases", SmallcaseItem)


class ServiceOfferingRepository(BaseMongoRepository[ServiceOffering]):
    def __init__(self):
        super().__init__("service_offerings", ServiceOffering)


class NotificationRepository(BaseMongoRepository[Notification]):
    def __init__(self):
        super().__init__("notifications", Notification)

    def get_all_paginated(self, page: int = 1, limit: int = 10, status: Optional[str] = None) -> Tuple[List[Notification], int]:
        query = {"status": status} if status else None
        return super().get_all_paginated(page, limit, query)

    def update_status(self, item_id: str, status: str) -> Optional[Notification]:
        return self.update(item_id, {"status": status})


class BlogPostRepository(BaseMongoRepository[BlogPost]):
    def __init__(self):
        super().__init__("blog_posts", BlogPost)

    def get_all_paginated(self, page: int = 1, limit: int = 10, tag: Optional[str] = None) -> Tuple[List[BlogPost], int]:
        query = {"tags": tag} if tag else None
        return super().get_all_paginated(page, limit, query)


class PlatformSettingsRepository(BaseMongoRepository[PlatformSettings]):
    def __init__(self):
        super().__init__("platform_settings", PlatformSettings, "updated_at")

    def get(self) -> PlatformSettings:
        res = self.collection.find_one({"id": "global_settings"})
        if not res:
            settings = PlatformSettings()
            self.collection.insert_one(settings.model_dump())
            return settings
        return self._to_entity(res)

    def update(self, settings: PlatformSettings) -> PlatformSettings:
        d = settings.model_dump()
        d["updated_at"] = datetime.utcnow()
        self.collection.update_one({"id": "global_settings"}, {"$set": d}, upsert=True)
        return self._to_entity(d)


class NewsRepository(BaseMongoRepository[NewsItem]):
    def __init__(self):
        super().__init__("news_items", NewsItem)

