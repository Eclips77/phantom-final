import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WowzaStreamerController } from './wowza-streamer.controller';
import { WowzaStreamerService } from './wowza-streamer.service';
import { LoggerModule } from '@app/logger';
import { StreamingModule } from './streaming/streaming.module';

import { wowzaStreamerConfig } from './config/app.config';
import { wowzaStreamerValidationSchema } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [wowzaStreamerConfig],
      validationSchema: wowzaStreamerValidationSchema,
    }),
    LoggerModule,
    StreamingModule,
  ],
  controllers: [WowzaStreamerController],
  providers: [WowzaStreamerService],
})
export class WowzaStreamerModule {}
