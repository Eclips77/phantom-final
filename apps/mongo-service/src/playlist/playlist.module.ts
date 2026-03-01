import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Playlist, PlaylistSchema } from './playlist.schema';
import { PlaylistService } from './playlist.service';
import { PlaylistController } from './playlist.controller';
import { LoggerModule } from '@app/logger';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Playlist.name, schema: PlaylistSchema }]),
    LoggerModule,
  ],
  controllers: [PlaylistController],
  providers: [PlaylistService],
  exports: [PlaylistService],
})
export class PlaylistModule {}
