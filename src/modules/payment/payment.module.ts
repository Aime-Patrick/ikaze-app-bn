import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { Payment,PaymentSchema } from 'src/schemas/payment.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentController } from './payment.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { Activity, ActivitySchema } from 'src/schemas/activity.schema';
import { Booking, BookingSchema } from 'src/schemas/booking.schema';
@Module({
  imports:[
    UtilsModule,
    MongooseModule.forFeature([{name: Payment.name, schema:PaymentSchema},
      { name: Activity.name, schema: ActivitySchema },
      { name: Booking.name, schema: BookingSchema }
    ])
  ],
  providers: [PaymentService],
  controllers:[PaymentController]
})
export class PaymentModule {}
