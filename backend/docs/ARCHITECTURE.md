# Enterprise System Architecture (v2.12.14)

This document provides complete technical specifications for the Raghuvir Consultants Enterprise Wealth & Advisory platform.

---

## 1. System Overview & Domain Topology

The platform operates on a decoupled client-server architecture serving unified and admin domain contexts managed via **Docker Compose**:
- **`raghuvircons.local` / `www.raghuvirconsultants.in` (Port 80/443)**: Main Public Portal, Investor Dashboard, & `/api/` reverse-proxied FastAPI backend.
- **`app.raghuvircons.local` / `admin.raghuvirconsultants.in` (Port 80/443)**: Zaga Admin Console context.
- **FastAPI REST API Server (Port 8000)**: Asynchronous Python backend powered by MongoDB Atlas / Local MongoDB.

```mermaid
graph TD
    subgraph ClientDomains["Client Domains & Port Routing"]
        PublicDomain["www.raghuvirconsultants.in (Public & Investor Portal + /api Reverse Proxy)"]
        AdminDomain["admin.raghuvirconsultants.in (Standalone Zaga Admin Console)"]
    end

    subgraph ComposeStack["Unified Docker Compose Stack (Default Bridge Network: coolify)"]
        subgraph ReactFrontend["React 18 + Vite Frontend Application"]
            AppRouter["App.jsx Dual Domain Router"]
            
            subgraph PublicPortal["Public & Investor Portal"]
              PublicViews["Home / Services / Smallcases / News"]
              InvestorPortal["Investor Dashboard & Subscribed Services"]
            end

            subgraph ZagaAdmin["Standalone Admin Console"]
              AdminLayout["AdminAppLayout (Zaga Design System)"]
              AdminModules["CRUD Modules: Users, Reports, Portfolio, Smallcases, Services, News, Alerts, Blogs, Telemetry"]
            end
        end

        subgraph FastAPIServer["FastAPI Asynchronous Backend (v2.12.14)"]
            API["app/main.py (CORS & Middleware)"]
            AuthRouter["auth_router.py (/api/auth)"]
            AdminRouter["admin_router.py (/api/admin)"]
            ReportsRouter["reports_router.py (/api/reports)"]
            PortfolioRouter["portfolio_router.py (/api/portfolio)"]
            PaymentsRouter["payments_router.py (/api/payments)"]
            CRUDRouters["crud_routers.py (/api/smallcases, /services, /blogs)"]
            SystemRouter["system_router.py (/api/system/status)"]
        end
    end

    subgraph DataStore["MongoDB Storage Layer"]
        MongoDB[(MongoDB Atlas / Local DB - 50,000+ Record Capacity)]
    end

    PublicDomain --> AppRouter
    AdminDomain --> AppRouter

    AppRouter --> PublicPortal
    AppRouter --> ZagaAdmin

    PublicPortal -->|REST Calls + Bearer JWT| API
    ZagaAdmin -->|Admin Bearer JWT| API

    API --> AuthRouter
    API --> AdminRouter
    API --> ReportsRouter
    API --> PortfolioRouter
    API --> PaymentsRouter
    API --> CRUDRouters
    API --> SystemRouter

    AuthRouter --> MongoDB
    AdminRouter --> MongoDB
    ReportsRouter --> MongoDB
    PortfolioRouter --> MongoDB
    PaymentsRouter --> MongoDB
    CRUDRouters --> MongoDB
    SystemRouter --> MongoDB

    %% Pastel Color Palette Styling
    style PublicDomain fill:#FFDAC1,stroke:#FFB7B2,stroke-width:2px,color:#222;
    style AdminDomain fill:#FFB7B2,stroke:#FF8B94,stroke-width:2px,color:#222;
    style AppRouter fill:#E2F0CB,stroke:#B5EAD7,stroke-width:2px,color:#222;
    style PublicPortal fill:#E2F0CB,stroke:#B5EAD7,stroke-width:1px,color:#222;
    style ZagaAdmin fill:#B5EAD7,stroke:#93E1D8,stroke-width:1px,color:#222;
    style FastAPIServer fill:#C7CEEA,stroke:#B5EAD7,stroke-width:2px,color:#222;
    style DataStore fill:#E0BBE4,stroke:#957FEF,stroke-width:2px,color:#222;
```

---

## 2. Authentication & Authorization Lifecycle

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Admin Browser
    participant FE as React Frontend
    participant BE as FastAPI Backend
    participant DB as MongoDB Database

    Admin->>FE: Access app.raghuvircons.local
    FE->>FE: Check localStorage for token
    alt Token Missing
        FE->>FE: Render Login Page (/login)
        Admin->>FE: Enter admin@raghuvir.com / admin12345
        FE->>BE: POST /api/auth/login
        BE->>DB: Query user by email/username
        DB-->>BE: Return user record
        BE->>BE: Verify bcrypt password hash
        BE-->>FE: Return Bearer JWT token (role: admin)
        FE->>FE: Store token & username in localStorage
    end
    FE->>BE: GET /api/admin/investors (Header: Bearer token)
    BE->>BE: require_admin dependency check
    BE->>DB: Fetch investors page 1
    DB-->>BE: Return indexed data
    BE-->>FE: HTTP 200 OK (Data payload)
```

---

## 3. High Performance & Scalability Design

1. **50,000+ Record Database Indexing**:
   - Compound MongoDB indexes on `email`, `created_at`, `tags`, `status`, and `published_at`.
   - Server-side skip/limit pagination enforced across all endpoints (`page=1&limit=10`).
2. **Security Hardening**:
   - bcrypt password hashing with policy enforcement (min 7 chars + special char `!@#$%`).
   - Role-based authorization (`UserRole.ADMIN` vs `UserRole.INVESTOR`).
