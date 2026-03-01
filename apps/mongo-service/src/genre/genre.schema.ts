import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type GenreDocument = HydratedDocument<Genre>;

@Schema({ timestamps: true, versionKey: false })
export class Genre {
  @Prop({ required: true, trim: true, unique: true })
  name: string;

  @Prop({ type: [String], default: [] })
  videoIds: string[];
}

export const GenreSchema = SchemaFactory.createForClass(Genre);

GenreSchema.index({ name: 1 }, { unique: true });
