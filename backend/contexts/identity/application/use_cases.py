from typing import Optional
from pydantic import BaseModel, EmailStr
from contexts.identity.domain.entities import Investor, Role, UserStatus
from contexts.identity.domain.repositories import InvestorRepository
from contexts.identity.domain.roles import get_role_by_name
from contexts.identity.infrastructure.totp import TOTPService
from contexts.identity.infrastructure.google_oauth import GoogleOAuthService
from app.core.security import get_password_hash, verify_password

class RegisterInvestorRequest(BaseModel):
    email: EmailStr
    full_name: str
    username: str
    password: str

class IdentityUseCases:
    def __init__(self, repository: InvestorRepository, totp_service: TOTPService, google_service: GoogleOAuthService):
        self.repository = repository
        self.totp_service = totp_service
        self.google_service = google_service

    def register_investor(self, req: RegisterInvestorRequest) -> Investor:
        existing = self.repository.get_by_email(req.email)
        if existing:
            raise ValueError("Email already registered")
        
        existing_username = self.repository.get_by_username(req.username)
        if existing_username:
            raise ValueError("Username already taken")

        investor_role = get_role_by_name("INVESTOR")
        
        investor = Investor(
            email=req.email,
            full_name=req.full_name,
            username=req.username,
            hashed_password=get_password_hash(req.password),
            role=investor_role
        )
        self.repository.save(investor)
        return investor

    def authenticate(self, username_or_email: str, password: str, totp_token: Optional[str] = None) -> Optional[Investor]:
        investor = self.repository.get_by_email(username_or_email) or self.repository.get_by_username(username_or_email)
        if not investor:
            return None
            
        if investor.status != UserStatus.ACTIVE:
            raise ValueError(f"Account is {investor.status.value}")

        if not investor.hashed_password or not verify_password(password, investor.hashed_password):
            return None

        if investor.two_factor_enabled:
            if not totp_token:
                raise ValueError("2FA token required")
            if not self.verify_2fa(investor.id, totp_token):
                raise ValueError("Invalid 2FA token")

        return investor

    def authenticate_google(self, token: str) -> Investor:
        idinfo = self.google_service.verify_token(token)
        email = idinfo.get("email")
        if not email:
            raise ValueError("Google token missing email")

        investor = self.repository.get_by_email(email)
        if not investor:
            # Auto-register
            investor_role = get_role_by_name("INVESTOR")
            investor = Investor(
                email=email,
                full_name=idinfo.get("name", email.split("@")[0]),
                username=email.split("@")[0],
                role=investor_role
            )
            self.repository.save(investor)
        
        if investor.status != UserStatus.ACTIVE:
            raise ValueError(f"Account is {investor.status.value}")

        return investor

    def assign_role(self, admin_investor_id: str, target_investor_id: str, new_role: Role) -> Investor:
        # Note: authorization (checking if admin_investor_id has permission) happens in the API/interface layer
        investor = self.repository.get_by_id(target_investor_id) # Needs InvestorId wrapping in the caller
        if not investor:
            raise ValueError("Investor not found")
            
        investor.update_role(new_role)
        self.repository.save(investor)
        return investor

    def get_2fa_setup(self, investor_id: str) -> tuple[str, str]:
        """Returns (secret, provisioning_uri)"""
        investor = self.repository.get_by_id(investor_id)
        if not investor:
            raise ValueError("Investor not found")
            
        secret = self.totp_service.generate_secret()
        uri = self.totp_service.get_provisioning_uri(secret, investor.email)
        return secret, uri

    def enable_2fa(self, investor_id: str, secret: str, token: str) -> bool:
        if not self.totp_service.verify_token(secret, token):
            return False
            
        investor = self.repository.get_by_id(investor_id)
        if not investor:
            raise ValueError("Investor not found")
            
        investor.enable_2fa(secret)
        self.repository.save(investor)
        return True

    def verify_2fa(self, investor_id: str, token: str) -> bool:
        investor = self.repository.get_by_id(investor_id)
        if not investor or not investor.two_factor_enabled or not investor.two_factor_secret:
            return False
            
        return self.totp_service.verify_token(investor.two_factor_secret, token)
