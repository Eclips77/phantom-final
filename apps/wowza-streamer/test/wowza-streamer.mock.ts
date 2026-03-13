export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
    if (key === 'MONGO_SERVICE_URL') return 'http://mongo-mock:3001';
    if (key === 'WOWZA_URL') return 'http://wowza-mock:1935/vods3/_definst_';
    if (key === 'S3_BUCKET_NAME') return 'mock-bucket';
    return null;
  }),
};

export const mockLoggerService = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};
