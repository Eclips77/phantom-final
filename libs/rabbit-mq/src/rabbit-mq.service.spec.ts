import { Test, TestingModule } from '@nestjs/testing';
import '../test/rabbitmq.mock';
import { RabbitMqPublisher } from './publisher/rabbit-mq.publisher';
import { RABBIT_MQ_OPTIONS } from './types/message.types';
import {
  mockClientProxy,
  mockClientProxyFactory,
  mockRabbitMqOptions,
} from '../test/rabbitmq.mock';
import { Transport } from '@nestjs/microservices';
import { Observable } from 'rxjs';

describe('RabbitMqPublisher', () => {
  let publisher: RabbitMqPublisher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RABBIT_MQ_OPTIONS,
          useValue: mockRabbitMqOptions,
        },
        RabbitMqPublisher,
      ],
    }).compile();

    publisher = module.get<RabbitMqPublisher>(RabbitMqPublisher);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(publisher).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should create client proxy with correct options', () => {
      publisher.onModuleInit();

      expect(mockClientProxyFactory.create).toHaveBeenCalledWith({
        transport: Transport.RMQ,
        options: {
          urls: [mockRabbitMqOptions.url],
          queue: mockRabbitMqOptions.queue,
          queueOptions: {
            durable: mockRabbitMqOptions.durable,
          },
        },
      });
    });
  });

  describe('emit and send methods', () => {
    beforeEach(() => {
      publisher.onModuleInit();
    });

    const mockMessage = {
      eventId: '123',
      timestamp: '2023-01-01',
      source: 'test-source',
      payload: { data: 'test-data' },
    };

    it('should call client.emit with pattern and message', () => {
      const pattern = 'test-pattern';
      const mockObservable = new Observable<void>();
      mockClientProxy.emit.mockReturnValue(mockObservable);

      const result = publisher.emit(pattern, mockMessage);

      expect(mockClientProxy.emit).toHaveBeenCalledWith(pattern, mockMessage);
      expect(result).toBe(mockObservable);
    });

    it('should call client.send with pattern and message', () => {
      const pattern = 'test-pattern';
      const mockObservable = new Observable<unknown>();
      mockClientProxy.send.mockReturnValue(mockObservable);

      const result = publisher.send(pattern, mockMessage);

      expect(mockClientProxy.send).toHaveBeenCalledWith(pattern, mockMessage);
      expect(result).toBe(mockObservable);
    });
  });
});
