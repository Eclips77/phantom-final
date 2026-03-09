import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Video, VideoSchema } from './video.schema';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { VideoQueryResolver } from './query/video-query.resolver';
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Video.name, schema: VideoSchema }]),
    LoggerModule,
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoQueryResolver],
  exports: [VideoService],
})
export class VideoModule {}
