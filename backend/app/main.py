from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.interfaces import admin_router, portfolio_router, payments_router, crud_routers, system_router
from contexts.identity.interfaces import auth_router as identity_auth_router
from contexts.identity.interfaces import users_router, audit_router
from contexts.billing.interfaces import billing_router, webhooks_router as billing_webhooks_router
from contexts.research_publishing.interfaces import reports_router as new_reports_router
from contexts.model_portfolio.interfaces import portfolio_router as new_portfolio_router
from app.infrastructure.repositories import UserRepository
from app.domain.entities import User, UserRole, UserStatus
from app.core.security import get_password_hash
import structlog
import uuid
import sentry_sdk
from prometheus_fastapi_instrumentator import Instrumentator
from bootstrap.settings import settings

# ── Observability Configuration ────────────────────────────────────────────────
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        profiles_sample_rate=1.0,
    )

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.dev.ConsoleRenderer() # Use JSONRenderer for prod later
    ],
    wrapper_class=structlog.make_filtering_bound_logger(20),
    context_class=dict,
    logger_factory=structlog.PrintLoggerFactory(),
)
logger = structlog.get_logger()

# ── Allowed origins & CORS configuration ──────────────────────────────────────
ALLOWED_ORIGINS = settings.cors_origins

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
    title=settings.PROJECT_NAME,
    description="Enterprise Advisory System Backend",
    version=settings.VERSION
)

# Prometheus setup
Instrumentator().instrument(app).expose(app)

# ── Audit Middleware ──────────────────────────────────────────────────────────
from contexts.compliance.domain.entities import AuditLog
from contexts.compliance.infrastructure.repositories import AuditLogRepository

audit_repo = AuditLogRepository()

@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    response = await call_next(request)
    
    if request.method in ["POST", "PUT", "DELETE", "PATCH"]:
        # Extract basic info; in a real app, user ID comes from request.state.user if authenticated
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent")
        
        log = AuditLog(
            action=request.method,
            resource=request.url.path,
            ip_address=ip_address,
            user_agent=user_agent,
            metadata={"status_code": response.status_code}
        )
        # Fire and forget / background save would be better here, but synchronous for now
        try:
            audit_repo.save(log)
        except Exception as e:
            logger.error("audit_log_failed", error=str(e))
            
    return response

# ── Correlation ID Middleware ────────────────────────────────────────────────
@app.middleware("http")
async def structlog_middleware(request: Request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", uuid.uuid4().hex)
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(correlation_id=correlation_id, path=request.url.path, method=request.method)
    
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation_id
    return response

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
app.include_router(identity_auth_router.router, prefix="/api/v1")
app.include_router(users_router.router, prefix="/api/v1")
app.include_router(audit_router.router, prefix="/api/v1")
app.include_router(billing_webhooks_router.router, prefix="/api/v1")
app.include_router(billing_router.router, prefix="/api/v1")
app.include_router(admin_router.router, prefix="/api/v1")
app.include_router(new_reports_router.router, prefix="/api/v1")
app.include_router(new_portfolio_router.router, prefix="/api/v1")
app.include_router(payments_router.router, prefix="/api/v1")
app.include_router(crud_routers.router, prefix="/api/v1")
app.include_router(system_router.router, prefix="/api/v1")

@app.on_event("startup")
def seed_admin():
    user_repo = UserRepository()
    admin_email = "admin@raghuvir.com"
    default_admin_password = get_password_hash("Raghuvir#Admin2026!")
    
    # 1. Ensure primary admin account exists and has Raghuvir#Admin2026!
    existing_by_email = user_repo.get_by_email(admin_email)
    existing_by_username = user_repo.get_by_username("admin")
    
    admin_user = existing_by_email or existing_by_username
    if not admin_user:
        admin_user = User(
            username="admin",
            full_name="System Administrator",
            email=admin_email,
            hashed_password=default_admin_password,
            role=UserRole.ADMIN,
            status=UserStatus.ACTIVE
        )
        user_repo.create(admin_user)
        print("Admin user created successfully with Raghuvir#Admin2026!")
    else:
        user_repo.update_password(admin_user.id, default_admin_password)
        user_repo.update_role(admin_user.id, UserRole.ADMIN)
        user_repo.update_status(admin_user.id, UserStatus.ACTIVE)
        print(f"Admin user ({admin_user.username}) credentials updated to Raghuvir#Admin2026!")

    # 2. Automatically ensure admin accounts are granted ADMIN role
    for username_or_email in ["tejassuthar1", "admin", "Admin"]:
        user = user_repo.get_by_username(username_or_email) or user_repo.get_by_email(username_or_email)
        if user and user.role != UserRole.ADMIN:
            user_repo.update_role(user.id, UserRole.ADMIN)
            print(f"Promoted user '{username_or_email}' to ADMIN role successfully!")

@app.get("/")
def read_root():
    return {"message": f"{settings.PROJECT_NAME} is running", "version": settings.VERSION}

@app.get("/healthz")
@app.get("/health")
@app.get("/api/health")
@app.get("/api/system/health")
def healthz_check():
    return {"status": "ok", "version": settings.VERSION}

@app.get("/readyz")
def readyz_check():
    try:
        from app.infrastructure.db import client
        client.admin.command('ping')
        return {"status": "ready", "db": "connected"}
    except Exception as e:
        logger.error("mongodb_health_check_failed", error=str(e))
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Database unavailable")

