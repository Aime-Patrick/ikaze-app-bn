/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {MongooseModule} from '@nestjs/mongoose';
import databaseConfig from './config/database.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGODB_URL'),
        };
      },
      inject: [ConfigService],
    }),

  ],
  providers: [],
})
export class AppModule {}
