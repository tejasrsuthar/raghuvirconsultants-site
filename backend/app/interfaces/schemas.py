from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from app.domain.entities import UserRole, UserStatus, ServiceType, SubscriptionStatus, TransactionType, ReportStatus

# Auth Schemas
class UserRegisterRequest(BaseModel):
    username: str
    password: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gender: Optional[str] = None
    referral_source: Optional[str] = None
    country: Optional[str] = None
    state: Optional[str] = None
    city: Optional[str] = None

class UserLoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: Optional[str] = None
    email: str

class GoogleLoginRequest(BaseModel):
    token: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None

# Research Report Schemas
class ResearchReportCreate(BaseModel):
    title: str
    content: str
    doc_link: Optional[str] = None
    status: Optional[ReportStatus] = ReportStatus.PUBLISHED

class ResearchReportResponse(BaseModel):
    id: str
    title: str
    content: str
    doc_link: Optional[str] = None
    status: ReportStatus
    published_at: datetime

    class Config:
        from_attributes = True

class ReportStatusUpdateRequest(BaseModel):
    status: ReportStatus

# Stock Schemas
class StockCreate(BaseModel):
    ticker: str
    name: str
    entry_price: float
    target_price: float
    stop_loss: float
    weightage: float
    transaction_type: TransactionType

class StockResponse(BaseModel):
    id: str
    ticker: str
    name: str
    entry_price: float
    target_price: float
    stop_loss: float
    weightage: float
    transaction_type: TransactionType
    added_at: datetime

    class Config:
        from_attributes = True

# Investor Schemas
class UserStatusUpdateRequest(BaseModel):
    status: UserStatus

class UserRoleUpdateRequest(BaseModel):
    role: UserRole

class InvestorListItem(BaseModel):
    id: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    pincode: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = "India"
    pan_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    kyc_status: Optional[str] = "verified"
    risk_profile: Optional[str] = "Moderate"
    admin_notes: Optional[str] = None
    role: UserRole
    status: UserStatus
    created_at: datetime
    subscribed_reports: bool = False
    subscribed_portfolio: bool = False

# Paginated Generic Response
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    limit: int
    pages: int

# Profile Update Schema
class ProfileUpdateRequest(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    pincode: Optional[str] = None
    date_of_birth: Optional[str] = None
    pan_number: Optional[str] = None
    password: Optional[str] = None

class AdminInvestorProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    pan_number: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    pincode: Optional[str] = None
    date_of_birth: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    kyc_status: Optional[str] = None
    risk_profile: Optional[str] = None
    admin_notes: Optional[str] = None
    subscribed_reports: Optional[bool] = None
    subscribed_portfolio: Optional[bool] = None

class AdminPasswordResetRequest(BaseModel):
    password: str

class AdminUsernameUpdateRequest(BaseModel):
    username: str

class AdminInvestorSubscriptionUpdate(BaseModel):
    service_type: ServiceType
    active: bool

# Smallcase Schemas
class SmallcaseCreate(BaseModel):
    name: str
    cagr: float
    min_investment: float
    description: str

class SmallcaseResponse(BaseModel):
    id: str
    name: str
    cagr: float
    min_investment: float
    description: str
    created_at: datetime

    class Config:
        from_attributes = True

# ServiceOffering Schemas
class ServiceOfferingCreate(BaseModel):
    title: str
    description: str
    price_monthly: float
    status: Optional[ReportStatus] = ReportStatus.PUBLISHED

class ServiceOfferingResponse(BaseModel):
    id: str
    title: str
    description: str
    price_monthly: float
    status: ReportStatus
    created_at: datetime

    class Config:
        from_attributes = True

# Notification Schemas
class NotificationCreate(BaseModel):
    title: str
    message: str
    status: Optional[str] = "published"

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    status: str
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True

# BlogPost Schemas
class BlogPostCreate(BaseModel):
    title: str
    slug: str
    markdown_content: str
    tags: List[str] = Field(default_factory=list)
    status: Optional[ReportStatus] = ReportStatus.PUBLISHED

class BlogPostResponse(BaseModel):
    id: str
    title: str
    slug: str
    markdown_content: str
    tags: List[str]
    author: str
    status: ReportStatus
    created_at: datetime

    class Config:
        from_attributes = True

# PlatformSettings Schemas
class PlatformSettingsUpdate(BaseModel):
    default_page_size: int
    min_password_length: int

class PlatformSettingsResponse(BaseModel):
    id: str
    default_page_size: int
    min_password_length: int
    updated_at: datetime

    class Config:
        from_attributes = True

# NewsItem Schemas
class NewsItemCreate(BaseModel):
    title: str
    summary: str
    link: Optional[str] = "#"

class NewsItemResponse(BaseModel):
    id: str
    title: str
    summary: str
    link: str
    created_at: datetime

    class Config:
        from_attributes = True

# Bulk Operation Schemas
class BulkStatusRequest(BaseModel):
    ids: List[str]
    status: str

class BulkDeleteRequest(BaseModel):
    ids: List[str]

