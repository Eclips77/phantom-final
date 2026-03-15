import * as Joi from 'joi';

export const wowzaStreamerValidationSchema = Joi.object({
  PORT: Joi.number().default(3003),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  MONGO_SERVICE_URL: Joi.string().uri().required(),
  WOWZA_URL: Joi.string().uri().required(),
  S3_BUCKET_NAME: Joi.string().required(),
});
