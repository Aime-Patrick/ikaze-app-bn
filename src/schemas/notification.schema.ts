import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ required: true })
  message: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  user?: Types.ObjectId; // recipient (optional, for user-specific notifications)

  @Prop({ default: false })
  read: boolean;

  @Prop({ default: 'info' })
  type: string; // e.g., 'info', 'review', 'booking', etc.
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);