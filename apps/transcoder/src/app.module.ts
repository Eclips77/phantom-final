import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from '@app/logger';
import { EncodingModule } from './encoding/encoding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule,
    EncodingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
