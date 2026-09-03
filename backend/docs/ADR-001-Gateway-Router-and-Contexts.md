# ADR-001: Gateway Router and Domain-Driven Contexts

## Status
Accepted

## Context
As the monolithic FastAPI application grew, `main.py` became bloated with cross-cutting concerns, scattered endpoints, and overlapping responsibilities. Maintaining clean boundaries between modules (like Billing, Identity, and Publishing) became increasingly difficult.

## Decision
We decided to adopt a Domain-Driven Design (DDD) Bounded Contexts approach. The backend is now modularized into explicitly distinct contexts inside `backend/contexts/`:
- `identity`
- `billing`
- `research_publishing`
- `model_portfolio`
- `client_support`

Each context defines its own `domain` (Entities, Events, Ports), `infrastructure` (Adapters like Mongo or MinIO), `application` (Use Cases), and `interfaces` (FastAPI Routers, dependencies).

`backend/app/main.py` is now strictly an API Gateway Router. It imports the individual routers from each context and mounts them under `/api/v1/`.

## Consequences
- **Positive:** Extremely clean separation of concerns. Easy to test use cases in isolation without spinning up FastAPI. Team members can work on different contexts without merge conflicts in routers.
- **Negative:** Slightly higher file boilerplate for small features (requiring entities, ports, and use cases even for simple CRUD).
