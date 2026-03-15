import * as Joi from 'joi';

export const playlistApiValidationSchema = Joi.object({
  PORT: Joi.number().default(3005),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  MONGO_SERVICE_URL: Joi.string().uri().required(),
  VIDEO_SERVICE_URL: Joi.string().uri().required(),
});
