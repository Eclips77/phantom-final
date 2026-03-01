import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { GenreApiModule } from './genre-api.module';

async function bootstrap() {
  const app = await NestFactory.create(GenreApiModule, { bufferLogs: true });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  const config = app.get(ConfigService);
  const port = config.get<number>('genreApi.port')!;

  await app.listen(port);
}
bootstrap();
