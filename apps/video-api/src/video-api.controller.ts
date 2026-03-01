import { Controller, Get } from '@nestjs/common';
import { VideoApiService } from './video-api.service';

@Controller()
export class VideoApiController {
  constructor(private readonly videoApiService: VideoApiService) {}

  @Get()
  getHello(): string {
    return this.videoApiService.getHello();
  }
}
