import { Test, TestingModule } from '@nestjs/testing';
import { VideoApiController } from './video-api.controller';
import { VideoApiService } from './video-api.service';

describe('VideoApiController', () => {
  let videoApiController: VideoApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VideoApiController],
      providers: [VideoApiService],
    }).compile();

    videoApiController = app.get<VideoApiController>(VideoApiController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(videoApiController.getHello()).toBe('Hello World!');
    });
  });
});
