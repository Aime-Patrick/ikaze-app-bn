import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review } from 'src/schemas/review.schema';
import { Place } from 'src/schemas/places.schema';
import { User } from 'src/schemas/user.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { Notification } from 'src/schemas/notification.schema';
import { AppWebSocketGateway } from '../webSocket/webSocket.gateway';
@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<Review>,
    @InjectModel(Place.name) private placeModel: Model<Place>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private readonly websocketGateway: AppWebSocketGateway,

  ) {}

  async createReview(createReviewDto: CreateReviewDto, userId: string) {
    const place = await this.placeModel.findById(createReviewDto.placeId);
    if (!place) throw new NotFoundException('Place not found');
    if (
      createReviewDto.rating === undefined ||
      createReviewDto.rating < 1 ||
      createReviewDto.rating > 5
    ) {
      throw new NotFoundException('Rating must be between 1 and 5');
    }
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const review = new this.reviewModel({
      place: new Types.ObjectId(createReviewDto.placeId),
      user: new Types.ObjectId(userId),
      comment: createReviewDto.comment,
      rating: createReviewDto.rating,
    });
    await review.save();

    // Find all system admins
    const admins = await this.userModel.find({ role: 'system-admin' });

    // Create and emit a notification for each admin
    for (const admin of admins) {
       await this.notificationModel.create({
        message: `New review on ${place.title} by ${user.username}`,
        user: admin._id,
        type: 'review',
      });
      // Send notification via WebSocket to admin (both web and mobile)
      this.websocketGateway.sendNotification(
        admin._id.toString(),
        'New Review',
        `New review on ${place.title} by ${user.username}`,
        'web',
        'review',
        { placeId: place._id.toString(), reviewId: review._id.toString() }
      );
      this.websocketGateway.sendNotification(
        admin._id.toString(),
        'New Review',
        `New review on ${place.title} by ${user.username}`,
        'mobile',
        'review',
        { placeId: place._id.toString(), reviewId: review._id.toString() }
      );
    }


    return review;
  }
}