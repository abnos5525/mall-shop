# mall-shop — DropClub Telegram Mini App

This repository is the starter blueprint for **DropClub**: a curated deals + affiliate discovery Telegram Mini App.
The product does **not** own inventory, process customer checkout, ship goods, or contain AI features.

## Product boundaries (MVP)
- Curated offers managed by an admin.
- Categories, offer details, favorites, and user-submitted purchase requests.
- Affiliate/outbound links with first-party click tracking.
- Telegram Mini App authentication verified on the backend using raw `initData`.
- Optional Telegram bot notifications only after explicit user consent.
- No merchant self-service portal, payments, wallet, inventory, scraping, or AI in MVP.

## Architecture
- `frontend/`: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui.
- `backend/services/api/`: NestJS HTTP API; modular domain boundaries.
- `backend/services/worker/`: NestJS/BullMQ worker for background jobs.
- `backend/packages/database/`: Prisma schema/client and migrations.
- `backend/packages/contracts/`: shared API contracts/enums only where genuinely shared.
- PostgreSQL is the source of truth; Redis is used for queues/rate-limit/cache only where needed.
- pnpm workspace monorepo.

This is a **small, independently deployable API + worker architecture**, not a premature fleet of tiny services. Keep business domains modular so they can be extracted later if load/team boundaries justify it.

## Local development
See [docs/LOCAL-DEVELOPMENT.md](docs/LOCAL-DEVELOPMENT.md) for Docker, env setup, migrations, and smoke tests.

## Important
- Do not assume affiliate approval, commission rates, partner APIs, or tracking support. Treat them as configuration verified with each partner.
- Never claim a sale/commission unless a partner report or manually verified evidence confirms it.
- Never trust `initDataUnsafe`. Send raw Telegram `initData` to the backend and validate it there.
- Keep all secrets server-side. `.env.example` contains placeholders only.
- No AI/LLM features in the product.
