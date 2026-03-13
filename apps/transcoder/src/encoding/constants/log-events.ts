export enum EncodingEvent {
  ENCODING_STARTED = 'ENCODING_STARTED',
  ENCODING_PROGRESS = 'ENCODING_PROGRESS',
  ENCODING_COMPLETED = 'ENCODING_COMPLETED',
  ENCODING_FAILED = 'ENCODING_FAILED',
}

export enum EncodingContext {
  SERVICE = 'EncodingService',
  CONTROLLER = 'EncodingController',
}
