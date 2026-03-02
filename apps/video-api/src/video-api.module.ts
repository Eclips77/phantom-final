import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { VideoApiController } from './video-api.controller';
import { VideoApiService } from './video-api.service';
import { RabbitMqModule } from '@app/rabbit-mq';
import { LoggerModule } from '@app/logger';
import { GenreValidationPipe } from './pipes/genre-validation.pipe';
import { videoApiConfig } from './config/video-api.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [videoApiConfig],
    }),
    LoggerModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uploadDir = config.get<string>('videoApi.uploadDir')!;
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        return {
          storage: diskStorage({
            destination: uploadDir,
            filename: (_req, file, callback) => {
              const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
              callback(
                null,
                `${file.fieldname}-${uniqueSuffix}${extname(file.originalname)}`,
              );
            },
          }),
        };
      },
    }),
    RabbitMqModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        url: config.get<string>('videoApi.rabbitMq.url')!,
        queue: config.get<string>('videoApi.rabbitMq.encodingQueue')!,
        durable: false,
      }),
    }),
  ],
  controllers: [VideoApiController],
  providers: [VideoApiService, GenreValidationPipe],
})
export class VideoApiModule {}
