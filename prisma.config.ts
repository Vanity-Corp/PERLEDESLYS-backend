import "dotenv/config";
import { defineConfig } from "prisma/config";
import { createPgAdapter } from "./src/prisma/pg-connection";

// Prisma 7 config.
//   • `adapter` — the driver adapter the CLI uses where it can (studio, and the
//     runtime app uses the same one from PrismaService).
//   • `datasource.url` — still required by `prisma migrate` / `db push` (their
//     migration engine connects directly). The hosted DB uses an untrusted
//     cert, so `sslaccept=accept_invalid_certs` tells the engine not to verify
//     it (still encrypted). `sslmode=require` stays for the handshake.
const cliUrl = (() => {
  const raw = process.env.DATABASE_URL ?? "";
  return raw.includes("sslaccept=")
    ? raw
    : raw + (raw.includes("?") ? "&" : "?") + "sslaccept=accept_invalid_certs";
})();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  adapter: async () => createPgAdapter(),
  datasource: {
    url: cliUrl,
  },
});
