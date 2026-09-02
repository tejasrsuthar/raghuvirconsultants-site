from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr
from enum import Enum
from datetime import datetime
from shared_kernel.value_objects import InvestorId, PermissionKey

class UserStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"

class Role(BaseModel):
    name: str = Field(description="Name of the role (e.g. admin, investor)")
    permissions: List[PermissionKey] = Field(default_factory=list)

    def has_permission(self, key: str) -> bool:
        return any(p.key == key for p in self.permissions)

class Investor(BaseModel):
    id: InvestorId = Field(default_factory=InvestorId.generate)
    email: EmailStr
    full_name: str
    username: str
    hashed_password: Optional[str] = None
    role: Role
    status: UserStatus = UserStatus.ACTIVE
    two_factor_enabled: bool = False
    two_factor_secret: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def update_role(self, new_role: Role) -> None:
        self.role = new_role
        self.updated_at = datetime.utcnow()

    def update_status(self, new_status: UserStatus) -> None:
        self.status = new_status
        self.updated_at = datetime.utcnow()

    def enable_2fa(self, secret: str) -> None:
        self.two_factor_enabled = True
        self.two_factor_secret = secret
        self.updated_at = datetime.utcnow()

    def disable_2fa(self) -> None:
        self.two_factor_enabled = False
        self.two_factor_secret = None
        self.updated_at = datetime.utcnow()
