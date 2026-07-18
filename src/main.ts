// Load .env into process.env before anything else — the Prisma driver adapter
// (PrismaService) reads DATABASE_URL from process.env at construction time.
import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // The dashboard (Vite) and Expo web both call this API cross-origin.
  // Native iOS/Android aren't subject to CORS, but web targets are.
  app.enableCors({ origin: true, credentials: true });

  // All routes live under /api (matches the native client's `${API_URL}/api`).
  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
