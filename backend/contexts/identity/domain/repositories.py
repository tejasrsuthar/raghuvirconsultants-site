from abc import ABC, abstractmethod
from typing import Optional, List
from .entities import Investor
from shared_kernel.value_objects import InvestorId

class InvestorRepository(ABC):
    @abstractmethod
    def save(self, investor: Investor) -> None:
        """Saves a new or updated investor."""
        pass

    @abstractmethod
    def get_by_id(self, id: InvestorId) -> Optional[Investor]:
        """Retrieves an investor by their ID."""
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Investor]:
        """Retrieves an investor by their email address."""
        pass

    @abstractmethod
    def get_by_username(self, username: str) -> Optional[Investor]:
        """Retrieves an investor by their username."""
        pass

    @abstractmethod
    def find_all(self, skip: int = 0, limit: int = 100) -> List[Investor]:
        """Retrieves a list of investors."""
        pass
