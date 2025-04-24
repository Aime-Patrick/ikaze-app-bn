import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


export enum UserRole {
    SYSTEM_ADMIN = 'system-admin',
    USER = 'user',
  }

  export enum Gender {
    MALE = "Male",
    FEMALE = "Female",
    OTHER = "Other"
  }
  

@Schema({ timestamps: true }) 
export class User {
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

}

export const UserSchema = SchemaFactory.createForClass(User);
