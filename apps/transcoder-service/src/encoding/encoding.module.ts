import { Module } from '@nestjs/common';
import { LoggerModule } from '@app/logger';
import { RabbitMqModule } from '@app/rabbit-mq';
import { ConfigService } from '@nestjs/config';
import { EncodingService } from './encoding.service';
import { EncodingController } from './encoding.controller';

@Module({
  imports: [
    LoggerModule,
    RabbitMqModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get<string>('transcoder.rabbitMq.url')!,
        queue: config.get<string>('transcoder.s3UploadQueue')!,
        durable: false,
      }),
    }),
  ],
  controllers: [EncodingController],
  providers: [EncodingService],
})
export class EncodingModule {}
