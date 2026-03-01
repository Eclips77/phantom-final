import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/logger';
import { PlaylistApiController } from './playlist-api.controller';
import { PlaylistApiService } from './playlist-api.service';
import { playlistApiConfig } from './config/playlist-api.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [playlistApiConfig],
    }),
    LoggerModule,
  ],
  controllers: [PlaylistApiController],
  providers: [PlaylistApiService],
})
export class PlaylistApiModule {}
