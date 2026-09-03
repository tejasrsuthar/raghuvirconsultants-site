from pymongo import MongoClient
from typing import List
from contexts.compliance.domain.entities import AuditLog
from bootstrap.settings import settings

class AuditLogRepository:
    def __init__(self):
        self.client = MongoClient(settings.MONGODB_URI)
        self.db = self.client[settings.DB_NAME]
        self.collection = self.db["audit_logs"]

    def save(self, log: AuditLog) -> None:
        self.collection.insert_one(log.model_dump(mode="json"))

    def get_recent(self, limit: int = 100) -> List[AuditLog]:
        docs = self.collection.find().sort("timestamp", -1).limit(limit)
        return [AuditLog(**doc) for doc in docs]
