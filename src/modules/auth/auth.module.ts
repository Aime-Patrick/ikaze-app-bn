import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../schemas/user.schema';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { UtilsModule } from '../../utils/utils.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from 'src/guard/jwt.guard';
import { OTP, OTPSchema } from 'src/schemas/otp.schema';
import { MailModule } from '../mail/mail.module';
import { Activity, ActivitySchema } from 'src/schemas/activity.schema';
@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory:  (config : ConfigService) => ({
            secret: config.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '1h' },
        }),
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema },
      { name: OTP.name, schema: OTPSchema },
      { name: Activity.name, schema: ActivitySchema }
    ]),
    UtilsModule,
    MailModule
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
