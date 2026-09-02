from abc import ABC, abstractmethod
from typing import List, Optional
from .entities import Ticket

class TicketRepository(ABC):
    @abstractmethod
    def save(self, ticket: Ticket) -> None:
        pass

    @abstractmethod
    def get_by_id(self, ticket_id: str) -> Optional[Ticket]:
        pass

    @abstractmethod
    def get_by_investor(self, investor_id: str, skip: int = 0, limit: int = 100) -> List[Ticket]:
        pass

    @abstractmethod
    def get_all(self, status: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Ticket]:
        pass
