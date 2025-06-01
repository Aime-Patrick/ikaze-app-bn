import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Activity extends Document {
  @Prop({ required: true }) action: string;
  @Prop({ required: true }) user: string;
  @Prop({ required: false, type:Object }) meta?: any; // Optional: for extra info (e.g., placeId, paymentId)
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);