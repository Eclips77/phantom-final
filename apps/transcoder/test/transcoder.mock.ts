export const mockTranscoderConfig = {
  port: 3002,
  logLevel: 'info',
  rabbitMq: {
    url: 'amqp://localhost:5672',
    encodingQueue: 'test_queue',
  },
  s3: {
    bucketName: 'mock-bucket',
    region: 'us-east-1',
    endpoint: 'http://minio:9000',
    accessKeyId: 'minioadmin',
    secretAccessKey: 'minioadmin',
  },
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
