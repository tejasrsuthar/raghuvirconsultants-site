from typing import Callable, Dict, List, Type, Any
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class DomainEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    occurred_at: datetime = Field(default_factory=datetime.utcnow)

EventHandler = Callable[[DomainEvent], None]

class EventDispatcher:
    def __init__(self):
        self._handlers: Dict[Type[DomainEvent], List[EventHandler]] = {}

    def register(self, event_type: Type[DomainEvent], handler: EventHandler) -> None:
        if event_type not in self._handlers:
            self._handlers[event_type] = []
        self._handlers[event_type].append(handler)

    def dispatch(self, event: DomainEvent) -> None:
        event_type = type(event)
        if event_type in self._handlers:
            for handler in self._handlers[event_type]:
                handler(event)
        # Note: could log unhandled events here if necessary

# Global dispatcher instance
dispatcher = EventDispatcher()
