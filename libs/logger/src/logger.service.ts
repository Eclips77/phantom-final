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
      port: process.env.LOGSTASH_PORT ? parseInt(process.env.LOGSTASH_PORT, 10) : 5000,
      path: process.env.LOGSTASH_PATH || '/',
    });

    httpTransport.on('error', (err) => {
      console.error('[Winston HTTP Transport] Logstash connection error:', err.message || err);
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
        winston.format.json()
      ),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf((info) => {
              const { timestamp, level, message, context, requestId, stack, trace } = info;
              const reqIdStr = requestId ? `[ReqID: ${requestId}] ` : '';
              const ctxStr = context ? `[${context}] ` : '';
              return `${timestamp} ${level}: ${ctxStr}${reqIdStr}${message}${trace || stack ? `\n${trace || stack}` : ''}`;
            }),
          ),
        }),
        httpTransport,
      ],
    });
  }

  log(message: any, context?: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, { context, ...meta });
  }

  error(message: any, trace?: string, context?: string, meta?: Record<string, unknown>): void {
    this.logger.error(message, { trace, context, ...meta });
  }

  warn(message: any, context?: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: any, context?: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: any, context?: string, meta?: Record<string, unknown>): void {
    this.logger.verbose(message, { context, ...meta });
  }
}