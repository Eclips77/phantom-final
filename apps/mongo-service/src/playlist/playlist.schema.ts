import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type PlaylistDocument = HydratedDocument<Playlist>;

@Schema({ timestamps: true, versionKey: false })
export class Playlist {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: [String], default: [] })
  videoIds: string[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);

PlaylistSchema.index({ name: 1 });
