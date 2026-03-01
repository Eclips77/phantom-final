import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerService } from '@app/logger'; // assuming mapping exists

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true, 
  });
  
  // אנחנו מורים ל-NestJS להשתמש בשירות הלוגר של וינסטון שיצרנו בצורה גלובלית
  app.useLogger(app.get(LoggerService));
  
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
