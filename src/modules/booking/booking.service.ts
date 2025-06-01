import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking } from 'src/schemas/booking.schema';
import { Place } from 'src/schemas/places.schema';
import { User } from 'src/schemas/user.schema';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<Booking>,
    @InjectModel(Place.name) private placeModel: Model<Place>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createBooking(data: CreateBookingDto, userId: string): Promise<Booking> {
    // Validate user and place exist
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const place = await this.placeModel.findById(data.placeId);
    if (!place) throw new NotFoundException('Place not found');

    // Create booking
    const booking = new this.bookingModel({
      user: new Types.ObjectId(userId),
      place: new Types.ObjectId(data.placeId),
      bookingDate: data.bookingDate,
      guests: data.guests,
      notes: data.notes,
    });
    await booking.save();

    // Optionally increment bookings count on place
    await this.placeModel.findByIdAndUpdate(data.placeId, { $inc: { bookings: 1 } });

    return booking;
  }

  async getUserBookings(userId: string) {
    return this.bookingModel.find({ user: userId }).populate('place').sort({ bookingDate: -1 });
  }

  async getPlaceBookings(placeId: string) {
    return this.bookingModel.find({ place: placeId }).populate('user').sort({ bookingDate: -1 });
  }

  async updateBookingStatus(bookingId: string, status: string) {
    return this.bookingModel.findByIdAndUpdate(bookingId, { status }, { new: true });
  }

  async confirmBooking(bookingId: string, paymentId: string) {
    return this.bookingModel.findByIdAndUpdate(
      bookingId,
      { status: 'confirmed', paymentId },
      { new: true }
    );
  }

  async cancelBooking(bookingId: string) {
    return this.bookingModel.findByIdAndUpdate(
      bookingId,
      { status: 'cancelled' },
      { new: true }
    );
  }
}