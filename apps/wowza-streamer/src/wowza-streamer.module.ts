import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WowzaStreamerController } from './wowza-streamer.controller';
import { WowzaStreamerService } from './wowza-streamer.service';
import { LoggerModule } from '@app/logger';
import { StreamingModule } from './streaming/streaming.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    StreamingModule,
  ],
  controllers: [WowzaStreamerController],
  providers: [WowzaStreamerService],
})
export class WowzaStreamerModule {}
