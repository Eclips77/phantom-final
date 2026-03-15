import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@app/logger';
import { S3Service } from '../s3/s3.service';
import { EncodingService } from './encoding.service';
import type { EncodeVideoEvent } from './interfaces/encode-video.interface';
import { InternalServerErrorException } from '@nestjs/common';
import { EncodingEvent, EncodingContext } from './constants/log-events';
import * as path from 'path';
import * as fs from 'fs';
import {
  mockTranscoderConfig,
  mockLoggerService,
  mockS3Service,
  mockFfmpegChain,
} from '../../test/transcoder.mock';

jest.mock('fs', () => ({
  unlinkSync: jest.fn(),
}));

jest.mock('fluent-ffmpeg', () => {
  const m = jest.fn(() => mockFfmpegChain) as unknown as Record<
    string,
    unknown
  >;
  m.setFfmpegPath = jest.fn();
  return m;
});

jest.mock('@ffmpeg-installer/ffmpeg', () => ({
  path: '/mock/path/to/ffmpeg',
  default: { path: '/mock/path/to/ffmpeg' },
}));

describe('EncodingService', () => {
  let service: EncodingService;

  beforeEach(async () => {
    // reset mocks inside chain
    mockFfmpegChain.output.mockClear().mockReturnThis();
    mockFfmpegChain.videoCodec.mockClear().mockReturnThis();
    mockFfmpegChain.audioCodec.mockClear().mockReturnThis();
    mockFfmpegChain.format.mockClear().mockReturnThis();
    mockFfmpegChain.on.mockClear().mockReturnThis();
    mockFfmpegChain.run.mockClear();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EncodingService,
        { provide: LoggerService, useValue: mockLoggerService },
        {
          provide: 'CONFIGURATION(transcoder)',
          useValue: mockTranscoderConfig,
        },
        { provide: S3Service, useValue: mockS3Service },
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

    it('should encode video successfully and upload to S3', async () => {
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

      // Verify S3 Upload

      expect(mockS3Service.uploadFile).toHaveBeenCalledWith(
        expectedOutputPath,
        'mock-bucket',
        `test-video-id/${path.basename(expectedOutputPath)}`,
      );

      // Verify unlinking

      expect(fs.unlinkSync).toHaveBeenCalledWith(expectedOutputPath);
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

      expect(mockLoggerService.error).toHaveBeenCalledWith(
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
