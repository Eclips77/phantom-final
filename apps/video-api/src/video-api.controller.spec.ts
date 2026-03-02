import { Test, TestingModule } from '@nestjs/testing';
import { VideoApiController } from './video-api.controller';
import { VideoApiService } from './video-api.service';
import { ConfigService } from '@nestjs/config';
import { GenreValidationPipe } from './pipes/genre-validation.pipe';

describe('VideoApiController', () => {
  let videoApiController: VideoApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VideoApiController],
      providers: [
        {
          provide: VideoApiService,
          useValue: {
            processVideoUpload: jest.fn(),
            proxyToMongoService: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    videoApiController = app.get<VideoApiController>(VideoApiController);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(videoApiController).toBeDefined();
    });
  });
});
