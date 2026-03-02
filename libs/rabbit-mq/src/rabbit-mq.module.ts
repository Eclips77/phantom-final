import { DynamicModule, Module } from '@nestjs/common';
import { RabbitMqPublisher } from './publisher/rabbit-mq.publisher';
import {
  RABBIT_MQ_OPTIONS,
  RabbitMqConnectionOptions,
  RabbitMqAsyncOptions,
} from './types/message.types';

@Module({})
export class RabbitMqModule {
  static register(options: RabbitMqConnectionOptions): DynamicModule {
    return {
      module: RabbitMqModule,
      providers: [
        { provide: RABBIT_MQ_OPTIONS, useValue: options },
        RabbitMqPublisher,
      ],
      exports: [RabbitMqPublisher],
    };
  }

  static registerAsync(options: RabbitMqAsyncOptions): DynamicModule {
    return {
      module: RabbitMqModule,
      imports: options.imports ?? [],
      providers: [
        {
          provide: RABBIT_MQ_OPTIONS,
          inject: options.inject ?? [],
          useFactory: options.useFactory,
        },
        RabbitMqPublisher,
      ],
      exports: [RabbitMqPublisher],
    };
  }
}
