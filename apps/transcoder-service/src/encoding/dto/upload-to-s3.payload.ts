export interface UploadToS3Payload {
  videoId: string;
  originalPath: string;
  encodedPath: string;
  encodedFileName: string;
}
