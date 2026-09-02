# Architecture & System Design

## Bounded Contexts
The backend follows Domain-Driven Design principles with clean architecture.

```mermaid
graph TD
    classDef frontend fill:#FFDAC1,stroke:#E2F0CB,stroke-width:2px;
    classDef context fill:#B5EAD7,stroke:#C7CEEA,stroke-width:2px;
    classDef infra fill:#E2F0CB,stroke:#FFB7B2,stroke-width:2px;
    classDef core fill:#C7CEEA,stroke:#B5EAD7,stroke-width:2px;

    Client[Frontend UI]:::frontend
    Admin[Admin UI]:::frontend
    
    Identity[Identity & Access]:::context
    Compliance[Compliance & Audit]:::context
    Reports[Research Reports]:::context
    Portfolio[Model Portfolio]:::context
    Payments[Billing & Payments]:::context

    Mongo[(MongoDB)]:::infra
    Sentry[Sentry]:::infra
    Prometheus[Prometheus Metrics]:::infra
    
    Client --> Identity
    Admin --> Identity
    
    Identity --> Mongo
    Compliance --> Mongo
    Reports --> Mongo
    Portfolio --> Mongo
    Payments --> Mongo
    
    Identity --> Sentry
    Compliance --> Sentry
    Reports --> Sentry
    
    Identity --> Prometheus
```

## Security & Identity
We use JWT for authorization and TOTP for multi-factor authentication.

```mermaid
sequenceDiagram
    participant User
    participant AuthRouter as Identity Router
    participant Usecase as Identity Use Cases
    participant DB as MongoDB

    User->>AuthRouter: POST /api/v1/auth/login
    AuthRouter->>Usecase: authenticate(email, password, totp)
    Usecase->>DB: get_by_email()
    DB-->>Usecase: Investor Entity
    Usecase->>Usecase: verify_password() & verify_2fa()
    Usecase-->>AuthRouter: Success
    AuthRouter-->>User: JWT Token
```
