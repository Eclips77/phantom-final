import { Test, TestingModule } from '@nestjs/testing';
import '../test/winston.mock';
import { LoggerService } from './logger.service';
import { mockWinstonLogger } from '../test/winston.mock';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log methods', () => {
    const message = 'test message';
    const context = 'TestContext';
    const meta = { extra: 'data' };

    it('should call winston logger.info on log()', () => {
      service.log(message, context, meta);
      expect(mockWinstonLogger.info).toHaveBeenCalledWith(message, {
        context,
        ...meta,
      });
    });

    it('should call winston logger.error on error()', () => {
      const trace = 'error trace';
      service.error(message, trace, context, meta);
      expect(mockWinstonLogger.error).toHaveBeenCalledWith(message, {
        trace,
        context,
        ...meta,
      });
    });

    it('should call winston logger.warn on warn()', () => {
      service.warn(message, context, meta);
      expect(mockWinstonLogger.warn).toHaveBeenCalledWith(message, {
        context,
        ...meta,
      });
    });

    it('should call winston logger.debug on debug()', () => {
      service.debug(message, context, meta);
      expect(mockWinstonLogger.debug).toHaveBeenCalledWith(message, {
        context,
        ...meta,
      });
    });

    it('should call winston logger.verbose on verbose()', () => {
      service.verbose(message, context, meta);
      expect(mockWinstonLogger.verbose).toHaveBeenCalledWith(message, {
        context,
        ...meta,
      });
    });
  });
});
