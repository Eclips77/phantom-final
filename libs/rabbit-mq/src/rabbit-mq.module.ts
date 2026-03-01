import { DynamicModule, Module } from '@nestjs/common';
import { RabbitMqPublisher } from './publisher/rabbit-mq.publisher';
import { RABBIT_MQ_OPTIONS, RabbitMqConnectionOptions } from './types/message.types';

@Module({})
export class RabbitMqModule {
  static register(options: RabbitMqConnectionOptions): DynamicModule {
    return {
      module: RabbitMqModule,
      providers: [
        {
          provide: RABBIT_MQ_OPTIONS,
          useValue: options,
        },
        RabbitMqPublisher,
      ],
      exports: [RabbitMqPublisher],
    };
  }
}
