import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from '@app/logger';
import { EncodingModule } from './encoding/encoding.module';

import { transcoderConfig } from './config/app.config';
import { transcoderValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [transcoderConfig],
      validationSchema: transcoderValidationSchema,
    }),
    LoggerModule,
    EncodingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
