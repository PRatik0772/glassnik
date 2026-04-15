import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];

function validateEnv() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[startup] Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.warn('[startup] GOOGLE_APPLICATION_CREDENTIALS not set — GCS uploads will fail');
  }
  if (!process.env.GCP_BUCKET_NAME) {
    console.warn('[startup] GCP_BUCKET_NAME not set — defaulting to "glassnik"');
  }
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);

  // Enable validation for all incoming requests
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // Allow Expo web preview (localhost:8081) to call the API
  app.enableCors({ origin: true });

  // Ensures Prisma shuts down gracefully
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
