import { NestFactory } from '@nestjs/core';
import { VideoApiModule } from './video-api.module';

async function bootstrap() {
  const app = await NestFactory.create(VideoApiModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
