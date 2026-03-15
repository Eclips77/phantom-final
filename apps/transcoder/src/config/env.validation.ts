import * as Joi from 'joi';

export const transcoderValidationSchema = Joi.object({
  PORT: Joi.number().default(3002),
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug', 'verbose')
    .default('info'),
  RABBITMQ_URL: Joi.string().uri().required(),
  ENCODING_QUEUE: Joi.string().required(),
  S3_BUCKET_NAME: Joi.string().required(),
  AWS_REGION: Joi.string().required(),
  S3_ENDPOINT: Joi.string().uri().required(),
  AWS_ACCESS_KEY_ID: Joi.string().required(),
  AWS_SECRET_ACCESS_KEY: Joi.string().required(),
});
