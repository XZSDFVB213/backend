import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({ 
    origin: [
      'http://localhost:4200',
      'https://socialniy.ru/',
      'http://socialniy.ru/',
      'https://socialniy.ru',
      'http://socialniy.ru',
      'https://api.socialniy.ru',
    ], // Allowed origins
    credentials: true, // Allow credentials (e.g., cookies)
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
