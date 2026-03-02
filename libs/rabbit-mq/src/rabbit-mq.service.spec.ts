import { Test, TestingModule } from '@nestjs/testing';
import { RabbitMqPublisher } from './publisher/rabbit-mq.publisher';
import { RABBIT_MQ_OPTIONS } from './types/message.types';

describe('RabbitMqPublisher', () => {
  let publisher: RabbitMqPublisher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RABBIT_MQ_OPTIONS,
          useValue: {
            url: 'amqp://localhost:5672',
            queue: 'test_queue',
            durable: false,
          },
        },
        RabbitMqPublisher,
      ],
    }).compile();

    publisher = module.get<RabbitMqPublisher>(RabbitMqPublisher);
  });

  it('should be defined', () => {
    expect(publisher).toBeDefined();
  });
});
