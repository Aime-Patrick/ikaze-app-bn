import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './modules/users/users.module';
import databaseConfig from './config/database.config';
import { SeedersModule } from './seeders/seeders.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentModule } from './modules/payment/payment.module';
import { SystemAdminModule } from './modules/system-admin/system-admin.module';
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
