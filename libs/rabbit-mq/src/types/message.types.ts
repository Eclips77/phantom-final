export interface BaseMessage<TPayload = Record<string, unknown>> {
  eventId: string;
  timestamp: string;
  source: string;
  payload: TPayload;
}

export interface RabbitMqConnectionOptions {
  url: string;
  queue: string;
  durable?: boolean;
}

export const RABBIT_MQ_OPTIONS = Symbol('RABBIT_MQ_OPTIONS');
