# Architecture decisions

## ADR-001: API + worker instead of many microservices
Status: Accepted for MVP.
Reason: User wants service separation but minimum code and operational complexity. API and worker are independently runnable; Nest modules preserve domain boundaries. Split further only with evidence.

## ADR-002: Prisma over TypeORM
Status: Accepted.
Reason: Schema-first workflow, generated TypeScript client, migrations, and fast development. Keep business logic in Nest services, not Prisma-specific code in controllers.

## ADR-003: Native fetch over Axios
Status: Accepted.
Reason: Built-in fetch is sufficient for a small typed API client and works naturally with Next.js. Add Axios only if a concrete interceptor/transport requirement emerges.

## ADR-004: Admin-curated offers first
Status: Accepted.
Reason: Avoid merchant onboarding, inventory, payments, and scraping. Validate user demand and affiliate economics before expanding.

## ADR-005: No product checkout or payment
Status: Accepted.
Reason: Seller/affiliate partner owns checkout and fulfillment. DropClub tracks outbound clicks only; commission is verified externally.
