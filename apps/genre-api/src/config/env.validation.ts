import * as Joi from 'joi';

export const genreApiValidationSchema = Joi.object({
  PORT: Joi.number().default(3004),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  MONGO_SERVICE_URL: Joi.string().uri().required(),
});
