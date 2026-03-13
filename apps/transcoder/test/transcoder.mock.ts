export const mockConfigService = {
  get: jest.fn().mockImplementation((key: string) => {
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

export const mockS3Service = {
  uploadFile: jest.fn().mockResolvedValue(undefined),
};

export const mockFfmpegChain = {
  output: jest.fn().mockReturnThis(),
  videoCodec: jest.fn().mockReturnThis(),
  audioCodec: jest.fn().mockReturnThis(),
  format: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  run: jest.fn(),
};
