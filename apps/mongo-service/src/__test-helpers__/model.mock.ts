import { jest } from '@jest/globals';

export interface ChainableMock {
  sort: jest.Mock;
  skip: jest.Mock;
  limit: jest.Mock;
  lean: jest.Mock;
  exec: jest.Mock;
}

export const createChainableMock = (resolveValue: unknown): ChainableMock => {
  const mock: Partial<ChainableMock> = {};

  mock.exec = jest.fn().mockResolvedValue(resolveValue);
  mock.lean = jest.fn().mockReturnValue(mock);
  mock.limit = jest.fn().mockReturnValue(mock);
  mock.skip = jest.fn().mockReturnValue(mock);
  mock.sort = jest.fn().mockReturnValue(mock);

  return mock as ChainableMock;
};

export const createExecMock = (resolveValue: unknown) => ({
  exec: jest.fn().mockResolvedValue(resolveValue),
});

export const createModelMock = () => ({
  create: jest.fn() as jest.Mock<any>,
  find: jest.fn() as jest.Mock<any>,
  findById: jest.fn() as jest.Mock<any>,
  findByIdAndUpdate: jest.fn() as jest.Mock<any>,
  findByIdAndDelete: jest.fn() as jest.Mock<any>,
  countDocuments: jest.fn() as jest.Mock<any>,
  exists: jest.fn() as jest.Mock<any>,
});

export const createLoggerMock = () => ({
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
});
