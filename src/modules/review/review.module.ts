import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Review, ReviewSchema } from 'src/schemas/review.schema';
import { Place, PlaceSchema } from 'src/schemas/places.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { WebSocketModule } from '../webSocket/webSocket.module';
import { Notification, NotificationSchema } from 'src/schemas/notification.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Review.name, schema: ReviewSchema },
      { name: Place.name, schema: PlaceSchema },
      { name: User.name, schema: UserSchema },
        { name: Notification.name, schema: NotificationSchema },
    ]),
    WebSocketModule,
  ],
  providers: [ReviewService],
  controllers: [ReviewController],
})
export class ReviewModule {}