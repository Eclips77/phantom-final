import { Module } from '@nestjs/common';
import { EncodingController } from './encoding.controller';
import { EncodingService } from './encoding.service';
import { LoggerModule } from '@app/logger';

@Module({
  imports: [LoggerModule],
  controllers: [EncodingController],
  providers: [EncodingService],
  exports: [EncodingService],
})
export class EncodingModule {}
