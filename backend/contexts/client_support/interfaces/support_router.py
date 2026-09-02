from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from contexts.client_support.application.use_cases import SupportUseCases
from contexts.client_support.interfaces.dependencies import get_support_use_cases
from contexts.identity.interfaces.dependencies import get_current_investor, require_permission
from contexts.identity.domain.entities import Investor

router = APIRouter(prefix="/support", tags=["Support"])

class CreateTicketRequest(BaseModel):
    subject: str
    message: str
    priority: Optional[str] = "normal"

class AddMessageRequest(BaseModel):
    message: str

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    content: str
    is_from_admin: bool
    timestamp: str

class TicketResponse(BaseModel):
    id: str
    investor_id: str
    subject: str
    status: str
    priority: str
    messages: List[MessageResponse]
    created_at: str
    updated_at: str

@router.post("/", response_model=TicketResponse)
def create_ticket(
    request: CreateTicketRequest,
    investor: Investor = Depends(get_current_investor),
    use_cases: SupportUseCases = Depends(get_support_use_cases)
):
    ticket = use_cases.create_ticket(
        investor_id=investor.id,
        subject=request.subject,
        message_content=request.message,
        priority=request.priority
    )
    return ticket.model_dump()

@router.get("/", response_model=List[TicketResponse])
def list_my_tickets(
    investor: Investor = Depends(get_current_investor),
    use_cases: SupportUseCases = Depends(get_support_use_cases)
):
    tickets = use_cases.get_investor_tickets(investor_id=investor.id)
    return [t.model_dump() for t in tickets]

@router.get("/{ticket_id}", response_model=TicketResponse)
def get_ticket(
    ticket_id: str,
    investor: Investor = Depends(get_current_investor),
    use_cases: SupportUseCases = Depends(get_support_use_cases)
):
    ticket = use_cases.get_ticket(ticket_id)
    if not ticket or (ticket.investor_id != investor.id and investor.role != "admin"):
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket.model_dump()

@router.post("/{ticket_id}/messages", response_model=TicketResponse)
def add_message(
    ticket_id: str,
    request: AddMessageRequest,
    investor: Investor = Depends(get_current_investor),
    use_cases: SupportUseCases = Depends(get_support_use_cases)
):
    try:
        is_admin = investor.role in ["admin", "super_admin"]
        ticket = use_cases.add_message_to_ticket(
            ticket_id=ticket_id,
            sender_id=investor.id,
            content=request.message,
            is_from_admin=is_admin
        )
        return ticket.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/admin/all", response_model=List[TicketResponse])
def list_all_tickets_admin(
    status: Optional[str] = None,
    admin: Investor = Depends(require_permission("manage_support")),
    use_cases: SupportUseCases = Depends(get_support_use_cases)
):
    tickets = use_cases.get_all_tickets(status=status)
    return [t.model_dump() for t in tickets]

@router.post("/admin/{ticket_id}/close", response_model=TicketResponse)
def close_ticket(
    ticket_id: str,
    admin: Investor = Depends(require_permission("manage_support")),
    use_cases: SupportUseCases = Depends(get_support_use_cases)
):
    try:
        ticket = use_cases.close_ticket(ticket_id)
        return ticket.model_dump()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
