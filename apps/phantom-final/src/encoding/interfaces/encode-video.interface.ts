export interface EncodeVideoPayload {
  videoId: string;
  filePath: string;
  fileName: string;
}

export interface EncodeVideoEvent {
  eventId: string;
  timestamp: string;
  source: string;
  payload: EncodeVideoPayload;
}
