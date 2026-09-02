from typing import List, Optional
from pymongo.collection import Collection
from contexts.research_publishing.domain.entities import Report
from contexts.research_publishing.domain.ports import ReportRepository
from datetime import datetime, timezone

class MongoReportRepository(ReportRepository):
    def __init__(self, collection: Collection):
        self.collection = collection

    def save(self, report: Report) -> None:
        data = report.model_dump()
        self.collection.update_one(
            {"id": report.id},
            {"$set": data},
            upsert=True
        )

    def get_by_id(self, report_id: str) -> Optional[Report]:
        data = self.collection.find_one({"id": report_id})
        if data:
            return Report(**data)
        return None

    def find_published(self, skip: int = 0, limit: int = 100) -> List[Report]:
        cursor = self.collection.find({"status": "published"}).sort("published_at", -1).skip(skip).limit(limit)
        return [Report(**data) for data in cursor]
        
    def find_all(self, skip: int = 0, limit: int = 100) -> List[Report]:
        cursor = self.collection.find().sort("created_at", -1).skip(skip).limit(limit)
        return [Report(**data) for data in cursor]

    def get_addenda(self, parent_report_id: str) -> List[Report]:
        cursor = self.collection.find({
            "parent_report_id": parent_report_id,
            "status": "published"
        }).sort("published_at", 1)
        return [Report(**data) for data in cursor]
