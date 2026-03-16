import * as Joi from 'joi';

export const mongoServiceValidationSchema = Joi.object({
  PORT: Joi.number().default(3006),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  MONGODB_URI: Joi.string().uri().required(),
});
