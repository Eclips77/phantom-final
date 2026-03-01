export class CreateVideoDto {
  title: string;
  description?: string;
  duration?: number | string; // ב-form-data מגיע קודם כמחרוזת
  genre: string;
}
