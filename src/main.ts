import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { AppModule } from './app.module';

/** Orígenes del front que siempre se permiten (prod + dev local). */
const DEFAULT_CORS_ORIGINS = [
  'https://ventascasasmx.store',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

/** Orígenes permitidos: `CORS_ORIGIN` separado por comas. Vacío = refleja el `Origin` de la petición. */
function corsOrigin(): CorsOptions['origin'] {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) return true;
  const fromEnv = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return [...new Set([...fromEnv, ...DEFAULT_CORS_ORIGINS])];
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: corsOrigin(),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    maxAge: 86_400,
  });
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port);
}
bootstrap();
