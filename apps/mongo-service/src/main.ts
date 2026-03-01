import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { MongoServiceModule } from './mongo-service.module';
import { LoggerService } from '@app/logger';
import { GlobalExceptionFilter } from './filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(MongoServiceModule, { bufferLogs: true });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  const config = app.get(ConfigService);
  const port = config.get<number>('mongoService.port')!;

  await app.listen(port);
}
bootstrap();
