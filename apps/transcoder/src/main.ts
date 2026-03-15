import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@app/logger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { transcoderConfig, TranscoderConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LoggerService));

  const config = app.get<TranscoderConfig>(transcoderConfig.KEY);
  const rabbitMqUrl = config.rabbitMq.url;
  const encodingQueue = config.rabbitMq.encodingQueue;

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMqUrl],
      queue: encodingQueue,
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(config.port);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
