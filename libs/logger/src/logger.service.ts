import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { loggerContext } from './logger.context';

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const addRequestIdFormat = winston.format((info) => {
      const store = loggerContext.getStore();
      if (store && store.has('requestId')) {
        info.requestId = store.get('requestId');
      }

      return info;
    });

    const httpTransport = new winston.transports.Http({
      host: process.env.LOGSTASH_HOST || 'localhost',
      port: process.env.LOGSTASH_PORT
        ? parseInt(process.env.LOGSTASH_PORT, 10)
        : 5000,
      path: process.env.LOGSTASH_PATH || '/',
    });

    httpTransport.on('error', (err) => {
      console.error(
        '[Winston HTTP Transport] Logstash connection error:',
        err.message || err,
      );
    });

    httpTransport.on('warn', (err) => {
      console.warn('[Winston HTTP Transport] Logstash warning:', err);
    });

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        addRequestIdFormat(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf((info) => {
              const {
                timestamp,
                level,
                message,
                context,
                requestId,
                stack,
                trace,
              } = info;
              const reqIdStr = requestId
                ? `[ReqID: ${typeof requestId === 'object' ? JSON.stringify(requestId) : (requestId as string)}] `
                : '';
              const ctxStr = context
                ? `[${typeof context === 'object' ? JSON.stringify(context) : (context as string)}] `
                : '';
              const msgStr =
                typeof message === 'object'
                  ? JSON.stringify(message)
                  : (message as string);
              const stackStr =
                trace || stack
                  ? `\n${typeof (trace || stack) === 'object' ? JSON.stringify(trace || stack) : ((trace || stack) as string)}`
                  : '';
              return `${timestamp as string} ${level}: ${ctxStr}${reqIdStr}${msgStr}${stackStr}`;
            }),
          ),
        }),
        httpTransport,
      ],
    });
  }

  log(
    message: unknown,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.info(message as string, { context, ...meta });
  }

  error(
    message: unknown,
    trace?: string,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.error(message as string, { trace, context, ...meta });
  }

  warn(
    message: unknown,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.warn(message as string, { context, ...meta });
  }

  debug(
    message: unknown,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.debug(message as string, { context, ...meta });
  }

  verbose(
    message: unknown,
    context?: string,
    meta?: Record<string, unknown>,
  ): void {
    this.logger.verbose(message as string, { context, ...meta });
  }
}
