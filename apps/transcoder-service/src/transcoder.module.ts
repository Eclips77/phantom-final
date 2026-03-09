import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { transcoderConfig } from './config/transcoder.config';
import { EncodingModule } from './encoding/encoding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [transcoderConfig],
    }),
    EncodingModule,
  ],
})
export class TranscoderModule {}
