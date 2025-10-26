# Prisma Migrations

This directory contains all database migrations for LE BOOM v2.

## Migrations

- `20251026000000_init`: Initial database schema with all tables

## Running Migrations

In production (Docker):
```bash
docker exec -it boom-webapp npx prisma migrate deploy
```

In development:
```bash
npm run prisma:migrate
```
