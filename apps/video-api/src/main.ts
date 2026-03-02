import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { VideoApiModule } from './video-api.module';
import { LoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(VideoApiModule, { bufferLogs: true });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  const config = app.get(ConfigService);
  const port = config.get<number>('videoApi.port')!;

  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
