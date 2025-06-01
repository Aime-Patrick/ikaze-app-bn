import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { PaymentStatus } from '../modules/payment/enums/payment-status.enum';
import { PaymentMethod } from '../modules/payment/enums/payment-method.enum';

@Schema({ timestamps: true })
export class Payment extends Document {
    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    currency: string;

    @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
    status: PaymentStatus;

    @Prop({ type: String, enum: PaymentMethod, required: true })
    method: PaymentMethod;

    @Prop()
    paymentIntentId?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop()
    description?: string;

    @Prop()
    receiptUrl?: string;

    @Prop({ type: Object }) // 👈 Fixed
    metadata?: Record<string, any>;
}


export const PaymentSchema = SchemaFactory.createForClass(Payment);