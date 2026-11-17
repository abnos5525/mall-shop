-- Local development only: migration role with elevated privileges for Prisma migrate.
CREATE USER identity_migrator WITH PASSWORD 'identity_migrator_dev' SUPERUSER;