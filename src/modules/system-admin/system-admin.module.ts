import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Activity, ActivitySchema } from 'src/schemas/activity.schema';
import { SystemAdminService } from './system-admin.service';
import { SystemAdminController } from './system-admin.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { User, UserSchema } from 'src/schemas/user.schema';
import { PaymentSchema, Payment } from 'src/schemas/payment.schema';
import { Place, PlaceSchema } from 'src/schemas/places.schema';
import { Review, ReviewSchema } from 'src/schemas/review.schema';
@Module({
  imports:[ 
    MongooseModule.forFeature([{name: Payment.name, schema:PaymentSchema},
      { name: User.name, schema: UserSchema },
      { name: Place.name, schema: PlaceSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Review.name, schema: ReviewSchema }
    ]),
    UtilsModule],
  controllers: [SystemAdminController],
  providers: [SystemAdminService]
})
export class SystemAdminModule {}
