import { Module } from '@nestjs/common';
import { EncodingController } from './encoding.controller';
import { EncodingService } from './encoding.service';
import { LoggerModule } from '@app/logger';
import { S3Module } from '../s3/s3.module';

@Module({
  imports: [LoggerModule, S3Module],
  controllers: [EncodingController],
  providers: [EncodingService],
  exports: [EncodingService],
})
export class EncodingModule {}
