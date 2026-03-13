export const mockClientProxy = {
  emit: jest.fn(),
  send: jest.fn(),
};

export const mockClientProxyFactory = {
  create: jest.fn().mockReturnValue(mockClientProxy),
};

export const mockRabbitMqOptions = {
  url: 'amqp://mockhost:5672',
  queue: 'mock_queue',
  durable: true,
};

jest.mock('@nestjs/microservices', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const originalModule = jest.requireActual('@nestjs/microservices');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...originalModule,
    ClientProxyFactory: mockClientProxyFactory,
  };
});
