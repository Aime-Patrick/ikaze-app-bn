import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Place', required: true })
  place: Types.ObjectId;

  @Prop({ required: true , type: String, enum: BookingStatus, default: BookingStatus.PENDING })
  status: string; // e.g., 'pending', 'confirmed', 'cancelled'

  @Prop({ required: true })
  bookingDate: Date; // The date/time the booking is for

  @Prop()
  guests?: number; // Optional: number of guests

  @Prop()
  notes?: string; // Optional: user notes or special requests

  @Prop()
  paymentId?: string; // Optional: reference to payment transaction

}

export const BookingSchema = SchemaFactory.createForClass(Booking);