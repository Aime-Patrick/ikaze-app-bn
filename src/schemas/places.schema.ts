import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

enum PlaceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
@Schema({ timestamps: true })
export class Place  {
  @Prop({ required: true , type: [String] })
  images: string[];

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  category: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  price: string;

  @Prop({ default: 'descriotion of place' })
  description: string;

  @Prop({ default: 0 })
  bookings: number;

  @Prop({ default: 0 })
  favorites: number;

  @Prop({ default: 0 })
  visits: number;

  @Prop({type: String, enum: PlaceStatus, default: PlaceStatus.ACTIVE })
  status: string;

}

export const PlaceSchema = SchemaFactory.createForClass(Place);

PlaceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'place',
});

PlaceSchema.set('toObject', { virtuals: true });
PlaceSchema.set('toJSON', { virtuals: true });