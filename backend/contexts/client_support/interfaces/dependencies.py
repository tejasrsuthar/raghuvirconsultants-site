from fastapi import Request
from app.infrastructure.db import db
from contexts.client_support.infrastructure.mongo_repository import MongoTicketRepository
from contexts.client_support.application.use_cases import SupportUseCases

def get_ticket_repository(request: Request = None) -> MongoTicketRepository:
    return MongoTicketRepository(db.tickets)

def get_support_use_cases(request: Request) -> SupportUseCases:
    repo = get_ticket_repository(request)
    return SupportUseCases(repo)
