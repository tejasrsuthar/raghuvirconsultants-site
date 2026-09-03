from fastapi import APIRouter, Depends, HTTPException, Query
from app.interfaces.schemas import (
    UserStatusUpdateRequest, UserRoleUpdateRequest, InvestorListItem, PaginatedResponse, 
    AdminInvestorCreateRequest, AdminInvestorProfileUpdate, AdminInvestorSubscriptionUpdate,
    AdminPasswordResetRequest, AdminUsernameUpdateRequest
)
from contexts.identity.interfaces.dependencies import require_permission
from contexts.identity.infrastructure.mongo_repository import MongoInvestorRepository
from contexts.identity.domain.entities import Investor, UserStatus
from contexts.identity.domain.roles import get_role_by_name
from shared_kernel.value_objects import InvestorId
from app.infrastructure.repositories import SubscriptionRepository
from app.domain.entities import ServiceType, Subscription, SubscriptionStatus, UserRole
from app.core.security import get_password_hash
from datetime import datetime, timedelta
import math

router = APIRouter(prefix="/admin", tags=["Admin Operations"])
user_repo = MongoInvestorRepository()
sub_repo = SubscriptionRepository()

def _build_investor_list_item(user: Investor) -> InvestorListItem:
    reports_sub = sub_repo.get_active_subscription(user.id.value, ServiceType.REPORTS.value)
    portfolio_sub = sub_repo.get_active_subscription(user.id.value, ServiceType.PORTFOLIO.value)
    
    # Map back to UserRole enum for the schema response
    role_enum = UserRole.ADMIN if user.role.name == "ADMIN" or user.role.name == "SUPER_ADMIN" else UserRole.INVESTOR
    
    return InvestorListItem(
        id=user.id.value,
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
        role=role_enum,
        status=user.status,
        created_at=user.created_at,
        subscribed_reports=reports_sub is not None,
        subscribed_portfolio=portfolio_sub is not None
    )

@router.get("/investors", response_model=PaginatedResponse)
def list_investors(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=1000),
    admin: Investor = Depends(require_permission("users:read"))
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
def create_investor_by_admin(
    req: AdminInvestorCreateRequest,
    admin: Investor = Depends(require_permission("users:write"))
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
    
    role_name = req.role.value if req.role else "investor"
    new_role = get_role_by_name(role_name)
    
    user = Investor(
        username=clean_username,
        full_name=req.full_name or clean_username,
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
        role=new_role,
        status=UserStatus(req.status.value) if req.status else UserStatus.ACTIVE,
        kyc_status=req.kyc_status or "verified",
        risk_profile=req.risk_profile or "Moderate",
        admin_notes=req.admin_notes,
        hashed_password=hashed_pwd
    )
    user_repo.save(user)
    
    if req.subscribed_reports:
        sub = Subscription(
            user_id=user.id.value,
            service_type=ServiceType.REPORTS,
            status=SubscriptionStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=365)
        )
        sub_repo.create_or_update(sub)
        
    if req.subscribed_portfolio:
        sub = Subscription(
            user_id=user.id.value,
            service_type=ServiceType.PORTFOLIO,
            status=SubscriptionStatus.ACTIVE,
            expires_at=datetime.utcnow() + timedelta(days=365)
        )
        sub_repo.create_or_update(sub)

    log_activity(user.id.value, user.username, "admin_create_investor", f"Admin created new investor account: {user.username} ({user.email})")
    return {"message": "Investor account successfully created", "id": user.id.value}

@router.put("/investors/{investor_id}/status")
def update_investor_status(
    investor_id: str,
    req: UserStatusUpdateRequest,
    admin: Investor = Depends(require_permission("users:write"))
):
    user = user_repo.get_by_id(InvestorId(value=investor_id))
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    if user.role.name in ["ADMIN", "SUPER_ADMIN"] and req.status != UserStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Cannot alter status of an administrator")
        
    user.update_status(UserStatus(req.status.value))
    user_repo.save(user)
         
    return {"message": f"Investor status successfully updated to {req.status.value}"}

@router.put("/investors/{investor_id}/role")
def update_investor_role(
    investor_id: str,
    req: UserRoleUpdateRequest,
    admin: Investor = Depends(require_permission("users:write"))
):
    user = user_repo.get_by_id(InvestorId(value=investor_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    new_role = get_role_by_name(req.role.value)
    user.update_role(new_role)
    user_repo.save(user)
         
    return {"message": f"User role successfully updated to {req.role.value}"}

@router.put("/investors/{investor_id}/password")
def reset_investor_password(
    investor_id: str,
    req: AdminPasswordResetRequest,
    admin: Investor = Depends(require_permission("users:write"))
):
    user = user_repo.get_by_id(InvestorId(value=investor_id))
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    if len(req.password) < 7:
        raise HTTPException(status_code=400, detail="Password must be at least 7 characters long")
        
    hashed = get_password_hash(req.password)
    user.hashed_password = hashed
    user_repo.save(user)
        
    return {"message": f"Password successfully reset for {user.username}"}

@router.put("/investors/{investor_id}/username")
def update_investor_username(
    investor_id: str,
    req: AdminUsernameUpdateRequest,
    admin: Investor = Depends(require_permission("users:write"))
):
    user = user_repo.get_by_id(InvestorId(value=investor_id))
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    clean_username = req.username.strip().replace(" ", "")
    if not clean_username:
        raise HTTPException(status_code=400, detail="Username cannot be empty")
        
    if clean_username != user.username:
        existing = user_repo.get_by_username(clean_username)
        if existing:
            raise HTTPException(status_code=400, detail="Username already taken")
            
    user.username = clean_username
    user_repo.save(user)
        
    return {"message": "Username successfully updated"}

@router.delete("/investors/{investor_id}")
def delete_investor(
    investor_id: str,
    admin: Investor = Depends(require_permission("users:write"))
):
    user = user_repo.get_by_id(InvestorId(value=investor_id))
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    if user.role.name in ["ADMIN", "SUPER_ADMIN"]:
        raise HTTPException(status_code=400, detail="Cannot delete an administrator account")
        
    success = user_repo.delete(investor_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete investor account")
        
    return {"message": "Investor account successfully deleted"}

@router.get("/investors/{investor_id}", response_model=InvestorListItem)
def get_investor_detail(
    investor_id: str,
    admin: Investor = Depends(require_permission("users:read"))
):
    user = user_repo.get_by_id(InvestorId(value=investor_id))
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    return _build_investor_list_item(user)

@router.get("/investors/{investor_id}/activities")
def get_investor_activities(
    investor_id: str,
    admin: Investor = Depends(require_permission("users:read"))
):
    from app.infrastructure.repositories import ActivityLogRepository
    activity_repo = ActivityLogRepository()
    return activity_repo.get_by_user_id(investor_id)

@router.put("/investors/{investor_id}")
@router.put("/investors/{investor_id}/profile")
def update_investor_profile_by_admin(
    investor_id: str,
    req: AdminInvestorProfileUpdate,
    admin: Investor = Depends(require_permission("users:write"))
):
    from app.infrastructure.logging_utils import log_activity
    user = user_repo.get_by_id(InvestorId(value=investor_id))
    if not user:
        raise HTTPException(status_code=404, detail="Investor not found")
        
    if req.email != user.email:
        existing = user_repo.get_by_email(req.email)
        if existing and existing.id.value != investor_id:
            raise HTTPException(status_code=400, detail="Email already registered by another user")

    user.email = req.email
    if req.full_name is not None: user.full_name = req.full_name
    if req.phone is not None: user.phone = req.phone
    if req.pan_number is not None: user.pan_number = req.pan_number
    if req.address_line1 is not None: user.address_line1 = req.address_line1
    if req.address_line2 is not None: user.address_line2 = req.address_line2
    if req.pincode is not None: user.pincode = req.pincode
    if req.date_of_birth is not None: user.date_of_birth = req.date_of_birth
    if req.city is not None: user.city = req.city
    if req.state is not None: user.state = req.state
    if req.country is not None: user.country = req.country
    if req.role is not None: user.update_role(get_role_by_name(req.role.value))
    if req.status is not None: user.update_status(UserStatus(req.status.value))
    if req.kyc_status is not None: user.kyc_status = req.kyc_status
    if req.risk_profile is not None: user.risk_profile = req.risk_profile
    if req.admin_notes is not None: user.admin_notes = req.admin_notes

    user_repo.save(user)

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
def update_investor_subscription_by_admin(
    investor_id: str,
    req: AdminInvestorSubscriptionUpdate,
    admin: Investor = Depends(require_permission("users:write"))
):
    from app.infrastructure.logging_utils import log_activity
    user = user_repo.get_by_id(InvestorId(value=investor_id))
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
