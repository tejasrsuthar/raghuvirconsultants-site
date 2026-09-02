from fastapi import APIRouter, Depends, HTTPException
from typing import List
from pydantic import BaseModel
from contexts.identity.application.use_cases import IdentityUseCases
from bootstrap.di import get_identity_use_cases
from contexts.identity.domain.entities import Investor
from contexts.identity.interfaces.dependencies import require_permission
from contexts.identity.domain.roles import get_role_by_name

router = APIRouter(prefix="/users", tags=["Identity & Access (Admin)"])

class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    role: str
    status: str
    two_factor_enabled: bool

class RoleUpdateRequest(BaseModel):
    role_name: str

@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = 0, 
    limit: int = 100, 
    use_cases: IdentityUseCases = Depends(get_identity_use_cases),
    admin: Investor = Depends(require_permission("users:read"))
):
    users = use_cases.repository.find_all(skip=skip, limit=limit)
    return [
        UserResponse(
            id=u.id.value,
            username=u.username,
            email=u.email,
            full_name=u.full_name,
            role=u.role.name,
            status=u.status.value,
            two_factor_enabled=u.two_factor_enabled
        ) for u in users
    ]

@router.put("/{user_id}/role")
def assign_role(
    user_id: str,
    req: RoleUpdateRequest,
    use_cases: IdentityUseCases = Depends(get_identity_use_cases),
    admin: Investor = Depends(require_permission("users:write"))
):
    try:
        new_role = get_role_by_name(req.role_name)
        investor = use_cases.assign_role(admin.id.value, user_id, new_role)
        return {"message": f"Role updated to {new_role.name}"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
