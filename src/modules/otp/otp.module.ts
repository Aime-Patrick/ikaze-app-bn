import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OTP, OTPSchema } from '../../schemas/otp.schema';
import { OTPService } from './otp.service';
import { OTPController } from './otp.controller';
import { MailModule } from '../mail/mail.module';
import { WebSocketModule } from '../webSocket/webSocket.module';
import { User, UserSchema } from 'src/schemas/user.schema';
@Module({
    imports: [
        MongooseModule.forFeature([{ name: OTP.name, schema: OTPSchema },{name:User.name, schema:UserSchema}]),
        MailModule,
        WebSocketModule,
    ],
    providers: [OTPService],
    controllers: [OTPController],
    exports: [OTPService],
})
export class OTPModule {} 