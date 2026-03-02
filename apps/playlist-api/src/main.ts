import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { PlaylistApiModule } from './playlist-api.module';

async function bootstrap() {
  const app = await NestFactory.create(PlaylistApiModule, { bufferLogs: true });

  const logger = app.get(LoggerService);
  app.useLogger(logger);

  const config = app.get(ConfigService);
  const port = config.get<number>('playlistApi.port')!;

  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
