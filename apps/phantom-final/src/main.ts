import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@app/logger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(LoggerService));

  const configService = app.get(ConfigService);
  const rabbitMqUrl =
    configService.get<string>('RABBITMQ_URL') ?? 'amqp://localhost:5672';
  const encodingQueue =
    configService.get<string>('ENCODING_QUEUE') ?? 'video_encoding_queue';

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
  await app.listen(process.env.PORT ?? 3002);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
