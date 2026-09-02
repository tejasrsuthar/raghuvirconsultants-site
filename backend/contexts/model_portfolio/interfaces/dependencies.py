from fastapi import Request
from contexts.model_portfolio.infrastructure.mongo_repository import MongoPortfolioRepository
from contexts.model_portfolio.application.use_cases import ModelPortfolioUseCases

def get_portfolio_repository(request: Request) -> MongoPortfolioRepository:
    return MongoPortfolioRepository(request.app.state.mongodb.portfolios)

def get_portfolio_use_cases(request: Request) -> ModelPortfolioUseCases:
    repo = get_portfolio_repository(request)
    return ModelPortfolioUseCases(repo)
