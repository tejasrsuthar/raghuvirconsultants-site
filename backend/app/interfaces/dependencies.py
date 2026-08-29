from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from app.infrastructure.repositories import UserRepository, SubscriptionRepository
from app.domain.entities import User, UserRole, UserStatus, ServiceType

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
user_repo = UserRepository()
sub_repo = SubscriptionRepository()

def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
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
    user = user_repo.get_by_email(email)
    if user is None:
        raise credentials_exception
    if user.status == UserStatus.SUSPENDED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended")
    if user.status == UserStatus.DISABLED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is disabled")
    if user.status == UserStatus.BLACKLISTED:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is blacklisted")
    return user

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def require_reports_subscription(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role == UserRole.ADMIN:
        return current_user
    active_sub = sub_repo.get_active_subscription(current_user.id, ServiceType.REPORTS.value)
    if not active_sub:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active subscription to Research Reports service is required"
        )
    return current_user

def require_portfolio_subscription(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role == UserRole.ADMIN:
        return current_user
    active_sub = sub_repo.get_active_subscription(current_user.id, ServiceType.PORTFOLIO.value)
    if not active_sub:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Active subscription to Model Portfolio service is required"
        )
    return current_user

