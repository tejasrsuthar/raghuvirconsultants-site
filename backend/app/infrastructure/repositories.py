import uuid
from datetime import datetime
from typing import Optional, List, Tuple
from app.domain.entities import (
    User, ResearchReport, Stock, Subscription, UserStatus, UserRole, ActivityLog,
    SmallcaseItem, ServiceOffering, Notification, BlogPost, PlatformSettings, NewsItem
)
from app.infrastructure.db import db

class UserRepository:
    def __init__(self):
        self.collection = db["users"]
        self.collection.create_index("email")
        self.collection.create_index("username")
        self.collection.create_index("created_at")

    def create(self, user: User) -> User:
        user_dict = user.model_dump()
        user_dict["id"] = str(uuid.uuid4())
        user_dict["created_at"] = datetime.utcnow()
        self.collection.insert_one(user_dict)
        return User(**user_dict)

    def get_by_id(self, user_id: str) -> Optional[User]:
        data = self.collection.find_one({"id": user_id})
        return User(**data) if data else None

    def get_by_email(self, email: str) -> Optional[User]:
        data = self.collection.find_one({"email": email})
        if not data and email:
            import re
            data = self.collection.find_one({"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}})
        return User(**data) if data else None

    def get_by_username(self, username: str) -> Optional[User]:
        data = self.collection.find_one({"username": username})
        if not data and username:
            import re
            data = self.collection.find_one({"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}})
        return User(**data) if data else None

    def get_by_google_id(self, google_id: str) -> Optional[User]:
        data = self.collection.find_one({"google_id": google_id})
        return User(**data) if data else None

    def update_status(self, user_id: str, status: UserStatus) -> bool:
        res = self.collection.update_one({"id": user_id}, {"$set": {"status": status.value if isinstance(status, UserStatus) else status}})
        return res.modified_count > 0

    def update_role(self, user_id: str, role: UserRole) -> bool:
        res = self.collection.update_one({"id": user_id}, {"$set": {"role": role.value if isinstance(role, UserRole) else role}})
        return res.modified_count > 0

    def update_password(self, user_id: str, hashed_password: str) -> bool:
        res = self.collection.update_one({"id": user_id}, {"$set": {"hashed_password": hashed_password}})
        return res.modified_count > 0

    def update_profile(
        self, user_id: str, username: Optional[str] = None, email: Optional[str] = None, 
        phone: Optional[str] = None, address: Optional[str] = None, hashed_password: Optional[str] = None,
        full_name: Optional[str] = None, pan_number: Optional[str] = None,
        address_line1: Optional[str] = None, address_line2: Optional[str] = None,
        pincode: Optional[str] = None, date_of_birth: Optional[str] = None,
        city: Optional[str] = None, state: Optional[str] = None, country: Optional[str] = None,
        kyc_status: Optional[str] = None, risk_profile: Optional[str] = None,
        admin_notes: Optional[str] = None, role: Optional[str] = None, status: Optional[str] = None,
        **extra
    ) -> bool:
        update_fields = {}
        if username is not None:
            update_fields["username"] = username
        if email is not None:
            update_fields["email"] = email
        if phone is not None:
            update_fields["phone"] = phone
        if address is not None:
            update_fields["address"] = address
        if hashed_password is not None:
            update_fields["hashed_password"] = hashed_password
        if full_name is not None:
            update_fields["full_name"] = full_name
        if pan_number is not None:
            update_fields["pan_number"] = pan_number.upper().strip()
        if address_line1 is not None:
            update_fields["address_line1"] = address_line1
        if address_line2 is not None:
            update_fields["address_line2"] = address_line2
        if pincode is not None:
            update_fields["pincode"] = pincode
        if date_of_birth is not None:
            update_fields["date_of_birth"] = date_of_birth
        if city is not None:
            update_fields["city"] = city
        if state is not None:
            update_fields["state"] = state
        if country is not None:
            update_fields["country"] = country
        if kyc_status is not None:
            update_fields["kyc_status"] = kyc_status
        if risk_profile is not None:
            update_fields["risk_profile"] = risk_profile
        if admin_notes is not None:
            update_fields["admin_notes"] = admin_notes
        if role is not None:
            update_fields["role"] = role.value if hasattr(role, 'value') else role
        if status is not None:
            update_fields["status"] = status.value if hasattr(status, 'value') else status

        if not update_fields:
            return False
        res = self.collection.update_one({"id": user_id}, {"$set": update_fields})
        return res.modified_count > 0 or res.matched_count > 0

    def get_all_paginated(self, page: int = 1, limit: int = 10) -> Tuple[List[User], int]:
        total = self.collection.count_documents({})
        skip = (page - 1) * limit
        cursor = self.collection.find().sort("created_at", -1).skip(skip).limit(limit)
        return [User(**doc) for doc in cursor], total

    def delete(self, user_id: str) -> bool:
        res = self.collection.delete_one({"id": user_id})
        return res.deleted_count > 0


class ResearchReportRepository:
    def __init__(self):
        self.collection = db["research_reports"]
        self.collection.create_index("published_at")
        self.collection.create_index("status")

    def create(self, report: ResearchReport) -> ResearchReport:
        dict_data = report.model_dump()
        dict_data["id"] = str(uuid.uuid4())
        dict_data["published_at"] = datetime.utcnow()
        self.collection.insert_one(dict_data)
        return ResearchReport(**dict_data)

    def get_by_id(self, report_id: str) -> Optional[ResearchReport]:
        data = self.collection.find_one({"id": report_id})
        return ResearchReport(**data) if data else None

    def get_all_paginated(self, page: int = 1, limit: int = 10) -> Tuple[List[ResearchReport], int]:
        total = self.collection.count_documents({})
        skip = (page - 1) * limit
        cursor = self.collection.find().sort("published_at", -1).skip(skip).limit(limit)
        return [ResearchReport(**doc) for doc in cursor], total

    def update(self, report_id: str, title: str, content: str, doc_link: Optional[str] = None) -> Optional[ResearchReport]:
        update_fields = {"title": title, "content": content}
        if doc_link is not None:
            update_fields["doc_link"] = doc_link
        self.collection.update_one({"id": report_id}, {"$set": update_fields})
        data = self.collection.find_one({"id": report_id})
        return ResearchReport(**data) if data else None

    def update_status(self, report_id: str, status: str) -> Optional[ResearchReport]:
        self.collection.update_one({"id": report_id}, {"$set": {"status": status}})
        data = self.collection.find_one({"id": report_id})
        return ResearchReport(**data) if data else None

    def delete(self, report_id: str) -> bool:
        res = self.collection.delete_one({"id": report_id})
        return res.deleted_count > 0


class StockRepository:
    def __init__(self):
        self.collection = db["stocks"]
        self.collection.create_index("added_at")

    def create(self, stock: Stock) -> Stock:
        dict_data = stock.model_dump()
        dict_data["id"] = str(uuid.uuid4())
        dict_data["added_at"] = datetime.utcnow()
        self.collection.insert_one(dict_data)
        return Stock(**dict_data)

    def get_by_id(self, stock_id: str) -> Optional[Stock]:
        data = self.collection.find_one({"id": stock_id})
        return Stock(**data) if data else None

    def get_all_paginated(self, page: int = 1, limit: int = 10) -> Tuple[List[Stock], int]:
        total = self.collection.count_documents({})
        skip = (page - 1) * limit
        cursor = self.collection.find().sort("added_at", -1).skip(skip).limit(limit)
        return [Stock(**doc) for doc in cursor], total

    def update(self, stock_id: str, stock_data: Stock) -> Optional[Stock]:
        dict_data = stock_data.model_dump(exclude_unset=True)
        dict_data.pop("id", None)
        self.collection.update_one({"id": stock_id}, {"$set": dict_data})
        data = self.collection.find_one({"id": stock_id})
        return Stock(**data) if data else None

    def delete(self, stock_id: str) -> bool:
        res = self.collection.delete_one({"id": stock_id})
        return res.deleted_count > 0


class SubscriptionRepository:
    def __init__(self):
        self.collection = db["subscriptions"]
        self.collection.create_index("user_id")

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
        return Subscription(**data) if data else None

    def get_active_subscription(self, user_id: str, service_type: str) -> Optional[Subscription]:
        data = self.collection.find_one({
            "user_id": user_id,
            "service_type": service_type,
            "status": "active",
            "expires_at": {"$gt": datetime.utcnow()}
        })
        return Subscription(**data) if data else None


class ActivityLogRepository:
    def __init__(self):
        self.collection = db["activity_logs"]
        self.collection.create_index("user_id")
        self.collection.create_index("timestamp")

    def create(self, log: ActivityLog) -> ActivityLog:
        log_dict = log.model_dump()
        if not log_dict.get("id"):
            log_dict["id"] = str(uuid.uuid4())
        self.collection.insert_one(log_dict)
        return ActivityLog(**log_dict)

    def get_by_user_id(self, user_id: str) -> List[ActivityLog]:
        cursor = self.collection.find({"user_id": user_id}).sort("timestamp", -1)
        return [ActivityLog(**doc) for doc in cursor]


class SmallcaseRepository:
    def __init__(self):
        self.collection = db["smallcases"]
        self.collection.create_index("created_at")

    def create(self, item: SmallcaseItem) -> SmallcaseItem:
        d = item.model_dump()
        d["id"] = str(uuid.uuid4())
        d["created_at"] = datetime.utcnow()
        self.collection.insert_one(d)
        return SmallcaseItem(**d)

    def get_all_paginated(self, page: int = 1, limit: int = 10) -> Tuple[List[SmallcaseItem], int]:
        total = self.collection.count_documents({})
        skip = (page - 1) * limit
        cursor = self.collection.find().sort("created_at", -1).skip(skip).limit(limit)
        return [SmallcaseItem(**doc) for doc in cursor], total

    def update(self, item_id: str, item_data: SmallcaseItem) -> Optional[SmallcaseItem]:
        d = item_data.model_dump(exclude_unset=True)
        d.pop("id", None)
        self.collection.update_one({"id": item_id}, {"$set": d})
        res = self.collection.find_one({"id": item_id})
        return SmallcaseItem(**res) if res else None

    def delete(self, item_id: str) -> bool:
        res = self.collection.delete_one({"id": item_id})
        return res.deleted_count > 0


class ServiceOfferingRepository:
    def __init__(self):
        self.collection = db["service_offerings"]
        self.collection.create_index("created_at")

    def create(self, item: ServiceOffering) -> ServiceOffering:
        d = item.model_dump()
        d["id"] = str(uuid.uuid4())
        d["created_at"] = datetime.utcnow()
        self.collection.insert_one(d)
        return ServiceOffering(**d)

    def get_all_paginated(self, page: int = 1, limit: int = 10) -> Tuple[List[ServiceOffering], int]:
        total = self.collection.count_documents({})
        skip = (page - 1) * limit
        cursor = self.collection.find().sort("created_at", -1).skip(skip).limit(limit)
        return [ServiceOffering(**doc) for doc in cursor], total

    def update(self, item_id: str, item_data: ServiceOffering) -> Optional[ServiceOffering]:
        d = item_data.model_dump(exclude_unset=True)
        d.pop("id", None)
        self.collection.update_one({"id": item_id}, {"$set": d})
        res = self.collection.find_one({"id": item_id})
        return ServiceOffering(**res) if res else None

    def delete(self, item_id: str) -> bool:
        res = self.collection.delete_one({"id": item_id})
        return res.deleted_count > 0


class NotificationRepository:
    def __init__(self):
        self.collection = db["notifications"]
        self.collection.create_index("created_at")
        self.collection.create_index("status")

    def create(self, item: Notification) -> Notification:
        d = item.model_dump()
        d["id"] = str(uuid.uuid4())
        d["created_at"] = datetime.utcnow()
        self.collection.insert_one(d)
        return Notification(**d)

    def get_all_paginated(self, page: int = 1, limit: int = 10, status: Optional[str] = None) -> Tuple[List[Notification], int]:
        query = {}
        if status:
            query["status"] = status
        total = self.collection.count_documents(query)
        skip = (page - 1) * limit
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        return [Notification(**doc) for doc in cursor], total

    def get_by_id(self, item_id: str) -> Optional[Notification]:
        data = self.collection.find_one({"id": item_id})
        return Notification(**data) if data else None

    def update(self, item_id: str, item_data: Notification) -> Optional[Notification]:
        d = item_data.model_dump(exclude_unset=True)
        d.pop("id", None)
        self.collection.update_one({"id": item_id}, {"$set": d})
        res = self.collection.find_one({"id": item_id})
        return Notification(**res) if res else None

    def update_status(self, item_id: str, status: str) -> Optional[Notification]:
        self.collection.update_one({"id": item_id}, {"$set": {"status": status}})
        res = self.collection.find_one({"id": item_id})
        return Notification(**res) if res else None

    def delete(self, item_id: str) -> bool:
        res = self.collection.delete_one({"id": item_id})
        return res.deleted_count > 0


class BlogPostRepository:
    def __init__(self):
        self.collection = db["blog_posts"]
        self.collection.create_index("created_at")
        self.collection.create_index("tags")

    def create(self, item: BlogPost) -> BlogPost:
        d = item.model_dump()
        d["id"] = str(uuid.uuid4())
        d["created_at"] = datetime.utcnow()
        self.collection.insert_one(d)
        return BlogPost(**d)

    def get_all_paginated(self, page: int = 1, limit: int = 10, tag: Optional[str] = None) -> Tuple[List[BlogPost], int]:
        query = {}
        if tag:
            query["tags"] = tag
        total = self.collection.count_documents(query)
        skip = (page - 1) * limit
        cursor = self.collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
        return [BlogPost(**doc) for doc in cursor], total

    def get_by_id(self, item_id: str) -> Optional[BlogPost]:
        res = self.collection.find_one({"id": item_id})
        return BlogPost(**res) if res else None

    def update(self, item_id: str, item_data: BlogPost) -> Optional[BlogPost]:
        d = item_data.model_dump(exclude_unset=True)
        d.pop("id", None)
        self.collection.update_one({"id": item_id}, {"$set": d})
        res = self.collection.find_one({"id": item_id})
        return BlogPost(**res) if res else None

    def delete(self, item_id: str) -> bool:
        res = self.collection.delete_one({"id": item_id})
        return res.deleted_count > 0


class PlatformSettingsRepository:
    def __init__(self):
        self.collection = db["platform_settings"]

    def get(self) -> PlatformSettings:
        res = self.collection.find_one({"id": "global_settings"})
        if not res:
            settings = PlatformSettings()
            self.collection.insert_one(settings.model_dump())
            return settings
        return PlatformSettings(**res)

    def update(self, settings: PlatformSettings) -> PlatformSettings:
        d = settings.model_dump()
        d["updated_at"] = datetime.utcnow()
        self.collection.update_one({"id": "global_settings"}, {"$set": d}, upsert=True)
        return PlatformSettings(**d)


class NewsRepository:
    def __init__(self):
        self.collection = db["news_items"]
        self.collection.create_index("created_at")

    def create(self, item: NewsItem) -> NewsItem:
        d = item.model_dump()
        d["id"] = str(uuid.uuid4())
        d["created_at"] = datetime.utcnow()
        self.collection.insert_one(d)
        return NewsItem(**d)

    def get_all_paginated(self, page: int = 1, limit: int = 10) -> Tuple[List[NewsItem], int]:
        total = self.collection.count_documents({})
        skip = (page - 1) * limit
        cursor = self.collection.find().sort("created_at", -1).skip(skip).limit(limit)
        return [NewsItem(**doc) for doc in cursor], total

    def delete(self, item_id: str) -> bool:
        res = self.collection.delete_one({"id": item_id})
        return res.deleted_count > 0
