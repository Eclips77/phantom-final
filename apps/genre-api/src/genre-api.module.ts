import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '@app/logger';
import { GenreApiController } from './genre-api.controller';
import { GenreApiService } from './genre-api.service';
import { genreApiConfig } from './config/genre-api.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [genreApiConfig],
    }),
    LoggerModule,
  ],
  controllers: [GenreApiController],
  providers: [GenreApiService],
})
export class GenreApiModule {}
