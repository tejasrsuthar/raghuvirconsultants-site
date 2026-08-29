from fastapi import APIRouter, Depends, HTTPException, Query
from app.interfaces.schemas import (
    UserStatusUpdateRequest, UserRoleUpdateRequest, InvestorListItem, PaginatedResponse, 
    AdminInvestorCreateRequest, AdminInvestorProfileUpdate, AdminInvestorSubscriptionUpdate,
    AdminPasswordResetRequest, AdminUsernameUpdateRequest
)
from app.interfaces.dependencies import require_admin
from app.infrastructure.repositories import UserRepository, SubscriptionRepository
from app.domain.entities import User, UserStatus, UserRole, ServiceType, Subscription, SubscriptionStatus
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import math

router = APIRouter(prefix="/admin", tags=["Admin Operations"])
user_repo = UserRepository()
sub_repo = SubscriptionRepository()

def _build_investor_list_item(user: User) -> InvestorListItem:
    reports_sub = sub_repo.get_active_subscription(user.id, ServiceType.REPORTS.value)
    portfolio_sub = sub_repo.get_active_subscription(user.id, ServiceType.PORTFOLIO.value)
    
    return InvestorListItem(
        id=user.id,
        username=user.username,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        address=user.address,
        address_line1=user.address_line1,
        address_line2=user.address_line2,
        pincode=user.pincode,
        city=user.city,
        state=user.state,
        country=user.country or "India",
        pan_number=user.pan_number,
        date_of_birth=user.date_of_birth,
        kyc_status=user.kyc_status or "verified",
        risk_profile=user.risk_profile or "Moderate",
        admin_notes=user.admin_notes,
        role=user.role,
        status=user.status,
        created_at=user.created_at,
        subscribed_reports=reports_sub is not None,
        subscribed_portfolio=portfolio_sub is not None
    )

@router.get("/investors", response_model=PaginatedResponse)
@router.get("/users", response_model=PaginatedResponse)
def list_investors(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    admin: User = Depends(require_admin)
):
    users, total = user_repo.get_all_paginated(page, limit)
    pages = math.ceil(total / limit) if limit > 0 else 1
    
    items = [_build_investor_list_item(user) for user in users]
        
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        limit=limit,
        pages=pages
    )

@router.post("/investors")
@router.post("/users")
def create_investor_by_admin(
    req: AdminInvestorCreateRequest,
    admin: User = Depends(require_admin)
):
    from app.infrastructure.logging_utils import log_activity
    clean_username = req.username.strip().replace(" ", "")
    if not clean_username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
        
    existing_username = user_repo.get_by_username(clean_username)
    if existing_username:
        raise HTTPException(status_code=400, detail="Username already taken")
        
    email_to_use = req.email.strip() if req.email else f"{clean_username}@rc.placeholder"
    existing_email = user_repo.get_by_email(email_to_use)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    if len(req.password) < 7:
        raise HTTPException(status_code=400, detail="Password must be at least 7 characters long")
        
    hashed_pwd = get_password_hash(req.password)
    user = User(
        username=clean_username,
        full_name=req.full_name,
        email=email_to_use,
        phone=req.phone,
        pan_number=req.pan_number,
        date_of_birth=req.date_of_birth,
        address_line1=req.address_line1,
        address_line2=req.address_line2,
        pincode=req.pincode,
        city=req.city,
        state=req.state,
        country=req.country or "India",
        role=req.role or UserRole.INVESTOR,
        status=req.status or UserStatus.ACTIVE,
        kyc_status=req.kyc_status or "verified",
        risk_profile=req.risk_profile or "Moderate",
        admin_notes=req.admin_notes,
        hashed_password=hashed_pwd
    )
    created = user_repo.create(user)
    
    if req.subscribed_reports:
        sub = Subscription(
            user_id=created.id,
            service_type=ServiceType.REPORTS,
            status=SubscriptionStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=365)
        )
        sub_repo.create_or_update(sub)
        
    if req.subscribed_portfolio:
        sub = Subscription(
            user_id=created.id,
            service_type=ServiceType.PORTFOLIO,
            status=SubscriptionStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=365)
        )
        sub_repo.create_or_update(sub)

    log_activity(created.id, created.username, "admin_create_investor", f"Admin created new investor account: {created.username} ({created.email})")
    return {"message": "Investor account successfully created", "id": created.id}

@router.put("/investors/{investor_id}/status")
@router.put("/users/{investor_id}/status")
def update_investor_status(
    investor_id: str,
    req: UserStatusUpdateRequest,
    admin: User = Depends(require_admin)
):
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    if user.role == "admin" and req.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Cannot alter status of an administrator")
        
    success = user_repo.update_status(investor_id, req.status)
    if not success:
         raise HTTPException(status_code=400, detail="Could not update status")
         
    return {"message": f"Investor status successfully updated to {req.status.value}"}

@router.put("/investors/{investor_id}/role")
@router.put("/users/{investor_id}/role")
def update_investor_role(
    investor_id: str,
    req: UserRoleUpdateRequest,
    admin: User = Depends(require_admin)
):
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    success = user_repo.update_role(investor_id, req.role)
    if not success:
         raise HTTPException(status_code=400, detail="Could not update role")
         
    return {"message": f"User role successfully updated to {req.role.value}"}

@router.put("/investors/{investor_id}/password")
@router.put("/users/{investor_id}/password")
def reset_investor_password(
    investor_id: str,
    req: AdminPasswordResetRequest,
    admin: User = Depends(require_admin)
):
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    if len(req.password) < 7:
        raise HTTPException(status_code=400, detail="Password must be at least 7 characters long")
        
    hashed = get_password_hash(req.password)
    success = user_repo.update_password(investor_id, hashed)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update password")
        
    return {"message": f"Password successfully reset for {user.username}"}

@router.put("/investors/{investor_id}/username")
@router.put("/users/{investor_id}/username")
def update_investor_username(
    investor_id: str,
    req: AdminUsernameUpdateRequest,
    admin: User = Depends(require_admin)
):
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    clean_username = req.username.strip().replace(" ", "")
    if not clean_username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
        
    if clean_username != user.username:
        existing = user_repo.get_by_username(clean_username)
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
            
    success = user_repo.update_profile(investor_id, username=clean_username)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update username")
        
    return {"message": "Username successfully updated"}

@router.delete("/investors/{investor_id}")
@router.delete("/users/{investor_id}")
def delete_investor(
    investor_id: str,
    admin: User = Depends(require_admin)
):
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete an administrator account")
        
    success = user_repo.delete(investor_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete investor account")
        
    return {"message": "Investor account successfully deleted"}

@router.get("/investors/{investor_id}", response_model=InvestorListItem)
@router.get("/users/{investor_id}", response_model=InvestorListItem)
def get_investor_detail(
    investor_id: str,
    admin: User = Depends(require_admin)
):
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    return _build_investor_list_item(user)

@router.get("/investors/{investor_id}/activities")
@router.get("/users/{investor_id}/activities")
def get_investor_activities(
    investor_id: str,
    admin: User = Depends(require_admin)
):
    from app.infrastructure.repositories import ActivityLogRepository
    activity_repo = ActivityLogRepository()
    return activity_repo.get_by_user_id(investor_id)

@router.put("/investors/{investor_id}/profile")
@router.put("/users/{investor_id}/profile")
def update_investor_profile_by_admin(
    investor_id: str,
    req: AdminInvestorProfileUpdate,
    admin: User = Depends(require_admin)
):
    from app.infrastructure.logging_utils import log_activity
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    if req.email != user.email:
        existing = user_repo.get_by_email(req.email)
        if existing and existing.id != investor_id:
            raise HTTPException(status_code=400, detail="Email already registered by another user")

    user_repo.update_profile(
        investor_id,
        email=req.email,
        full_name=req.full_name,
        phone=req.phone,
        pan_number=req.pan_number,
        address_line1=req.address_line1,
        address_line2=req.address_line2,
        pincode=req.pincode,
        date_of_birth=req.date_of_birth,
        city=req.city,
        state=req.state,
        country=req.country,
        role=req.role,
        status=req.status,
        kyc_status=req.kyc_status,
        risk_profile=req.risk_profile,
        admin_notes=req.admin_notes
    )

    # Manage subscription flags if passed
    if req.subscribed_reports is not None:
        if req.subscribed_reports:
            sub = Subscription(
                user_id=investor_id,
                service_type=ServiceType.REPORTS,
                status=SubscriptionStatus.ACTIVE,
                expires_at=datetime.utcnow() + timedelta(days=365)
            )
            sub_repo.create_or_update(sub)
        else:
            sub = Subscription(
                user_id=investor_id,
                service_type=ServiceType.REPORTS,
                status=SubscriptionStatus.EXPIRED,
                expires_at=datetime.utcnow() - timedelta(days=1)
            )
            sub_repo.create_or_update(sub)

    if req.subscribed_portfolio is not None:
        if req.subscribed_portfolio:
            sub = Subscription(
                user_id=investor_id,
                service_type=ServiceType.PORTFOLIO,
                status=SubscriptionStatus.ACTIVE,
                expires_at=datetime.utcnow() + timedelta(days=365)
            )
            sub_repo.create_or_update(sub)
        else:
            sub = Subscription(
                user_id=investor_id,
                service_type=ServiceType.PORTFOLIO,
                status=SubscriptionStatus.EXPIRED,
                expires_at=datetime.utcnow() - timedelta(days=1)
            )
            sub_repo.create_or_update(sub)

    log_activity(investor_id, user.username, "admin_edit_profile", f"Admin updated investor profile: {user.username} ({req.email})")
    return {"message": "Investor profile updated successfully"}

@router.put("/investors/{investor_id}/subscriptions")
@router.put("/users/{investor_id}/subscriptions")
def update_investor_subscription_by_admin(
    investor_id: str,
    req: AdminInvestorSubscriptionUpdate,
    admin: User = Depends(require_admin)
):
    from app.infrastructure.logging_utils import log_activity
    user = user_repo.get_by_id(investor_id)
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")

    if req.active:
        expires_at = datetime.utcnow() + timedelta(days=365) # 1 year subscription
        sub = Subscription(
            user_id=investor_id,
            service_type=req.service_type,
            status=SubscriptionStatus.ACTIVE,
            expires_at=expires_at
        )
        sub_repo.create_or_update(sub)
        log_activity(investor_id, user.username, "admin_activate_sub", f"Admin activated {req.service_type.value} subscription")
    else:
        sub = Subscription(
            user_id=investor_id,
            service_type=req.service_type,
            status=SubscriptionStatus.EXPIRED,
            expires_at=datetime.utcnow() - timedelta(days=1)
        )
        sub_repo.create_or_update(sub)
        log_activity(investor_id, user.username, "admin_deactivate_sub", f"Admin deactivated {req.service_type.value} subscription")

    return {"message": f"Investor subscription for {req.service_type.value} updated successfully"}
