import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LoggerMiddleware } from './logger.middleware';

@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
