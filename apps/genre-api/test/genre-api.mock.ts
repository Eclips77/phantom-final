import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';

export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    // some places might use genreApi.mongoServiceUrl, some MONGO_SERVICE_URL
    if (key === 'genreApi.mongoServiceUrl' || key === 'MONGO_SERVICE_URL')
      return 'http://mongo-mock:3000';
    return null;
  }),
} as unknown as jest.Mocked<ConfigService>;

export const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
} as unknown as jest.Mocked<LoggerService>;

export const createMockResponse = (
  ok: boolean,
  status: number,
  statusText: string,
  textOrJson: unknown,
  isJson = false,
): Response => {
  const mock: Record<string, unknown> = {
    ok,
    status,
    statusText,
  };

  if (isJson) {
    mock.json = jest.fn().mockResolvedValue(textOrJson);
  } else if (textOrJson instanceof Error) {
    mock.text = jest.fn().mockRejectedValue(textOrJson);
  } else {
    mock.text = jest.fn().mockResolvedValue(textOrJson);
  }

  return mock as unknown as Response;
};
