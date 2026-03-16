import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlaylistDocument = Playlist & Document;

@Schema({ timestamps: true })
export class Playlist {
  @Prop({ required: true })
  name: string;

  @Prop()
  author?: string;

  @Prop({ type: [Types.ObjectId], ref: 'Video', default: [] })
  videoIds: Types.ObjectId[];
}

export const PlaylistSchema = SchemaFactory.createForClass(Playlist);
