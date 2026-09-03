from pydantic import BaseModel, Field, EmailStr
from typing import Any, Dict
from datetime import datetime
import uuid

class ValueObject(BaseModel):
    """Base class for all value objects, enforcing immutability."""
    model_config = {
        "frozen": True,
        "extra": "forbid"
    }

class InvestorId(ValueObject):
    value: str

    @classmethod
    def generate(cls) -> "InvestorId":
        return cls(value=uuid.uuid4().hex)

class Money(ValueObject):
    amount: int = Field(description="Amount in the smallest currency unit (e.g. paise)")
    currency: str = Field(default="INR", max_length=3)

    def __add__(self, other: "Money") -> "Money":
        if not isinstance(other, Money):
            raise TypeError("Can only add Money to Money")
        if self.currency != other.currency:
            raise ValueError("Cannot add Money with different currencies")
        return Money(amount=self.amount + other.amount, currency=self.currency)

    def __sub__(self, other: "Money") -> "Money":
        if not isinstance(other, Money):
            raise TypeError("Can only subtract Money from Money")
        if self.currency != other.currency:
            raise ValueError("Cannot subtract Money with different currencies")
        return Money(amount=self.amount - other.amount, currency=self.currency)

class PermissionKey(ValueObject):
    key: str = Field(min_length=1, max_length=50)

    def __str__(self):
        return self.key
