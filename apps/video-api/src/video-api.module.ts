import { Module } from '@nestjs/common';
import { VideoApiController } from './video-api.controller';
import { VideoApiService } from './video-api.service';

@Module({
  imports: [],
  controllers: [VideoApiController],
  providers: [VideoApiService],
})
export class VideoApiModule {}
