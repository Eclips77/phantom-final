export const TranscoderContext = {
  SERVICE: 'EncodingService',
  CONTROLLER: 'EncodingController',
} as const;

export const TranscoderEvent = {
  ENCODE_JOB_RECEIVED: 'transcoder.encode.received',
  ENCODE_STARTED: 'transcoder.encode.started',
  ENCODE_COMPLETED: 'transcoder.encode.completed',
  ENCODE_FAILED: 'transcoder.encode.failed',
  UPLOAD_JOB_QUEUED: 'transcoder.upload.queued',
} as const;
