from typing import List, Optional
from pymongo.collection import Collection
from contexts.client_support.domain.entities import Ticket
from contexts.client_support.domain.ports import TicketRepository

class MongoTicketRepository(TicketRepository):
    def __init__(self, collection: Collection):
        self.collection = collection

    def save(self, ticket: Ticket) -> None:
        data = ticket.model_dump()
        self.collection.update_one(
            {"id": ticket.id},
            {"$set": data},
            upsert=True
        )

    def get_by_id(self, ticket_id: str) -> Optional[Ticket]:
        data = self.collection.find_one({"id": ticket_id})
        if data:
            return Ticket(**data)
        return None

    def get_by_investor(self, investor_id: str, skip: int = 0, limit: int = 100) -> List[Ticket]:
        cursor = self.collection.find({"investor_id": investor_id}).sort("updated_at", -1).skip(skip).limit(limit)
        return [Ticket(**doc) for doc in cursor]

    def get_all(self, status: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Ticket]:
        query = {}
        if status:
            query["status"] = status
        cursor = self.collection.find(query).sort("updated_at", -1).skip(skip).limit(limit)
        return [Ticket(**doc) for doc in cursor]
