import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { RABBIT_MQ_OPTIONS } from '../types/message.types';
import type {
  BaseMessage,
  RabbitMqConnectionOptions,
} from '../types/message.types';

@Injectable()
export class RabbitMqPublisher implements OnModuleInit {
  private client: ClientProxy;

  constructor(
    @Inject(RABBIT_MQ_OPTIONS)
    private readonly options: RabbitMqConnectionOptions,
  ) {}

  onModuleInit(): void {
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [this.options.url],
        queue: this.options.queue,
        queueOptions: {
          durable: this.options.durable ?? false,
        },
      },
    });
  }

  emit<TPayload>(
    pattern: string,
    message: BaseMessage<TPayload>,
  ): Observable<void> {
    return this.client.emit<void, BaseMessage<TPayload>>(pattern, message);
  }

  send<TPayload, TResult>(
    pattern: string,
    message: BaseMessage<TPayload>,
  ): Observable<TResult> {
    return this.client.send<TResult, BaseMessage<TPayload>>(pattern, message);
  }
}
