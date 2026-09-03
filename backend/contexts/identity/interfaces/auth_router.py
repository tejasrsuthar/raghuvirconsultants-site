from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from pydantic import BaseModel, EmailStr
from contexts.identity.application.use_cases import IdentityUseCases, RegisterInvestorRequest
from bootstrap.di import get_identity_use_cases
from app.core.security import create_access_token
from contexts.identity.domain.entities import Investor

router = APIRouter(prefix="/auth", tags=["Identity & Access"])

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str
    email: str

class LoginRequest(BaseModel):
    email: str # Used for username or email
    password: str
    totp_token: Optional[str] = None

class GoogleLoginRequest(BaseModel):
    token: str

@router.post("/register", response_model=TokenResponse)
def register(req: RegisterInvestorRequest, use_cases: IdentityUseCases = Depends(get_identity_use_cases)):
    try:
        investor = use_cases.register_investor(req)
        access_token = create_access_token(data={"sub": investor.email, "role": investor.role.name})
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            role=investor.role.name,
            username=investor.username,
            email=investor.email
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, use_cases: IdentityUseCases = Depends(get_identity_use_cases)):
    try:
        investor = use_cases.authenticate(req.email, req.password, req.totp_token)
        if not investor:
            raise HTTPException(status_code=400, detail="Incorrect email/username or password")
            
        access_token = create_access_token(data={"sub": investor.email, "role": investor.role.name})
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            role=investor.role.name,
            username=investor.username,
            email=investor.email
        )
    except ValueError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.post("/google", response_model=TokenResponse)
def google_login(req: GoogleLoginRequest, use_cases: IdentityUseCases = Depends(get_identity_use_cases)):
    try:
        investor = use_cases.authenticate_google(req.token)
        access_token = create_access_token(data={"sub": investor.email, "role": investor.role.name})
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            role=investor.role.name,
            username=investor.username,
            email=investor.email
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

class Enable2FARequest(BaseModel):
    secret: str
    token: str

@router.post("/2fa/setup")
def setup_2fa(investor_id: str, use_cases: IdentityUseCases = Depends(get_identity_use_cases)):
    # In a real scenario, investor_id comes from the JWT via a dependency
    try:
        secret, uri = use_cases.get_2fa_setup(investor_id)
        return {"secret": secret, "provisioning_uri": uri}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/2fa/enable")
def enable_2fa(investor_id: str, req: Enable2FARequest, use_cases: IdentityUseCases = Depends(get_identity_use_cases)):
    try:
        success = use_cases.enable_2fa(investor_id, req.secret, req.token)
        if not success:
            raise HTTPException(status_code=400, detail="Invalid token")
        return {"message": "2FA enabled successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
