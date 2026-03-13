import { NestFactory } from '@nestjs/core';
import { WowzaStreamerModule } from './wowza-streamer.module';
import { LoggerService } from '@app/logger';

async function bootstrap() {
  const app = await NestFactory.create(WowzaStreamerModule, {
    bufferLogs: true,
  });
  app.useLogger(app.get(LoggerService));

  await app.listen(process.env.PORT ?? 3003);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
