import { PrismaPg } from '@prisma/adapter-pg';

// Builds the pg driver adapter used everywhere we talk to Postgres — the
// NestJS PrismaService, the seed script, AND the Prisma CLI (via
// prisma.config.ts). Centralised so the TLS handling lives in one place.
//
// The hosted DB presents an untrusted/self-signed certificate, so:
//   • `sslmode` is stripped from the URL — node-postgres treats `sslmode=require`
//     as `verify-full`, which rejects the cert ("unable to verify the first
//     certificate").
//   • TLS is still used (`ssl` set), but CA verification is disabled. The
//     connection is encrypted; only the cert chain isn't verified. For stricter
//     security later, supply the server's CA cert here instead.
export function createPgAdapter(): PrismaPg {
  const raw = process.env.DATABASE_URL ?? '';
  const connectionString = raw
    .replace(/[?&]sslmode=[^&]*/g, '')
    .replace(/[?&]$/, '');
  return new PrismaPg({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
}
