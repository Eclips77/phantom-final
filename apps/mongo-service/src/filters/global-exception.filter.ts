import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { LoggerService } from '@app/logger';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        'unhandled_exception',
        exception instanceof Error ? exception.stack : undefined,
        'GlobalExceptionFilter',
        {
          status,
          method: request.method,
          path: request.path,
          error: exception instanceof Error ? exception.message : String(exception),
        },
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.path,
      message,
    });
  }
}
