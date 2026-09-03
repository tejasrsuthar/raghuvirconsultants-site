from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.interfaces import admin_router, crud_routers, system_router
from contexts.identity.interfaces import auth_router as identity_auth_router
from contexts.identity.interfaces import users_router
from contexts.compliance.interfaces import audit_router
from contexts.billing.interfaces import billing_router, webhooks_router as billing_webhooks_router
from contexts.research_publishing.interfaces import reports_router as new_reports_router
from contexts.model_portfolio.interfaces import portfolio_router as new_portfolio_router
from contexts.client_support.interfaces import support_router as client_support_router
from app.domain.entities import UserRole, UserStatus
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

# (Audit logging is handled asynchronously in use cases)

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
        "backend"
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

# Register Routers (v1)
routers_to_mount = [
    identity_auth_router.router,
    users_router.router,
    audit_router.router,
    billing_webhooks_router.router,
    billing_router.router,
    admin_router.router,
    new_reports_router.router,
    new_portfolio_router.router,
    client_support_router.router,
    crud_routers.router,
    system_router.router
]

for r in routers_to_mount:
    app.include_router(r, prefix="/api/v1")



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

