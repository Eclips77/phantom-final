import { Test, TestingModule } from '@nestjs/testing';
import { WowzaStreamerController } from './wowza-streamer.controller';
import { WowzaStreamerService } from './wowza-streamer.service';

describe('WowzaStreamerController', () => {
  let wowzaStreamerController: WowzaStreamerController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [WowzaStreamerController],
      providers: [WowzaStreamerService],
    }).compile();

    wowzaStreamerController = app.get<WowzaStreamerController>(
      WowzaStreamerController,
    );
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(wowzaStreamerController.getHello()).toBe('Hello World!');
    });
  });
});
