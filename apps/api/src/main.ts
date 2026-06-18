import './config/pg-timestamp';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

// TZ Node = VN cho log/business logic; timestamp DB vẫn parse UTC qua pg-timestamp.ts
process.env.TZ = process.env.TZ || 'Asia/Ho_Chi_Minh';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global prefix cho tất cả routes
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(apiPrefix);

  // Global validation pipe — tự động validate DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error on unknown properties
      transform: true,           // Auto-transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // CORS — cho phép Customer App và POS App kết nối
  const corsOrigin = configService.get<string>('CORS_ORIGIN', 'http://localhost:3000,http://localhost:3002');
  app.enableCors({
    origin: corsOrigin.split(',').map((o) => o.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  const port = configService.get<number>('API_PORT', 3001);
  await app.listen(port);
  console.log(`🚀 Smart Order API is running on: http://localhost:${port}/${apiPrefix}`);
}

bootstrap();
