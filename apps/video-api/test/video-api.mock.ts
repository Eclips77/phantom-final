import { LoggerService } from '@app/logger';

export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'videoApi.mongoServiceUrl' || key === 'MONGO_SERVICE_URL')
      return 'http://mongo-mock:3000';
    if (key === 'videoApi.uploadDir' || key === 'UPLOAD_DIR')
      return '/tmp/uploads';
    return null;
  }),
};

export const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
} as unknown as jest.Mocked<LoggerService>;

export const mockRabbitMqPublisher = {
  emit: jest.fn(),
  send: jest.fn(),
};

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

export const mockExpressFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'test.mp4',
  encoding: '7bit',
  mimetype: 'video/mp4',
  size: 1024,
  destination: '/tmp/uploads',
  filename: 'test-1234.mp4',
  path: '/tmp/uploads/test-1234.mp4',
  buffer: Buffer.from(''),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  stream: null as any,
};
