# SEBI RA Platform — Task Checklist

## Phase 0a: Backend Architecture (Weeks 1–2)
- [ ] Task 1: Bootstrap — pydantic-settings, structlog, healthz/readyz
- [ ] Task 2: Shared kernel — value objects + domain event dispatcher
- [ ] Task 3: Identity context — domain layer (Investor, Role, Permission)
- [ ] Task 4: Identity context — application + infrastructure layers
- [ ] Task 5: Identity context — FastAPI interface + DI wiring
- [ ] Task 6: Migrate CRUD routers to /api/v1 namespace
- [ ] Task 7: CI pipeline — GitHub Actions, pre-commit, ruff, mypy, Prometheus, Sentry

### ✅ Checkpoint: Phase 0a
- [ ] All tests pass, ruff/mypy clean, Docker builds
- [ ] Identity E2E (register, login, Google SSO)
- [ ] /healthz, /readyz, /metrics operational
- [ ] CI green — **REVIEW BEFORE PROCEEDING**

---

## Phase 0b: Frontend Consolidation + Design System (Weeks 1–2, parallel)
- [ ] Task 8: Design system foundation — CSS variables (Canvas Cream, Ink Black, Sofia Sans), component primitives (PillButton, CirclePortrait, SatelliteCTA, FloatingNav, EyebrowLabel, StadiumHero, GhostWatermark, OrbitalArc, Footer)
- [ ] Task 9: Merge admin-dashboard into frontend — adapt to DESIGN.md (pill buttons, 40px radii, Canvas Cream)
- [ ] Task 10: Portal routes + auth gate + code splitting + FloatingNav pill
- [ ] Task 11: Update Caddy/proxy, retire admin-dashboard

### ✅ Checkpoint: Phase 0b
- [ ] Design system fully implemented per DESIGN.md
- [ ] Single build: public + portal + admin (code-split)
- [ ] FloatingNav pill on all pages, Canvas Cream everywhere
- [ ] admin-dashboard archived — **REVIEW BEFORE PROCEEDING**

---

## Phase 1: RBAC, 2FA, Audit (Weeks 3–4)
- [ ] Task 12: Permissions model + require_permission guards
- [ ] Task 13: TOTP 2FA for admin accounts (QR in circular portrait frame)
- [ ] Task 14: Compliance context — audit_log + consent_records
- [ ] Task 15: Admin Settings page — pill tags for permissions, EyebrowLabel headers

### ✅ Checkpoint: Phase 1
- [ ] Permission-based RBAC, admin 2FA, audit log
- [ ] Settings page editorial per DESIGN.md — **REVIEW BEFORE PROCEEDING**

---

## Phase 2: Billing & Payments (Weeks 5–7)
- [ ] Task 16: Billing domain — Plan, Subscription, PaymentGateway port
- [ ] Task 17: RazorpayGateway adapter + webhook endpoint
- [ ] Task 18: Billing application — subscribe, cancel, reconcile
- [ ] Task 19: Razorpay Checkout frontend — pricing with stadium-pill cards, plan eyebrows, Ink Black subscribe CTAs
- [ ] Task 20: Admin billing dashboard — circular gateway health ring, stadium plan cards

### ✅ Checkpoint: Phase 2
- [ ] Razorpay E2E, webhooks, subscriptions
- [ ] Pricing page warm editorial per DESIGN.md
- [ ] **REVIEW BEFORE PROCEEDING**

---

## Phase 3: Research Publishing (Weeks 8–9)
- [ ] Task 21: Research Publishing domain + ReportStorage port
- [ ] Task 22: MinIO adapter + watermarking pipeline
- [ ] Task 23: Report UI — circular portrait cards with satellite download CTAs, orbital arcs, ghost watermark

## Phase 4: Model Portfolio (Weeks 8–9, parallel)
- [ ] Task 24: Model Portfolio domain + rebalance events
- [ ] Task 25: Portfolio UI — orbital arc rebalance timeline, circular holding cards, CAGR chart

### ✅ Checkpoint: Phase 3+4
- [ ] Reports as circular portraits with orbital arcs
- [ ] Portfolio rebalance timeline uses orbital motif
- [ ] **REVIEW BEFORE PROCEEDING**

---

## Phase 5: Client Support (Weeks 10–12)
- [ ] Task 26: Client Support context — tickets + messages
- [ ] Task 27: Support UI — pill category toggles, circular SLA rings, stadium chat cards

### ✅ Checkpoint: Phase 5
- [ ] Support lifecycle E2E per DESIGN.md styling
- [ ] **REVIEW BEFORE PROCEEDING**

---

## Phase 6: Launch Prep (Week 13+)
- [ ] Task 28: Consent versioning + data export/deletion
- [ ] Task 29: Backup/DR — MongoDB + MinIO (tested)
- [ ] Task 30: ADRs — gateway router, two-URL, MinIO WORM, Mastercard design system
- [ ] Task 31: Remove legacy code + final cleanup (no pure white, no rectangular buttons)
- [ ] Task 32: E2E smoke tests (coverage ≥ 95%)
- [ ] Task 33: v3.0.0 release — version bump, docs, graphify

### ✅ Checkpoint: Complete
- [ ] All 33 tasks done, coverage ≥ 95%, CI green
- [ ] Every surface: Canvas Cream, Sofia Sans, pills, circles, orbital arcs
- [ ] Docs + ADRs complete, backup/restore tested
- [ ] **READY FOR PRODUCTION DEPLOYMENT REVIEW**
