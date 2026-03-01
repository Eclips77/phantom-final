import { BaseMessage } from '../types/message.types';

export abstract class RabbitMqConsumer<TPayload = Record<string, unknown>> {
  abstract handle(message: BaseMessage<TPayload>): Promise<void>;
}
