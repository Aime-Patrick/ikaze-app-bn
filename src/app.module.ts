import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import databaseConfig from './config/database.config';
import { SeedersModule } from './seeders/seeders.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SystemAdminModule } from './modules/system-admin/system-admin.module';
import { PlacesModule } from './modules/places/places.module';
import { OTPModule } from './modules/otp/otp.module';
import { ReviewModule } from './modules/review/review.module';
import { BookingModule } from './modules/booking/booking.module';
import { NotificationModule } from './modules/notification/notification.module';
@Module({
  imports: [
    ConfigModule.forRoot({ load: [databaseConfig] }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
    }),
    AuthModule,
    UsersModule,
    SystemAdminModule,
    PaymentModule,
    SeedersModule,
    PlacesModule,
    OTPModule,
    BookingModule,
    ReviewModule,
    NotificationModule,
    SystemAdminModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
