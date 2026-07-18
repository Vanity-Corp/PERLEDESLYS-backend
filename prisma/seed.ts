import 'dotenv/config';
import { PrismaClient, UserRole, UserStatus } from '../src/prisma/client';
import { createPgAdapter } from '../src/prisma/pg-connection';
import * as bcrypt from 'bcryptjs';

// Seeds the singleton AppSettings (initial global activation code) plus a
// dashboard admin and a demo ACTIVE member for testing the native app.
// Idempotent — safe to re-run. Run with: `pnpm db:seed`.
const prisma = new PrismaClient({ adapter: createPgAdapter() });

const INITIAL_ACTIVATION_CODE = 'WELCOME2026';

async function main() {
  // AppSettings singleton
  const settings = await prisma.appSettings.findFirst();
  if (!settings) {
    await prisma.appSettings.create({
      data: { activationCode: INITIAL_ACTIVATION_CODE },
    });
    console.log(`Created AppSettings (code: ${INITIAL_ACTIVATION_CODE}).`);
  }

  // Dashboard admin
  const adminEmail = 'admin@perledelys.fr';
  if (!(await prisma.user.findUnique({ where: { email: adminEmail } }))) {
    await prisma.user.create({
      data: {
        firstName: 'Ghania',
        lastName: 'Admin',
        email: adminEmail,
        username: 'admin',
        passwordHash: await bcrypt.hash('admin1234', 10),
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isActivated: true,
        activatedAt: new Date(),
      },
    });
    console.log('Created admin user (admin@perledelys.fr / admin1234).');
  }

  // Demo ACTIVE member (native app)
  const memberEmail = 'yasmine.b@email.com';
  if (!(await prisma.user.findUnique({ where: { email: memberEmail } }))) {
    await prisma.user.create({
      data: {
        firstName: 'Yasmine',
        lastName: 'B.',
        email: memberEmail,
        username: 'yasmine',
        passwordHash: await bcrypt.hash('member1234', 10),
        role: UserRole.MEMBER,
        status: UserStatus.ACTIVE,
        isActivated: true,
        activatedAt: new Date(),
        activationCodeUsed: INITIAL_ACTIVATION_CODE,
      },
    });
    console.log('Created demo member (yasmine.b@email.com / member1234).');
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
