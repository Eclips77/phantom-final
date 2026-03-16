import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { mongoServiceConfig } from './config/app.config';
import { mongoServiceValidationSchema } from './config/env.validation';
import { VideosModule } from './videos/videos.module';
import { GenresModule } from './genres/genres.module';
import { PlaylistsModule } from './playlists/playlists.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [mongoServiceConfig],
      validationSchema: mongoServiceValidationSchema,
    }),
    MongooseModule.forRootAsync({
      inject: [mongoServiceConfig.KEY],
      useFactory: (config: ConfigType<typeof mongoServiceConfig>) => ({
        uri: config.mongoDbUri,
      }),
    }),
    VideosModule,
    GenresModule,
    PlaylistsModule,
  ],
  controllers: [],
  providers: [],
})
export class MongoServiceModule {}
