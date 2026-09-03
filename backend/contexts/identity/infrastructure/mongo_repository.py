from typing import Optional, List
from contexts.identity.domain.entities import Investor
from contexts.identity.domain.repositories import InvestorRepository
from shared_kernel.value_objects import InvestorId
from app.infrastructure.db import db
from datetime import datetime
import re

class MongoInvestorRepository(InvestorRepository):
    def __init__(self):
        self.collection = db["investors"]
        # Basic index creation is usually done outside, but we can ensure it here
        self.collection.create_index("email", unique=True)
        self.collection.create_index("username", unique=True)

    def save(self, investor: Investor) -> None:
        data = investor.model_dump(mode="json")
        data["id"] = investor.id.value # Store id as string
        
        self.collection.update_one(
            {"id": data["id"]},
            {"$set": data},
            upsert=True
        )

    def get_by_id(self, id: InvestorId) -> Optional[Investor]:
        data = self.collection.find_one({"id": id.value})
        if not data:
            return None
        return self._to_entity(data)

    def get_by_email(self, email: str) -> Optional[Investor]:
        data = self.collection.find_one({"email": {"$regex": f"^{re.escape(email)}$", "$options": "i"}})
        if not data:
            return None
        return self._to_entity(data)

    def get_by_username(self, username: str) -> Optional[Investor]:
        data = self.collection.find_one({"username": {"$regex": f"^{re.escape(username)}$", "$options": "i"}})
        if not data:
            return None
        return self._to_entity(data)

    def find_all(self, skip: int = 0, limit: int = 100) -> List[Investor]:
        cursor = self.collection.find().skip(skip).limit(limit)
        return [self._to_entity(data) for data in cursor]

    def get_all_paginated(self, page: int = 1, limit: int = 10) -> tuple[List[Investor], int]:
        total = self.collection.count_documents({})
        skip = (page - 1) * limit
        cursor = self.collection.find().sort("created_at", -1).skip(skip).limit(limit)
        return [self._to_entity(doc) for doc in cursor], total

    def delete(self, investor_id: str) -> bool:
        res = self.collection.delete_one({"id": investor_id})
        return res.deleted_count > 0

    def _to_entity(self, data: dict) -> Investor:
        # Convert string ID back to InvestorId
        data["id"] = InvestorId(value=data["id"])
        
        # Always inject the latest role permissions from code (roles.py) 
        # instead of relying on the stale nested object stored in MongoDB
        if "role" in data:
            role_name = data["role"].get("name") if isinstance(data["role"], dict) else str(data["role"])
            try:
                from contexts.identity.domain.roles import get_role_by_name
                latest_role = get_role_by_name(role_name)
                data["role"] = latest_role.model_dump()
            except Exception:
                pass

        return Investor(**data)
