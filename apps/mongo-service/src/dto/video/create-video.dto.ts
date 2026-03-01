export class CreateVideoDto {
  title: string;
  description?: string;
  language: string;
  duration: number;
  genre: string;
  filePath: string;
  fileName: string;
  mimeType: string;
}
