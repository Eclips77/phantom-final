import { Controller, Get, Param } from '@nestjs/common';
import { StreamingService } from './streaming.service';

@Controller('streaming')
export class StreamingController {
  constructor(private readonly streamingService: StreamingService) {}

  @Get(':id')
  async getStreamingUrl(@Param('id') videoId: string) {
    return this.streamingService.getStreamingUrl(videoId);
  }
}
