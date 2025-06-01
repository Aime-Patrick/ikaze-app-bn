import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notification } from 'src/schemas/notification.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async getUserNotifications(userId: string) {
    return this.notificationModel.find({ user: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId: string) {
    return this.notificationModel.findByIdAndUpdate(notificationId, { read: true }, { new: true });
  }

  async markAllAsRead(userId: string) {
    return this.notificationModel.updateMany({ user: new Types.ObjectId(userId), read: false }, { read: true });
  }
}