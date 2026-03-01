import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from '@app/logger';
import { VideoModule } from './video/video.module';
import { GenreModule } from './genre/genre.module';
import { PlaylistModule } from './playlist/playlist.module';
import { mongoServiceConfig } from './config/mongo-service.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongoServiceConfig],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('mongoService.mongoUri')!,
      }),
    }),
    LoggerModule,
    VideoModule,
    GenreModule,
    PlaylistModule,
  ],
})
export class MongoServiceModule {}
