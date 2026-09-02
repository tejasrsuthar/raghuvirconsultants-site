from fastapi import Request
from contexts.client_support.infrastructure.mongo_repository import MongoTicketRepository
from contexts.client_support.application.use_cases import SupportUseCases

def get_ticket_repository(request: Request) -> MongoTicketRepository:
    return MongoTicketRepository(request.app.state.mongodb.tickets)

def get_support_use_cases(request: Request) -> SupportUseCases:
    repo = get_ticket_repository(request)
    return SupportUseCases(repo)
