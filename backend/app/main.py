from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.interfaces import auth_router, admin_router, reports_router, portfolio_router, payments_router, crud_routers, system_router
from app.infrastructure.repositories import UserRepository
from app.domain.entities import User, UserRole, UserStatus
from app.core.security import get_password_hash
import os

# ── Allowed origins & CORS configuration ──────────────────────────────────────
DEFAULT_ORIGINS = [
    "https://www.raghuvirconsultants.in",
    "https://raghuvirconsultants.in",
    "https://admin.raghuvirconsultants.in",
    "http://raghuvircons.local",
    "http://app.raghuvircons.local",
    "http://localhost",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

env_origins = os.getenv("ALLOWED_ORIGINS", "")
custom_origins = [o.strip() for o in env_origins.split(",") if o.strip()]
ALLOWED_ORIGINS = list(dict.fromkeys(DEFAULT_ORIGINS + custom_origins))

# ── Security headers middleware ────────────────────────────────────────────────
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        # Remove leaking headers
        if "Server" in response.headers:
            del response.headers["Server"]
        if "X-Powered-By" in response.headers:
            del response.headers["X-Powered-By"]
        return response

app = FastAPI(
    title="Raghuvir Consultants API",
    description="Enterprise Advisory System Backend",
    version="2.10.3"
)

# ── Middleware stack (order matters — outermost first) ─────────────────────────

# 1. Trusted hosts — blocks Host-header injection attacks
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=[
        "www.raghuvirconsultants.in",
        "raghuvirconsultants.in",
        "admin.raghuvirconsultants.in",
        "raghuvircons.local",
        "app.raghuvircons.local",
        "localhost",
        "127.0.0.1",
        "0.0.0.0",
        "backend",
        "*",  # Loosen during local dev
    ]
)

# 2. GZip compression — reduces response size by 60-80% for JSON payloads
app.add_middleware(GZipMiddleware, minimum_size=1000)

# 3. Security headers on all responses
app.add_middleware(SecurityHeadersMiddleware)

# 4. CORS — strictly restricted to explicit allowed origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # Cache preflight for 24h
)

# Register Routers
app.include_router(auth_router.router, prefix="/api")
app.include_router(admin_router.router, prefix="/api")
app.include_router(reports_router.router, prefix="/api")
app.include_router(portfolio_router.router, prefix="/api")
app.include_router(payments_router.router, prefix="/api")
app.include_router(crud_routers.router, prefix="/api")
app.include_router(system_router.router, prefix="/api")

@app.on_event("startup")
def seed_admin():
    user_repo = UserRepository()
    admin_email = "admin@raghuvir.com"
    existing = user_repo.get_by_email(admin_email)
    if not existing:
        admin_user = User(
            username="Admin",
            email=admin_email,
            hashed_password=get_password_hash("admin12345"),
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE
        )
        user_repo.create(admin_user)
        print("Admin user seeded successfully!")
    else:
        user_repo.update_password(existing.id, get_password_hash("admin12345"))
        user_repo.update_role(existing.id, UserRole.ADMIN)

    # Automatically ensure admin accounts are granted ADMIN role
    for username_or_email in ["tejassuthar1", "admin"]:
        user = user_repo.get_by_username(username_or_email) or user_repo.get_by_email(username_or_email)
        if user and user.role != UserRole.ADMIN:
            user_repo.update_role(user.id, UserRole.ADMIN)
            print(f"Promoted user '{username_or_email}' to ADMIN role successfully!")

@app.get("/")
def read_root():
    return {"message": "Raghuvir Consultants API is running", "version": "2.10.3"}

@app.get("/health")
@app.get("/api/health")
@app.get("/api/system/health")
def health_check():
    return {"status": "ok", "version": "2.10.3"}

