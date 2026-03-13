import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '@app/logger';
import { StreamingService } from './streaming.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

describe('StreamingService', () => {
  let service: StreamingService;
  let configServiceMock: jest.Mocked<ConfigService>;
  let loggerServiceMock: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    configServiceMock = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'MONGO_SERVICE_URL') return 'http://mongo-mock:3001';
        if (key === 'WOWZA_URL')
          return 'http://wowza-mock:1935/vods3/_definst_';
        if (key === 'S3_BUCKET_NAME') return 'mock-bucket';
        return null;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    loggerServiceMock = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<LoggerService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreamingService,
        {
          provide: ConfigService,
          useValue: configServiceMock,
        },
        {
          provide: LoggerService,
          useValue: loggerServiceMock,
        },
      ],
    }).compile();

    service = module.get<StreamingService>(StreamingService);

    // Mock global fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStreamingUrl', () => {
    it('should successfully return a Wowza streaming URL', async () => {
      const mockVideoId = '12345';
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          filePath: '/uploads/my-video.mp4',
          fileName: 'my-video.mp4',
        }),
      } as unknown as Response;

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.getStreamingUrl(mockVideoId);

      // Verify fetch call
      expect(global.fetch).toHaveBeenCalledWith(
        `http://mongo-mock:3001/videos/${mockVideoId}`,
      );

      // Verify returned URL construction
      const expectedUrl =
        'http://wowza-mock:1935/vods3/_definst_/mp4:amazonS3/mock-bucket/my-video.mp4/playlist.m3u8';
      expect(result).toEqual({ url: expectedUrl });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerServiceMock.log).toHaveBeenCalledWith(
        'STREAMING_URL_GENERATED',
        'StreamingService',
        expect.objectContaining({
          videoId: mockVideoId,
          streamUrl: expectedUrl,
        }),
      );
    });

    it('should throw NotFoundException if Mongo returns 404', async () => {
      const mockVideoId = 'not-found-id';
      const mockResponse = {
        ok: false,
        status: 404,
      } as unknown as Response;

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.getStreamingUrl(mockVideoId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException if Mongo fetch fails', async () => {
      const mockVideoId = 'error-id';
      const mockResponse = {
        ok: false,
        status: 500,
      } as unknown as Response;

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.getStreamingUrl(mockVideoId)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should throw InternalServerErrorException if video metadata is missing filePath/fileName', async () => {
      const mockVideoId = 'missing-data-id';
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          _id: mockVideoId,
        }), // missing filePath and fileName
      } as unknown as Response;

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(service.getStreamingUrl(mockVideoId)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getStreamingUrl(mockVideoId)).rejects.toThrow(
        'Incomplete video metadata for streaming',
      );
    });

    it('should log error and throw InternalServerErrorException on fetch network error', async () => {
      const mockVideoId = 'network-error-id';
      const mockError = new Error('Network failure');

      (global.fetch as jest.Mock).mockRejectedValue(mockError);

      await expect(service.getStreamingUrl(mockVideoId)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.getStreamingUrl(mockVideoId)).rejects.toThrow(
        'Failed to retrieve streaming url',
      );

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(loggerServiceMock.error).toHaveBeenCalledWith(
        'STREAMING_URL_ERROR',
        mockError.stack,
        'StreamingService',
        expect.objectContaining({
          videoId: mockVideoId,
          error: mockError.message,
        }),
      );
    });
  });
});
