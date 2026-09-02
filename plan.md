# Master Implementation Plan
**Raghuvir Consultants — RA Report & Model Portfolio Subscription Platform**
Status: Ready for execution · Pre-launch, greenfield backend/frontend work on an existing codebase

---

## 0. Executive Summary

This is the consolidated, execution-ready build plan for turning the existing React 19 + Vite / FastAPI + MongoDB codebase into a full SEBI RA subscription platform. Every decision below has been confirmed — this document is meant to be handed to a developer (or used by you) as the actual build guide, not a menu of options.

**In one paragraph:** Two public URLs — a marketing site at the domain root and a single authenticated portal at `/portal` serving both investors and admins by role. The backend is restructured into DDD bounded contexts behind ports-and-adapters interfaces, with Razorpay as the payment gateway (architected for PayU to be added later without rework), a self-hosted MinIO instance as the primary report storage backend (also pluggable), and enterprise-grade testing/CI/CD/observability standards applied from day one rather than retrofitted.

---

## 1. Architecture at a Glance

### 1.1 The two URLs

| URL | Purpose | Auth |
|---|---|---|
| `https://www.raghuvirconsultants.in` | Public marketing site — landing, education, pricing, blog, public research summaries | None |
| `https://www.raghuvirconsultants.in/portal` | The entire authenticated app — investor dashboard **and** admin console, in one place | JWT, role-gated |

Nothing else. No `admin.` subdomain, no separate investor-portal deployment. `raghuvirconsultants.in` (apex) redirects to `www.`.

### 1.2 Guiding principles

1. **Config over code.** Payment gateway, storage backend, and role→permission mappings are all switchable via configuration or an admin action — never a code change + redeploy for routine operational needs.
2. **Ports-and-adapters (hexagonal) everywhere.** Every external dependency (Razorpay, MinIO, email/SMS providers) sits behind an interface owned by the domain, not the other way around.
3. **DDD bounded contexts**, each with its own aggregates and ubiquitous language, coordinating via domain events rather than tight coupling.
4. **One URL to operate from.** All authenticated work — investor and admin — happens at `/portal`. Simplicity for the people using it; sophistication is allowed to live in the architecture underneath.
5. **Enterprise-ready from the first commit**, not bolted on later: typed config, structured logging, CI gates, versioned APIs, tested backups.

### 1.3 High-level component map

```
┌─────────────────────────────────────────────────────────────┐
│  www.raghuvirconsultants.in                                  │
│  ┌───────────────────┐   ┌─────────────────────────────────┐│
│  │   Public routes    │   │  /portal (React Router subtree)  ││
│  │  /, /pricing, /blog│   │  ┌───────────┐  ┌──────────────┐││
│  │  (no auth)         │   │  │ investor  │  │ /portal/admin│││
│  │                    │   │  │ dashboard │  │ (lazy-loaded)│││
│  └───────────────────┘   │  └───────────┘  └──────────────┘││
│                            └─────────────────────────────────┘│
│                     served by ONE React 19 + Vite build       │
└───────────────────────────┬───────────────────────────────────┘
                             │ /api/v1/*  (same origin)
                    ┌────────▼────────┐
                    │   FastAPI (DDD)   │
                    │  bounded contexts:│
                    │  identity, billing│
                    │  research, model_ │
                    │  portfolio, support│
                    │  compliance        │
                    └───┬───────┬───────┘
                        │       │
              ┌─────────▼──┐ ┌──▼──────────┐
              │  MongoDB    │ │ MinIO (VPS)  │
              │ (per-context│ │ report bucket│
              │ collections)│ │ versioned +  │
              └─────────────┘ │ Object Lock  │
                                └─────────────┘
                        │
              ┌─────────▼──────────┐
              │ PaymentGatewayRouter │
              │  → RazorpayGateway   │  (PayU adapter added later, same interface)
              └──────────────────────┘
```

---

## 2. Domain Model — Bounded Contexts & Backend Structure

### 2.1 Bounded contexts

| Context | Owns | Aggregate roots |
|---|---|---|
| **Identity & Access** | `investors`, `permissions`, sessions, 2FA | `Investor`, `Role` |
| **Billing & Subscriptions** | `plans`, `subscriptions`, `gateway_status`, invoices | `Subscription` |
| **Research Publishing** | `research_reports` | `Report` (addenda are child entities) |
| **Model Portfolio** | `model_portfolios`, `rebalance_events` | `ModelPortfolio` |
| **Client Support** | `tickets`, `messages` | `Ticket`, `MessageThread` |
| **Compliance & Audit** | `audit_log`, `consent_records` | `AuditEntry`, `ConsentRecord` (append-only) |

**Shared kernel** (small, deliberately): `InvestorId`, `Money`, `PermissionKey` value objects — used across contexts without letting them leak internal models into each other.

### 2.2 Backend folder structure

```
backend/
  contexts/
    identity/
      domain/          # Investor, Role, Permission entities + invariants — zero framework imports
      application/      # RegisterInvestor, AssignRole, EnableTwoFactor use cases
      infrastructure/    # MongoInvestorRepository, PyOTP wrapper, Google OAuth verifier
      interface/          # FastAPI routers + Pydantic schemas (thin — delegates to application/)
    billing/
      domain/            # Subscription, Plan entities; invariant: no overlapping active periods
      application/        # ActivateSubscription, CancelSubscription, ChangePlan use cases
      infrastructure/      # MongoSubscriptionRepository, RazorpayGateway, PayUGateway (later),
                           # PaymentGatewayRouter
      interface/
    research_publishing/
      domain/ application/ infrastructure/ interface/   # Report, addenda; MinIOStorage adapter lives here
    model_portfolio/
      domain/ application/ infrastructure/ interface/   # ModelPortfolio, RebalanceEvent; weight-sum invariant
    client_support/
      domain/ application/ infrastructure/ interface/   # Ticket, MessageThread; SLA timers
    compliance/
      domain/ application/ infrastructure/ interface/   # AuditEntry, ConsentRecord (append-only)
  shared_kernel/
    value_objects.py     # InvestorId, Money, PermissionKey
  events/
    dispatcher.py        # in-process pub/sub for domain events (§2.3)
  bootstrap/
    di.py                 # wires concrete adapters into application services; reads Settings
    settings.py            # pydantic-settings, one Settings class, env-driven
  api/
    v1/
      router.py            # mounts each context's interface/ router under /api/v1/*
  main.py                  # FastAPI app instance, middleware, /healthz, /readyz
```

**Rule enforced throughout:** `domain/` never imports `fastapi`, `motor`, `pymongo`, `razorpay`, or `minio`. If a domain file needs an external capability, it depends on an interface defined in `domain/`, implemented in `infrastructure/`.

### 2.3 Domain events (cross-context coordination)

In-process pub/sub (`events/dispatcher.py`) — no message broker needed at this scale:

| Event | Published by | Consumed by |
|---|---|---|
| `SubscriptionActivated` | Billing | Compliance (fee-disclosure snapshot), Research Publishing (grants report access) |
| `ReportPublished` | Research Publishing | Client Support (broadcast trigger) |
| `TicketEscalatedToGrievance` | Client Support | Compliance (starts SEBI grievance SLA timer) |
| `RebalanceEventPublished` | Model Portfolio | Client Support (broadcast trigger) |

Handlers run synchronously or via FastAPI `BackgroundTasks`, depending on whether the caller needs to wait for the side effect.

---

## 3. Frontend Architecture

### 3.1 Single codebase, two route trees

Base: `frontend/` (already owns `www.raghuvirconsultants.in`). Fold `admin-dashboard/`'s components/routes in under `/portal/admin`.

```
frontend/src/
  routes/
    public/            # /, /pricing, /blog, /about — no auth
    portal/
      login/           # /portal — shown when unauthenticated
      investor/        # /portal/* investor dashboard (reports, model portfolio, billing, support)
      admin/            # /portal/admin/* — React.lazy() code-split boundary, admin-role only
  shared/
    components/         # merged component library (one Tailwind config)
    api-client/          # typed fetch/axios wrapper, JWT attach, /api/v1 base
  auth/
    useAuth.ts            # reads JWT role/permissions claims, drives route guards (UX-only, see §4.2)
```

### 3.2 Code splitting

`React.lazy()` + React Router lazy route modules split `/portal/admin/*` into its own chunk — an investor session never downloads it. Docs: https://vitejs.dev/guide/features.html#dynamic-import · https://reactrouter.com/start/framework/route-module

### 3.3 Caddy

One site block, one build, serving `www.raghuvirconsultants.in` (apex redirects in). No path-based routing needed — `/`, `/portal`, `/portal/admin/*` are all client-side React Router concerns. `/api/*` reverse-proxies to the FastAPI container on port 8000, same origin as the frontend, so no CORS configuration is needed for the app itself.

---

## 4. Authentication & RBAC

### 4.1 Auth flow

- Email/password (Passlib/bcrypt) or Google SSO (`@react-oauth/google` + backend `google-auth` verification) → FastAPI issues a JWT (PyJWT/python-jose) carrying `investor_id`, `role`, and a resolved `permissions` array.
- 2FA: TOTP via `pyotp` (+ `qrcode` for enrollment). **Mandatory for all admin-role accounts**; optional-but-encouraged for investors at launch, tightened to mandatory once volume grows.
- Session: short-lived access token + refresh token, httpOnly/secure cookie or Authorization header (confirm which — Bearer-in-header is what the current admin console already uses cross-origin, and remains the simpler choice once same-origin too).

### 4.2 RBAC enforcement — three layers, only one of which is UX

1. **Frontend route guards** (`/portal` login redirect, `/portal/admin/*` role check) — UX only. Never trust this layer for actual security.
2. **FastAPI dependency guards** — the real enforcement:
   ```python
   def require_permission(permission: str):
       async def checker(user = Depends(get_current_user)):
           if permission not in user.permissions:
               raise HTTPException(403, "Forbidden")
           return user
       return checker

   @router.post("/reports", dependencies=[Depends(require_permission("publish_report"))])
   async def publish_report(...): ...
   ```
3. **Document-level scoping** — every investor-facing query filters by `investor_id` from JWT claims server-side, enforced as a repository-layer convention, never from a client-supplied ID.

`investors.role` is built from the start as a structure referencing the `permissions` collection (role → permission keys: `publish_report`, `manage_subscriptions`, `issue_refund`, `view_audit_log`, `manage_users`, etc.) — no legacy single-string field to migrate, since this is new development.

Keep `/api/admin/*` as a distinct **backend** path prefix (independent of the frontend's `/portal/admin`) so Caddy/FastAPI can apply IP allowlisting or stricter rate limits to admin endpoints specifically.

---

## 5. Payment Gateway — Razorpay, Router-Ready for PayU

### 5.1 Decision

Razorpay only at launch. Built behind a `PaymentGatewayRouter` so PayU can be appended later as a second gateway with zero changes to existing code.

### 5.2 The port

```python
class PaymentGateway(ABC):
    name: str
    async def create_plan(self, amount: int, currency: str, billing_cycle: str) -> str: ...
    async def create_subscription(self, plan_id: str, investor_id: str) -> dict: ...
    async def verify_webhook_signature(self, raw_body: bytes, signature: str) -> bool: ...
    async def health_check(self) -> bool: ...
```

### 5.3 The router (circuit breaker, ready for multi-gateway)

```python
import aiobreaker
from datetime import timedelta

class PaymentGatewayRouter:
    def __init__(self, gateways: list[PaymentGateway]):
        self.gateways = gateways  # [RazorpayGateway()] at launch; append PayUGateway() later
        self.breakers = {
            gw.name: aiobreaker.CircuitBreaker(fail_max=5, timeout_duration=timedelta(seconds=60))
            for gw in gateways
        }

    async def create_subscription(self, plan_key: str, investor_id: str) -> dict:
        last_error = None
        for gw in self.gateways:
            try:
                return await self.breakers[gw.name].call_async(gw.create_subscription, plan_key, investor_id)
            except aiobreaker.CircuitBreakerError:
                continue
            except Exception as e:
                last_error = e
                continue
        raise PaymentGatewayUnavailable(f"All gateways failed: {last_error}")
```

**Important limit, by design:** this router failover applies to **checkout-time** calls only. Renewal charges are gateway-fixed per `subscriptions.gateway`, since a UPI Autopay/card mandate belongs to one specific gateway and can't be silently rerouted mid-cycle. Resilience on renewals comes from each gateway's own retry/dunning behavior plus a nightly reconciliation job — not from the router. True per-subscriber renewal failover would need an optional backup mandate on a second gateway at signup; flagged as a later enhancement, not required now.

### 5.4 Razorpay integration specifics

- Webhook signature: `X-Razorpay-Signature` is HMAC-SHA256 over the **raw** request body — no SDK helper exists, implement directly:
  ```python
  import hmac, hashlib
  def verify_webhook_signature(raw_body: bytes, signature: str, secret: str) -> bool:
      expected = hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
      return hmac.compare_digest(expected, signature)
  ```
  Mount in a FastAPI route reading `await request.body()` before any JSON parsing.
- Idempotency via the `x-razorpay-event-id` header (webhooks can be delivered more than once).
- Nightly reconciliation job against Razorpay's Subscriptions/Payments API — don't rely on webhooks alone for billing state.
- Gateway health (open/closed circuit) written to `gateway_status`, surfaced in `/portal/admin/settings` (§9).

### 5.5 Package documentation

| Package | Docs |
|---|---|
| `razorpay` | https://pypi.org/project/razorpay/ · https://github.com/razorpay/razorpay-python |
| Razorpay server integration | https://razorpay.com/docs/payments/server-integration/python/ |
| Razorpay Subscriptions API | https://razorpay.com/docs/payments/subscriptions/apis/ |
| Razorpay Checkout (frontend) | https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/ |
| Razorpay webhooks | https://razorpay.com/docs/webhooks/ · https://razorpay.com/docs/webhooks/validate-test/ |
| `aiobreaker` (circuit breaker) | https://aiobreaker.netlify.app/ · https://pypi.org/project/aiobreaker/ |
| PayU (deferred) | https://devguide.payu.in/ (verify current subscriptions section when the time comes) |

---

## 6. Report Storage — MinIO Primary, Pluggable

### 6.1 Decision

Self-hosted MinIO on the existing VPS is the primary/default `STORAGE_BACKEND`. A **fresh bucket** will be provisioned (not reusing any existing bucket), with versioning + Object Lock (WORM) enabled at creation — this is what makes the SEBI 5-year record-retention requirement enforceable rather than just assumed. AWS S3, Google Drive, and local disk remain pluggable alternatives behind the same interface.

### 6.2 The port and adapter

```python
class ReportStorage(ABC):
    async def upload(self, key: str, file_bytes: bytes, content_type: str) -> str: ...
    async def download(self, key: str) -> bytes: ...   # server-side only — watermarking happens here
    async def delete(self, key: str) -> None: ...
    async def exists(self, key: str) -> bool: ...

class MinIOStorage(ReportStorage):
    def __init__(self, endpoint, access_key, secret_key, bucket, secure=True):
        self.client = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure)
        self.bucket = bucket
        if not self.client.bucket_exists(self.bucket):
            self.client.make_bucket(self.bucket)
    # upload/download/delete/exists implemented via minio-py's put_object/get_object/remove_object/stat_object
```

Files are **never** exposed via a public/direct URL — the backend always mediates access (fetch bytes → check subscription → watermark → stream), so gating and watermarking can't be bypassed regardless of which backend is active.

### 6.3 Data model

```js
// research_reports
{
  ..., storage_backend: "minio"|"s3"|"gdrive"|"local", storage_key: "reports/2026/welspun-corp-q2.pdf",
  content_type: "application/pdf"
}
```

Built this way from the first document — no legacy static/public path to migrate off, since this is new development.

### 6.4 Package documentation

| Package | Docs |
|---|---|
| `minio` (official Python SDK) | https://docs.min.io/aistor/developers/sdk/python/ · https://docs.min.io/aistor/developers/sdk/python/api/ |
| MinIO server (Docker deployment, Object Lock config) | https://min.io/docs/minio/linux/index.html |
| `boto3` (S3, pluggable alternative) | https://boto3.readthedocs.io/ |
| `google-api-python-client` (Drive, pluggable alternative) | https://github.com/googleapis/google-api-python-client |

---

## 7. Watermarking, Model Portfolio, Support Tooling

### 7.1 Report watermarking

FastAPI `BackgroundTasks` (no job queue needed yet): on download request → validate subscription → fetch bytes via `ReportStorage.download()` → stamp investor name + ID + timestamp (`pypdf` overlay, or `reportlab` for the overlay layer) → stream to client → log to `audit_log`. Docs: `pypdf` https://pypdf.readthedocs.io/ · `reportlab` https://docs.reportlab.com/

### 7.2 Model Portfolio

- `model_portfolios` + `rebalance_events` (diff of added/removed/reweighted holdings), immutable once published — corrections are new addenda, not edits.
- Performance calc (CAGR/XIRR) as a computed FastAPI endpoint, not stored/stale data.
- Domain invariant: portfolio weights must sum to ~100% after any rebalance — enforced in `domain/`.

### 7.3 Support tooling

- `tickets` (categorized: billing, report access, technical, grievance) with SLA timers; grievance category coordinates with Compliance via `TicketEscalatedToGrievance` (§2.3).
- `messages` — 1:1 investor↔admin thread, distinct from tickets, fully logged (5-year retention).
- Broadcast announcements — reuse existing email infra if present, else SendGrid/Postmark; SMS via MSG91/Twilio for renewal/SLA alerts.

---

## 8. MongoDB Schema Reference (New Collections)

```js
// subscriptions
{ _id, investor_id, plan_id, product_type: "report"|"portfolio"|"bundle",
  billing_cycle: "monthly"|"quarterly"|"yearly", status: "active"|"past_due"|"cancelled"|"trialing",
  gateway: "razorpay"|"payu", gateway_subscription_id, current_period_end, auto_renew: bool,
  fee_disclosure_snapshot: { text, version, accepted_at } }

// plans
{ _id, name, product_type, billing_cycle, price_inr, tier_level }

// gateway_status
{ gateway: "razorpay", circuit_state: "closed"|"open", last_failure_at, updated_at }

// model_portfolios
{ _id, name, tier_required, holdings: [{ ticker, weight, entry_price, entry_date }] }

// rebalance_events
{ _id, portfolio_id, effective_date, rationale, diff: { added: [], removed: [], reweighted: [] }, published_by }

// tickets
{ _id, investor_id, category, status, sla_due_at, assigned_admin_id, created_at,
  thread: [{ sender_id, body, sent_at, internal: bool }] }

// messages
{ _id, investor_id, admin_id, thread: [{ sender_id, body, sent_at }] }

// audit_log  (append-only, no update/delete at app layer)
{ _id, actor_id, action, entity_type, entity_id, metadata, ip_address, created_at }

// consent_records
{ _id, investor_id, document_type: "terms"|"fee_disclosure"|"risk_profile",
  version, accepted_at, ip_address }

// research_reports  (see §6.3 for storage fields)
{ _id, title, ticker, rating, target_price, plan_tier_required, published_at,
  storage_backend, storage_key, content_type, is_addendum_to }
```

Index convention (matching existing patterns): `subscriptions(investor_id, status)`, `tickets(status, sla_due_at)`, `audit_log(entity_type, entity_id, created_at)`.

---

## 9. Enterprise-Readiness Standards

### 9.1 Testing strategy

| Layer | Tests | Tooling |
|---|---|---|
| `domain/` | Business rules/invariants, no I/O | `pytest` — pure unit tests |
| `application/` | Use case orchestration, adapters mocked | `pytest` + `pytest-asyncio` |
| `infrastructure/` | Repository/gateway adapters against real deps | `pytest` + `testcontainers-python` (ephemeral MongoDB/MinIO) |
| `interface/` (API) | Auth/RBAC, request/response shape | `httpx.AsyncClient` against the FastAPI app |
| Payment webhooks | Signature verification, payload parsing | Contract tests with recorded sample payloads — never hit live sandbox in CI |

Docs: `pytest` https://docs.pytest.org/ · `pytest-asyncio` https://pytest-asyncio.readthedocs.io/ · `testcontainers-python` https://testcontainers-python.readthedocs.io/

### 9.2 CI/CD

GitHub Actions: lint (`ruff`) → type-check (`mypy`) → test → build Docker image → deploy trigger to Coolify. `pre-commit` hooks locally for the same checks. Docs: https://docs.github.com/en/actions · https://docs.astral.sh/ruff/ · https://mypy.readthedocs.io/ · https://pre-commit.com/

### 9.3 Observability

- **Structured logging**: `structlog`, JSON in production, request/correlation ID per request. https://www.structlog.org/
- **Metrics**: `prometheus-fastapi-instrumentator` at `/metrics`. https://github.com/trallnag/prometheus-fastapi-instrumentator
- **Error tracking**: Sentry FastAPI integration. https://docs.sentry.io/platforms/python/integrations/fastapi/
- **Health checks**: `/healthz` (liveness), `/readyz` (checks MongoDB + MinIO connectivity), wired into Docker Compose healthchecks and usable by Coolify.

### 9.4 Configuration & secrets

`pydantic-settings` for typed, validated env config. https://docs.pydantic.dev/latest/concepts/pydantic_settings/ Secrets (Razorpay keys, MinIO credentials, JWT signing key) injected via Coolify/Docker Compose env vars — never committed, rotated on schedule.

### 9.5 API standards

- `/api/v1/...` from day one.
- Real Pydantic response models on every endpoint (not `dict`) so FastAPI's automatic `/docs`/`/redoc` stay accurate.
- Consistent error schema: `{"error": {"code": "...", "message": "...", "details": {...}}}`.
- ADRs (`docs/adr/000N-*.md`) for load-bearing decisions: gateway router, two-URL structure, MinIO-primary storage.

### 9.6 Backups & disaster recovery

- MongoDB: scheduled `mongodump` or provider-native point-in-time recovery — **test the restore path**, not just the backup job.
- MinIO: bucket versioning (already planned) protects against accidental overwrite, but isn't offsite backup — consider periodic replication of the report bucket given it's a compliance-retained archive.
- Recovery procedure documented in the ADR set, not just the backup schedule.

### 9.7 Operational simplicity — the Admin Settings screen

`/portal/admin/settings` — one page, built on Identity & Billing contexts, where an admin can without touching code: adjust role→permission mappings, view gateway health (`gateway_status`), manage plan pricing, toggle 2FA enforcement, check MinIO usage. This is what makes the architecture's real sophistication operable day-to-day from one place.

---

## 10. Environment Variables Reference

```bash
# App
APP_ENV=development|staging|production
API_BASE_PATH=/api/v1
JWT_SECRET_KEY=
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30

# MongoDB
MONGODB_URI=

# Storage (MinIO primary)
STORAGE_BACKEND=minio
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=research-reports
MINIO_SECURE=true

# Payments
PAYMENT_GATEWAYS=razorpay          # comma-separated; add "payu" later with no code change
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
# PAYU_MERCHANT_KEY=               # uncomment when PayU is added
# PAYU_MERCHANT_SALT=

# Auth
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

# Email / SMS
SENDGRID_API_KEY=                   # or POSTMARK_SERVER_TOKEN
MSG91_AUTH_KEY=                     # or TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN

# Observability
SENTRY_DSN=
LOG_LEVEL=info
```

---

## 11. Dependency Manifest

### 11.1 Backend (`requirements.txt` — additions/removals)

```diff
- stripe==8.3.0
+ razorpay
+ aiobreaker
+ minio
+ pyotp
+ qrcode
+ pydantic-settings
+ structlog
+ prometheus-fastapi-instrumentator
+ sentry-sdk[fastapi]
+ pypdf
+ reportlab

# dev/test only
+ pytest-asyncio
+ testcontainers
+ ruff
+ mypy
+ pre-commit
```

### 11.2 Frontend (`package.json` — additions)

No new runtime dependencies required beyond what's already present (React 19, Vite, Tailwind, React Router, Zod, React Hot Toast, Lucide React, `@react-oauth/google`). Razorpay Checkout loads via a CDN script tag per Razorpay's integration docs (§5.5) — no npm package needed.

---

## 12. Phased Execution Plan

**Phase 0a — Architecture & enterprise foundations (Weeks 1–2, backend track)**
Restructure `backend/` into `contexts/` per §2.2; GitHub Actions CI (lint/type-check/test gates); `structlog` + `/healthz`/`/readyz`; `pydantic-settings` config; routes under `/api/v1`.

**Phase 0b — App consolidation (Weeks 1–2, frontend track, parallel)**
Merge `frontend/` + `admin-dashboard/` into one Vite project; build `/portal` login + role-based rendering; code-split `/portal/admin/*` via `React.lazy`; single Caddy config for `www.raghuvirconsultants.in` only; retire `admin-dashboard/`.

**Phase 1 — Foundation hardening (Weeks 3–4)**
`permissions` model + `require_permission` guards (Identity context); `pyotp` 2FA for admin accounts; `audit_log` wired via domain events; stub `/portal/admin/settings` with role/permission management.

**Phase 2 — Billing (Weeks 5–7)**
`PaymentGateway` protocol + `RazorpayGateway` + `PaymentGatewayRouter` (Billing context); `plans`/`subscriptions` model; Razorpay Checkout integration; webhook endpoint + signature verification + idempotency; nightly reconciliation job; `gateway_status` wired to Admin Settings.

**Phase 3 — Model Portfolio (Weeks 8–9)**
`rebalance_events` + diff view; CAGR/XIRR performance endpoint; investor-facing rebalance timeline.

**Phase 4 — Support tooling (Weeks 10–12)**
`tickets` + `messages` (Client Support context); broadcast announcements; grievance category wired to Compliance via domain event.

**Phase 5 — Storage & compliance polish (Week 13+)**
`ReportStorage` + `MinIOStorage` against a fresh, versioned/Object-Lock-enabled bucket; watermarking pipeline; consent/fee-disclosure versioning; data export/deletion flow; backup/DR procedures tested and documented.

---

## 13. Confirmed Decisions Log

| # | Decision |
|---|---|
| 1 | Two URLs only: public site at domain root, unified `/portal` for both investor and admin, role-gated |
| 2 | Clean single cutover for the app merge — no redirect/grace-period transition (pre-launch, no live traffic) |
| 3 | Razorpay only at launch; PayU deferred, added later via the router with no rework |
| 4 | MinIO (self-hosted VPS) is the primary storage backend; fresh bucket, versioning + Object Lock from creation |
| 5 | FastAPI `BackgroundTasks` for async work through Phase 1–3; move to Redis-backed queue (`arq`/Celery) once traffic justifies it |
| 6 | `investors.role` built as a permission-referencing structure from the first document — no migration needed |
| 7 | `research_reports` is entirely new development — no legacy static/public path to move off |
| 8 | Backend organized into DDD bounded contexts behind ports-and-adapters from the start |
| 9 | Enterprise standards (testing, CI/CD, observability, config, backups) built in from Phase 0, not retrofitted |

No open questions remain. This document reflects the full, current build plan.
