import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@app/logger';
import { EncodeVideoEvent } from './interfaces/encode-video.interface';
import { InternalServerErrorException } from '@nestjs/common';
import { EncodingEvent, EncodingContext } from './constants/log-events';
import * as path from 'path';

const mockFfmpegChain = {
  output: jest.fn().mockReturnThis(),
  videoCodec: jest.fn().mockReturnThis(),
  audioCodec: jest.fn().mockReturnThis(),
  format: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  run: jest.fn(),
};

const mockFfmpeg = jest.fn(() => mockFfmpegChain) as unknown as Record<
  string,
  unknown
>;
mockFfmpeg.setFfmpegPath = jest.fn();

jest.mock('fluent-ffmpeg', () => mockFfmpeg);

jest.mock('@ffmpeg-installer/ffmpeg', () => ({
  path: '/mock/path/to/ffmpeg',
  default: { path: '/mock/path/to/ffmpeg' },
}));

import { EncodingService } from './encoding.service';

describe('EncodingService', () => {
  let service: EncodingService;
  let loggerServiceMock: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    loggerServiceMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    // reset mocks inside chain
    mockFfmpegChain.output.mockClear();
    mockFfmpegChain.output.mockReturnThis();
    mockFfmpegChain.videoCodec.mockClear();
    mockFfmpegChain.videoCodec.mockReturnThis();
    mockFfmpegChain.audioCodec.mockClear();
    mockFfmpegChain.audioCodec.mockReturnThis();
    mockFfmpegChain.format.mockClear();
    mockFfmpegChain.format.mockReturnThis();
    mockFfmpegChain.on.mockClear();
    mockFfmpegChain.on.mockReturnThis();
    mockFfmpegChain.run.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncodingService,
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
      ],
    }).compile();

    service = module.get<EncodingService>(EncodingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encodeVideo', () => {
    const mockEvent: EncodeVideoEvent = {
      eventId: 'test-event-id',
      timestamp: '2023-01-01T00:00:00Z',
      source: 'test-source',
      payload: {
        videoId: 'test-video-id',
        filePath: '/uploads/test-video.avi',
        fileName: 'test-video.avi',
      },
    };

    it('should encode video successfully', async () => {
      let runCallback: (() => void) | null = null;
      let progressCallback: ((progress: { percent: number }) => void) | null =
        null;

      mockFfmpegChain.on.mockImplementation(
        (event: string, callback: (...args: unknown[]) => void) => {
          if (event === 'end') {
            runCallback = callback as () => void;
          } else if (event === 'progress') {
            progressCallback = callback as (progress: {
              percent: number;
            }) => void;
          }
          return mockFfmpegChain;
        },
      );

      mockFfmpegChain.run.mockImplementation(() => {
        if (progressCallback) {
          progressCallback({ percent: 50 });
        }
        if (runCallback) {
          runCallback();
        }
      });

      const parsedPath = path.parse(mockEvent.payload.filePath);
      const expectedOutputPath = path.join(
        parsedPath.dir,
        `${parsedPath.name}_encoded.mp4`,
      );

      await expect(service.encodeVideo(mockEvent)).resolves.toBeUndefined();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerServiceMock.log).toHaveBeenCalledWith(
        EncodingEvent.ENCODING_STARTED,
        EncodingContext.SERVICE,
        expect.objectContaining({
          videoId: mockEvent.payload.videoId,
          eventId: mockEvent.eventId,
          filePath: mockEvent.payload.filePath,
        }),
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerServiceMock.log).toHaveBeenCalledWith(
        EncodingEvent.ENCODING_PROGRESS,
        EncodingContext.SERVICE,
        expect.objectContaining({
          videoId: mockEvent.payload.videoId,
          percent: 50,
        }),
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerServiceMock.log).toHaveBeenCalledWith(
        EncodingEvent.ENCODING_COMPLETED,
        EncodingContext.SERVICE,
        expect.objectContaining({
          videoId: mockEvent.payload.videoId,
          eventId: mockEvent.eventId,
          originalFilePath: mockEvent.payload.filePath,
          outputPath: expectedOutputPath,
        }),
      );

      expect(mockFfmpegChain.output).toHaveBeenCalledWith(expectedOutputPath);
      expect(mockFfmpegChain.videoCodec).toHaveBeenCalledWith('libx264');
      expect(mockFfmpegChain.audioCodec).toHaveBeenCalledWith('aac');
      expect(mockFfmpegChain.format).toHaveBeenCalledWith('mp4');
      expect(mockFfmpegChain.run).toHaveBeenCalled();
    });

    it('should handle encoding failure and throw InternalServerErrorException', async () => {
      const mockError = new Error('FFmpeg error');
      let errorCallback: ((error: Error) => void) | null = null;

      mockFfmpegChain.on.mockImplementation(
        (event: string, callback: (...args: unknown[]) => void) => {
          if (event === 'error') {
            errorCallback = callback as (error: Error) => void;
          }
          return mockFfmpegChain;
        },
      );

      mockFfmpegChain.run.mockImplementation(() => {
        if (errorCallback) {
          errorCallback(mockError);
        }
      });

      await expect(service.encodeVideo(mockEvent)).rejects.toThrow(
        InternalServerErrorException,
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerServiceMock.error).toHaveBeenCalledWith(
        EncodingEvent.ENCODING_FAILED,
        mockError.stack,
        EncodingContext.SERVICE,
        expect.objectContaining({
          videoId: mockEvent.payload.videoId,
          eventId: mockEvent.eventId,
          error: mockError.message,
        }),
      );
    });
  });
});
