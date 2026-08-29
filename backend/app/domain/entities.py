from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    INVESTOR = "investor"

class UserStatus(str, Enum):
    ACTIVE = "active"
    DISABLED = "disabled"
    BLACKLISTED = "blacklisted"

class ServiceType(str, Enum):
    REPORTS = "reports"
    PORTFOLIO = "portfolio"

class SubscriptionStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"

class TransactionType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class ReportStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class NotificationStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class User(BaseModel):
    id: Optional[str] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    email: EmailStr
    phone: Optional[str] = None
    gender: Optional[str] = None
    referral_source: Optional[str] = None
    country: Optional[str] = "India"
    state: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    pincode: Optional[str] = None
    pan_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    kyc_status: Optional[str] = "verified"
    risk_profile: Optional[str] = "Moderate"
    admin_notes: Optional[str] = None
    hashed_password: Optional[str] = None
    google_id: Optional[str] = None
    role: UserRole = UserRole.INVESTOR
    status: UserStatus = UserStatus.ACTIVE
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ResearchReport(BaseModel):
    id: Optional[str] = None
    title: str
    content: str
    doc_link: Optional[str] = None
    status: ReportStatus = ReportStatus.PUBLISHED
    published_at: datetime = Field(default_factory=datetime.utcnow)

class Stock(BaseModel):
    id: Optional[str] = None
    ticker: str
    name: str
    entry_price: float
    target_price: float
    stop_loss: float
    weightage: float
    transaction_type: TransactionType = TransactionType.BUY
    sector: Optional[str] = "Equity"
    added_at: datetime = Field(default_factory=datetime.utcnow)

class Subscription(BaseModel):
    id: Optional[str] = None
    user_id: str
    service_type: ServiceType
    status: SubscriptionStatus = SubscriptionStatus.ACTIVE
    stripe_subscription_id: Optional[str] = None
    upi_transaction_id: Optional[str] = None
    expires_at: datetime

class ActivityLog(BaseModel):
    id: Optional[str] = None
    user_id: str
    username: str
    action: str
    description: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SmallcaseItem(BaseModel):
    id: Optional[str] = None
    name: str
    cagr: float
    min_investment: float
    description: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ServiceOffering(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    price_monthly: float
    status: ReportStatus = ReportStatus.PUBLISHED
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Notification(BaseModel):
    id: Optional[str] = None
    title: str
    message: str
    status: NotificationStatus = NotificationStatus.PUBLISHED
    created_by: Optional[str] = "Admin"
    created_at: datetime = Field(default_factory=datetime.utcnow)

class BlogPost(BaseModel):
    id: Optional[str] = None
    title: str
    slug: str
    markdown_content: str
    tags: List[str] = Field(default_factory=list)
    author: Optional[str] = "Raghuvir Team"
    status: ReportStatus = ReportStatus.PUBLISHED
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PlatformSettings(BaseModel):
    id: Optional[str] = "global_settings"
    default_page_size: int = 10
    min_password_length: int = 7
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class NewsItem(BaseModel):
    id: Optional[str] = None
    title: str
    summary: str
    link: Optional[str] = "#"
    created_at: datetime = Field(default_factory=datetime.utcnow)

