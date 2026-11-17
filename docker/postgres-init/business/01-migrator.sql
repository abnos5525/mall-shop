-- Local development only: migration role with elevated privileges for Prisma migrate.
CREATE USER business_migrator WITH PASSWORD 'business_migrator_dev' SUPERUSER;