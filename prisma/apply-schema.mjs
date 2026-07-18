// Fallback schema-apply for environments where the Prisma CLI's own engine
// can't open a TLS connection to the DB (observed on Windows → hosted Postgres:
// P1011 "badly formatted message"). Node's `pg` driver connects fine, so this
// applies the current schema DDL directly and idempotently. Run: `pnpm db:push:pg`.
//
// Keep this DDL in sync with prisma/schema.prisma. Where the Prisma CLI works
// (e.g. Linux deployment), prefer `prisma migrate deploy` / `db push` instead.
import 'dotenv/config';
import pg from 'pg';

const DDL = `
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
    CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
    CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'ADMIN');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
  "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
  "isActivated" BOOLEAN NOT NULL DEFAULT false,
  "activatedAt" TIMESTAMP(3),
  "activationCodeUsed" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "app_settings" (
  "id" TEXT NOT NULL,
  "activationCode" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");
`;

const connectionString = (process.env.DATABASE_URL ?? '')
  .replace(/[?&]sslmode=[^&]*/g, '')
  .replace(/[?&]$/, '');

const client = new pg.Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  await client.query(DDL);
  // Idempotently add SUSPENDED to a pre-existing UserStatus enum (run as its own
  // autocommit statement — ADD VALUE can't run inside a transaction block).
  await client.query(
    `ALTER TYPE "UserStatus" ADD VALUE IF NOT EXISTS 'SUSPENDED'`,
  );
  console.log('Schema applied (users, app_settings, enums).');
} catch (e) {
  console.error('Schema apply failed:', e.message);
  process.exit(1);
} finally {
  await client.end();
}
