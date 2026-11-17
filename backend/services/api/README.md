# API service

NestJS HTTP API. Prefix `/api/v1`. Initial Phase 1 endpoint: `/api/v1/health`.

Swagger/OpenAPI is mandatory:
- UI: `http://localhost:4000/api/docs`
- JSON: `http://localhost:4000/api/docs-json`

Enabled in development by default; disabled in production unless explicitly enabled and protected. Every endpoint and DTO must be documented in the same phase it is implemented.
Domain modules are added only in their authorized roadmap phase.
