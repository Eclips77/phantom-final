import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { VideoApiController } from './video-api.controller';
import { VideoApiService } from './video-api.service';
import { RabbitMqModule } from '@app/rabbit-mq';
import { LoggerModule } from '@app/logger';
import { GenreValidationPipe } from './pipes/genre-validation.pipe';
import { videoApiConfig } from './config/app.config';
import { videoApiValidationSchema } from './config/env.validation';
import { ConfigType } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [videoApiConfig],
      validationSchema: videoApiValidationSchema,
    }),
    LoggerModule,
    MulterModule.registerAsync({
      inject: [videoApiConfig.KEY],
      useFactory: (config: ConfigType<typeof videoApiConfig>) => {
        const uploadDir = config.uploadDir;
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
      inject: [videoApiConfig.KEY],
      useFactory: (config: ConfigType<typeof videoApiConfig>) => ({
        url: config.rabbitMq.url,
        queue: config.rabbitMq.encodingQueue,
        durable: false,
      }),
    }),
  ],
  controllers: [VideoApiController],
  providers: [VideoApiService, GenreValidationPipe],
})
export class VideoApiModule {}
