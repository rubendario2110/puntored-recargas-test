import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/common/app.module';
import { HttpLoggingInterceptor } from './infrastructure/common/logger/http-logging.interceptor';
import { StructuredLogger } from './infrastructure/common/logger/structured-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: true,
    bufferLogs: true,
  });

  const logger = app.get(StructuredLogger);
  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
  app.useGlobalInterceptors(new HttpLoggingInterceptor(logger));

  await app.listen(3000);
  const url = await app.getUrl();
  logger.log({ message: 'application_started', context: 'Bootstrap', details: { url } });
}
bootstrap();
