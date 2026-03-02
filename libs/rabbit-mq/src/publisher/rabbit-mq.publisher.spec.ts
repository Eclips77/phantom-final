import { Test, TestingModule } from '@nestjs/testing';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { of } from 'rxjs';
import { RabbitMqPublisher } from './rabbit-mq.publisher';
import { RABBIT_MQ_OPTIONS, BaseMessage } from '../types/message.types';

describe('RabbitMqPublisher', () => {
  let publisher: RabbitMqPublisher;
  let mockClientProxy: { emit: jest.Mock; send: jest.Mock };

  beforeEach(async () => {
    mockClientProxy = {
      emit: jest.fn(),
      send: jest.fn(),
    };
    jest.spyOn(ClientProxyFactory, 'create').mockReturnValue(mockClientProxy);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: RABBIT_MQ_OPTIONS,
          useValue: {
            url: 'amqp://localhost:5672',
            queue: 'test_queue',
            durable: true,
          },
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
    it('should create a client proxy with correct options', () => {
      publisher.onModuleInit();

      expect(jest.spyOn(ClientProxyFactory, 'create')).toHaveBeenCalledWith({
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'test_queue',
          queueOptions: {
            durable: true,
          },
        },
      });
    });

    it('should create a client proxy with durable false if not provided', async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          {
            provide: RABBIT_MQ_OPTIONS,
            useValue: { url: 'amqp://localhost:5672', queue: 'test_queue' },
          },
          RabbitMqPublisher,
        ],
      }).compile();

      const publisherWithoutDurable =
        module.get<RabbitMqPublisher>(RabbitMqPublisher);
      publisherWithoutDurable.onModuleInit();

      expect(jest.spyOn(ClientProxyFactory, 'create')).toHaveBeenCalledWith({
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'test_queue',
          queueOptions: {
            durable: false,
          },
        },
      });
    });
  });

  describe('emit', () => {
    it('should call client.emit with pattern and message', () => {
      publisher.onModuleInit();
      const message: BaseMessage<{ foo: string }> = {
        eventId: '1',
        timestamp: new Date().toISOString(),
        source: 'test',
        payload: { foo: 'bar' },
      };

      mockClientProxy.emit.mockReturnValue(of(undefined));

      const result = publisher.emit('test_pattern', message);

      expect(mockClientProxy.emit).toHaveBeenCalledWith(
        'test_pattern',
        message,
      );
      let emittedResult;
      result.subscribe((val) => (emittedResult = val));
      expect(emittedResult).toBeUndefined();
    });
  });

  describe('send', () => {
    it('should call client.send with pattern and message and return result', () => {
      publisher.onModuleInit();
      const message: BaseMessage<{ foo: string }> = {
        eventId: '1',
        timestamp: new Date().toISOString(),
        source: 'test',
        payload: { foo: 'bar' },
      };
      const expectedResult = { success: true };

      mockClientProxy.send.mockReturnValue(of(expectedResult));

      const result = publisher.send<{ foo: string }, { success: boolean }>(
        'test_pattern',
        message,
      );

      expect(mockClientProxy.send).toHaveBeenCalledWith(
        'test_pattern',
        message,
      );
      let sentResult;
      result.subscribe((val) => (sentResult = val));
      expect(sentResult).toEqual(expectedResult);
    });
  });
});
