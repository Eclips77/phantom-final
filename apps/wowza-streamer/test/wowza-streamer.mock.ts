export const mockWowzaStreamerConfig = {
  port: 3003,
  logLevel: 'info',
  mongoServiceUrl: 'http://mongo-mock:3001',
  wowzaUrl: 'http://wowza-mock:1935/vods3/_definst_',
  s3BucketName: 'mock-bucket',
};

export const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};
