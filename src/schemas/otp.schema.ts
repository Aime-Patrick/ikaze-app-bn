import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OTP extends Document {
    @Prop({ required: true })
    code: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION';

    @Prop({ required: true })
    expiresAt: Date;

    @Prop({ default: false })
    isUsed: boolean;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop()
    platform: 'mobile' | 'web';
}

export const OTPSchema = SchemaFactory.createForClass(OTP); 