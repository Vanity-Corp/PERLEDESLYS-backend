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
  "firstName" TEXT,
  "lastName" TEXT,
  "email" TEXT,
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

-- Content tables (BACKEND_PLAN.md Phase 5).
CREATE TABLE IF NOT EXISTS "recipes" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "portions" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "cookidooUrl" TEXT NOT NULL,
  "isNew" BOOLEAN NOT NULL DEFAULT false,
  "ingredients" JSONB NOT NULL,
  "steps" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "videos" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "duration" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "articles" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "readTime" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "lives" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "image" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "lives_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "events" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "time" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "faq_items" (
  "id" TEXT NOT NULL,
  "q" TEXT NOT NULL,
  "a" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "faq_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "welcome_message" (
  "id" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "welcome_message_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "founder_info" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "fullName" TEXT NOT NULL,
  "bio" TEXT NOT NULL,
  "avatar" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "founder_info_pkey" PRIMARY KEY ("id")
);
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
  // Registration is username+password only (WIRING_PLAN B1): relax NOT NULL on
  // the legacy name/email columns of a pre-existing users table (no-op if
  // already nullable).
  await client.query('ALTER TABLE "users" ALTER COLUMN "firstName" DROP NOT NULL');
  await client.query('ALTER TABLE "users" ALTER COLUMN "lastName" DROP NOT NULL');
  await client.query('ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL');
  console.log('Schema applied (users, app_settings, enums).');
} catch (e) {
  console.error('Schema apply failed:', e.message);
  process.exit(1);
} finally {
  await client.end();
}
