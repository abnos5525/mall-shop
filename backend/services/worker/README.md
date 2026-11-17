# Worker service

NestJS process for BullMQ jobs. Initial phase creates a healthy worker bootstrap and Redis connection.
Add domain jobs only in their authorized roadmap phase. Jobs must be idempotent and retry-safe.
