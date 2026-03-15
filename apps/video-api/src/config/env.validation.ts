import * as Joi from 'joi';

export const videoApiValidationSchema = Joi.object({
  PORT: Joi.number().default(3001),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  MONGO_SERVICE_URL: Joi.string().uri().required(),
  UPLOAD_DIR: Joi.string().required(),
  RABBITMQ_URL: Joi.string().uri().required(),
  ENCODING_QUEUE: Joi.string().required(),
});
