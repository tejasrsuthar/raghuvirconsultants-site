from typing import Optional
from pymongo.collection import Collection
from contexts.model_portfolio.domain.entities import ModelPortfolio
from contexts.model_portfolio.domain.ports import PortfolioRepository

class MongoPortfolioRepository(PortfolioRepository):
    def __init__(self, collection: Collection):
        self.collection = collection

    def get_portfolio(self) -> Optional[ModelPortfolio]:
        # We only have one global portfolio for now
        data = self.collection.find_one({})
        if data:
            return ModelPortfolio(**data)
        return None

    def save(self, portfolio: ModelPortfolio) -> None:
        data = portfolio.model_dump()
        self.collection.update_one(
            {"id": portfolio.id},
            {"$set": data},
            upsert=True
        )
