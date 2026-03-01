export class SearchVideoDto {
  title?: string;
  language?: string;
  genre?: string;
  minDuration?: number;
  maxDuration?: number;
  uploadedFrom?: string;
  uploadedTo?: string;
  page?: number;
  limit?: number;
}
