export const mockWinstonLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

export const mockCreateLogger = jest.fn().mockReturnValue(mockWinstonLogger);

export const mockFormat = {
  combine: jest.fn().mockReturnValue(jest.fn()),
  timestamp: jest.fn().mockReturnValue(jest.fn()),
  errors: jest.fn().mockReturnValue(jest.fn()),
  json: jest.fn().mockReturnValue(jest.fn()),
  colorize: jest.fn().mockReturnValue(jest.fn()),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  printf: jest.fn().mockImplementation((fn: any) => fn),
};

export const mockHttpTransport = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
}));

export const mockConsoleTransport = jest.fn().mockImplementation(() => ({
  on: jest.fn(),
}));

jest.mock('winston', () => ({
  createLogger: mockCreateLogger,
  format: Object.assign(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    jest.fn().mockImplementation((fn: any) => fn),
    mockFormat,
  ),
  transports: {
    Http: mockHttpTransport,
    Console: mockConsoleTransport,
  },
}));
