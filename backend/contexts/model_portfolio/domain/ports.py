from abc import ABC, abstractmethod
from typing import Optional
from .entities import ModelPortfolio

class PortfolioRepository(ABC):
    @abstractmethod
    def get_portfolio(self) -> Optional[ModelPortfolio]:
        """Gets the single global model portfolio."""
        pass
        
    @abstractmethod
    def save(self, portfolio: ModelPortfolio) -> None:
        """Saves the portfolio state."""
        pass
