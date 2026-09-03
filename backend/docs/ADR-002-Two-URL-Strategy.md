# ADR-002: Two-URL Architecture Strategy

## Status
Accepted

## Context
We need to serve distinct experiences for the marketing site (SEO-focused, fast load times) and the investor portal/admin console (highly dynamic, authenticated single-page applications). Mixing these under a single URL structure causes routing conflicts and increases the bundle size for anonymous visitors.

## Decision
We implemented a Two-URL strategy:
- `www.raghuvirconsultants.com`: Static, SEO-optimized marketing site built with React Router (or future Next.js export).
- `portal.raghuvirconsultants.com` (or `/portal` mapped via reverse proxy): The dynamic React SPA hosting both the Investor Dashboard and the Admin Console.

A reverse proxy script (`proxy.mjs` / Traefik) intercepts traffic and routes `/api` to the FastAPI backend, while routing static file requests to the appropriate frontend build depending on the domain or path prefix.

## Consequences
- **Positive:** Clear separation between public marketing content and secure portal code. SEO is unaffected by the heavy dashboard JavaScript.
- **Negative:** Requires slightly more complex deployment logic (proxy configuration and CORS handling).
