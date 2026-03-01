export const VideoApiContext = {
  SERVICE: 'VideoApiService',
  CONTROLLER: 'VideoApiController',
  PIPE: 'GenreValidationPipe',
} as const;

export const VideoApiEvent = {
  FILE_SAVED: 'video.file.saved',
  METADATA_SAVED: 'video.metadata.saved',
  ENCODE_QUEUED: 'video.encode.queued',
  UPLOAD_FAILED: 'video.upload.failed',
  PROXY_REQUEST: 'video.proxy.request',
  PROXY_ERROR: 'video.proxy.error',
  GENRE_VALIDATED: 'video.genre.validated',
  GENRE_VALIDATION_FAILED: 'video.genre.validation.failed',
} as const;
