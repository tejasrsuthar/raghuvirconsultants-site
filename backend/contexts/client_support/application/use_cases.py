from typing import List, Optional
from contexts.client_support.domain.entities import Ticket, Message, TicketPriority, TicketStatus
from contexts.client_support.domain.ports import TicketRepository

class SupportUseCases:
    def __init__(self, repo: TicketRepository):
        self.repo = repo

    def create_ticket(self, investor_id: str, subject: str, message_content: str, priority: str = TicketPriority.NORMAL) -> Ticket:
        ticket = Ticket(investor_id=investor_id, subject=subject, priority=priority)
        ticket.add_message(sender_id=investor_id, content=message_content, is_from_admin=False)
        self.repo.save(ticket)
        return ticket

    def add_message_to_ticket(self, ticket_id: str, sender_id: str, content: str, is_from_admin: bool = False) -> Ticket:
        ticket = self.repo.get_by_id(ticket_id)
        if not ticket:
            raise ValueError("Ticket not found")
            
        ticket.add_message(sender_id=sender_id, content=content, is_from_admin=is_from_admin)
        self.repo.save(ticket)
        return ticket

    def close_ticket(self, ticket_id: str) -> Ticket:
        ticket = self.repo.get_by_id(ticket_id)
        if not ticket:
            raise ValueError("Ticket not found")
            
        ticket.close()
        self.repo.save(ticket)
        return ticket

    def get_investor_tickets(self, investor_id: str, skip: int = 0, limit: int = 100) -> List[Ticket]:
        return self.repo.get_by_investor(investor_id, skip, limit)

    def get_all_tickets(self, status: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Ticket]:
        return self.repo.get_all(status, skip, limit)
    
    def get_ticket(self, ticket_id: str) -> Optional[Ticket]:
        return self.repo.get_by_id(ticket_id)
