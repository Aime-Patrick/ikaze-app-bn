import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


export enum UserRole {
    SYSTEM_ADMIN = 'system-admin',
    USER = 'user',
  }

  export enum Gender {
    MALE = "Male",
    FEMALE = "Female",
    OTHER = "Other"
  }
  
export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive'
}

@Schema({ timestamps: true }) 
export class User  {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({required: true, type: String,enum: Gender })
  gender: string;

  @Prop({ required: true, unique: true })
  phoneNumber: string;

  @Prop({ required: true })
  password: string;

  @Prop({required: true, enum: UserRole})
    role: string;
  @Prop({required: false})
  profileImage: string;

  @Prop({ required: false, type: Date })
  dateOfBirth: Date;

  @Prop({ 
    type: String, 
    enum: UserStatus, 
    default: UserStatus.ACTIVE 
  })
  status: string;

  @Prop({ 
    type: Boolean, 
    default: false 
  })
  isEmailVerified: boolean;

  @Prop({ 
    type: Date 
  })
  emailVerifiedAt: Date;

  @Prop({ 
    type: Date,
    default: null 
  })
  lastLogin: Date;

  @Prop({ 
    type: [{
      timestamp: Date,
      ip: String,
      device: String,
      platform: String
    }],
    default: []
  })
  loginHistory: Array<{
    timestamp: Date;
    ip: string;
    device: string;
    platform: string;
  }>;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Place' }], default: [] })
  favorites: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Place' }], default: [] })
  visitedPlaces: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
