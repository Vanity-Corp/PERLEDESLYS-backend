import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from './client';
import { createPgAdapter } from './pg-connection';

// Prisma 7 connection model: PrismaClient is constructed with a driver adapter
// (no `url` in the schema datasource). The pg adapter (see pg-connection.ts)
// connects using DATABASE_URL over TLS.
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({ adapter: createPgAdapter() });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
