from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import Callable, Optional
from bootstrap.di import get_identity_use_cases
from contexts.identity.application.use_cases import IdentityUseCases
from contexts.identity.domain.entities import Investor
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    token: str = Depends(oauth2_scheme),
    use_cases: IdentityUseCases = Depends(get_identity_use_cases)
) -> Investor:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    user = use_cases.repository.get_by_email(email)
    if user is None:
        raise credentials_exception
        
    return user

def require_permission(permission: str) -> Callable:
    def dependency(user: Investor = Depends(get_current_user)) -> Investor:
        if not user.role.has_permission(permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Not enough permissions. Requires: {permission}"
            )
        return user
    return dependency
