import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type VideoDocument = HydratedDocument<Video>;

@Schema({ timestamps: true, versionKey: false })
export class Video {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ trim: true })
  description: string;

  @Prop({ required: true, trim: true, lowercase: true })
  language: string;

  @Prop({ required: true })
  duration: number;

  @Prop({ required: true, trim: true })
  genre: string;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileName: string;

  @Prop({ required: true })
  mimeType: string;
}

export const VideoSchema = SchemaFactory.createForClass(Video);

VideoSchema.index({ title: 'text', description: 'text' });
VideoSchema.index({ genre: 1 });
VideoSchema.index({ language: 1 });
VideoSchema.index({ createdAt: -1 });
