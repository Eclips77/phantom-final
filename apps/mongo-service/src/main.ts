import { NestFactory } from '@nestjs/core';
import { MongoServiceModule } from './mongo-service.module';
import { mongoServiceConfig, MongoServiceConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(MongoServiceModule);

  const config = app.get<MongoServiceConfig>(mongoServiceConfig.KEY);
  await app.listen(config.port);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
