import { Module } from '@nestjs/common';
import { VideoApiController } from './video-api.controller';
import { VideoApiService } from './video-api.service';
import { RabbitMqModule } from '@app/rabbit-mq';

@Module({
  imports: [
    RabbitMqModule.register({
      url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
      queue: process.env.ENCODING_QUEUE || 'video_encoding_queue',
      durable: false,
    }),
  ],
  controllers: [VideoApiController],
  providers: [VideoApiService],
})
export class VideoApiModule {}
