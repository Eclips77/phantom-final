import { LoggerMiddleware } from './logger.middleware';
import { loggerContext } from './logger.context';
import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';

jest.mock('crypto', () => {
  const originalCrypto = jest.requireActual('crypto');
  return {
    ...originalCrypto,
    randomUUID: jest.fn(() => 'mocked-uuid'),
  };
});

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should use x-request-id header if provided', () => {
    mockRequest.headers = { 'x-request-id': 'test-request-id' };

    let storeFromNext: Map<string, string> | undefined;
    nextFunction = jest.fn(() => {
      storeFromNext = loggerContext.getStore();
    });

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(storeFromNext).toBeDefined();
    expect(storeFromNext?.get('requestId')).toBe('test-request-id');
    expect(crypto.randomUUID).not.toHaveBeenCalled();
  });

  it('should use x-correlation-id header if provided and x-request-id is absent', () => {
    mockRequest.headers = { 'x-correlation-id': 'test-correlation-id' };

    let storeFromNext: Map<string, string> | undefined;
    nextFunction = jest.fn(() => {
      storeFromNext = loggerContext.getStore();
    });

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(storeFromNext).toBeDefined();
    expect(storeFromNext?.get('requestId')).toBe('test-correlation-id');
    expect(crypto.randomUUID).not.toHaveBeenCalled();
  });

  it('should generate a randomUUID if neither x-request-id nor x-correlation-id is provided', () => {
    let storeFromNext: Map<string, string> | undefined;
    nextFunction = jest.fn(() => {
      storeFromNext = loggerContext.getStore();
    });

    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(crypto.randomUUID).toHaveBeenCalled();
    expect(storeFromNext).toBeDefined();
    expect(storeFromNext?.get('requestId')).toBe('mocked-uuid');
  });
});
