import { NestFactory } from '@nestjs/core';
import type { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { TranscoderModule } from './transcoder.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(TranscoderModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
      queue: process.env.ENCODING_QUEUE ?? 'video_encoding_queue',
      queueOptions: {
        durable: false,
      },
      noAck: false,
    },
  });

  await app.listen();
}

bootstrap();
