from typing import List, Dict
from contexts.model_portfolio.domain.entities import ModelPortfolio, PortfolioPosition
from contexts.model_portfolio.domain.ports import PortfolioRepository
from contexts.model_portfolio.domain.events import PortfolioRebalancedEvent
from events.dispatcher import dispatcher

class ModelPortfolioUseCases:
    def __init__(self, repo: PortfolioRepository):
        self.repo = repo

    def get_portfolio(self) -> ModelPortfolio:
        portfolio = self.repo.get_portfolio()
        if not portfolio:
            # Create the default global portfolio if it doesn't exist
            portfolio = ModelPortfolio()
            self.repo.save(portfolio)
        return portfolio

    def rebalance_portfolio(self, new_holdings: List[PortfolioPosition], new_cash_weight: float) -> ModelPortfolio:
        portfolio = self.get_portfolio()
        
        old_weights = {h.ticker: h.weight for h in portfolio.holdings}
        old_cash = portfolio.cash_weight
        
        portfolio.rebalance(new_holdings, new_cash_weight)
        self.repo.save(portfolio)
        
        new_weights = {h.ticker: h.weight for h in portfolio.holdings}
        
        event = PortfolioRebalancedEvent(
            portfolio_id=portfolio.id,
            new_weights=new_weights,
            old_weights=old_weights,
            new_cash_weight=new_cash_weight,
            old_cash_weight=old_cash
        )
        dispatcher.dispatch(event)
        
        return portfolio
