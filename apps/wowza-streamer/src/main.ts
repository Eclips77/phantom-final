import { NestFactory } from '@nestjs/core';
import { WowzaStreamerModule } from './wowza-streamer.module';
import { LoggerService } from '@app/logger';
import { wowzaStreamerConfig, WowzaStreamerConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(WowzaStreamerModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(LoggerService));

  const config = app.get<WowzaStreamerConfig>(wowzaStreamerConfig.KEY);
  await app.listen(config.port);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
