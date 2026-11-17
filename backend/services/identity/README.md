# Identity Service

NestJS service that exclusively owns the Identity PostgreSQL database.
Owns Telegram identity verification, users, sessions, roles, permissions, MFA metadata and identity audit.
No public endpoint should be exposed until the authentication phase implements and tests it.
