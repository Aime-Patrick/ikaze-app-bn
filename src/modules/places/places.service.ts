import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Place } from 'src/schemas/places.schema';
import { CreatePlacesDto } from './dto/create-places.dto';
import { AppWebSocketGateway } from '../webSocket/webSocket.gateway';
import { Activity } from 'src/schemas/activity.schema';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class PlacesService {
  constructor(
    @InjectModel(Place.name) private readonly placeModel: Model<Place>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Activity.name) private activityModel: Model<Activity>,
    private readonly placesGateway: AppWebSocketGateway,
  ) {}

  async createPlace(createPlacesDto: CreatePlacesDto,user: any): Promise<{ place: Place; statusCode: number }> {
    const newPlace = new this.placeModel(createPlacesDto);
    const place = await newPlace.save();
    const userId = user.id;
    const findedUser = await this.userModel.findById(userId).exec();
    if (!findedUser) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    this.placesGateway.notifyNewPlace(place);
    // Log activity
    const activity = new this.activityModel({
      action: 'New place added',
      details: `Place ${place.location} created with ID ${place._id}`,
      user: findedUser.username,
      createdAt: new Date(),
    });
    await activity.save();
    this.placesGateway.notifyActivity(activity);

    return { place, statusCode: 201 };
  }

  async getAllPlaces(): Promise<{statusCode: number, places:Place[]}> {
    const places = await this.placeModel.find().populate('reviews').exec();
    return {
        statusCode: 200,
        places,
    }
  }

  async getPlaceById(id: string): Promise<{place: Place, statusCode: number}> {
    const place = await this.placeModel.findById(id).exec();
    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }
    return {place, statusCode: 200};
  }

  async updatePlace(id: string, updateData: Partial<CreatePlacesDto>): Promise<{statusCode:number,place:Place}> {
    const updatedPlace = await this.placeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedPlace) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }
    return {place:updatedPlace, statusCode: 200};
  }

  async deletePlace(id: string): Promise<{ message: string, statusCode: number }> {
    const result = await this.placeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }
    return { message: 'Place deleted successfully' , statusCode: 200 };
  }

  async bookPlace(placeId: string): Promise<Place> {
    const place = await this.placeModel.findByIdAndUpdate(
      placeId,
      { $inc: { bookings: 1 } },
      { new: true }
    );
    if (!place) throw new NotFoundException('Place not found');
    return place;
  }

  async favoritePlace(placeId: string): Promise<Place> {
    const place = await this.placeModel.findByIdAndUpdate(
      placeId,
      { $inc: { favorites: 1 } },
      { new: true }
    );
    if (!place) throw new NotFoundException('Place not found');
    return place;
  }

  async unfavoritePlace(placeId: string): Promise<Place> {
    const place = await this.placeModel.findByIdAndUpdate(
      placeId,
      { $inc: { favorites: -1 } },
      { new: true }
    );
    if (!place) throw new NotFoundException('Place not found');
    return place;
  }

  async visitPlace(placeId: string): Promise<Place> {
    const place = await this.placeModel.findByIdAndUpdate(
      placeId,
      { $inc: { visits: 1 } },
      { new: true }
    );
    if (!place) throw new NotFoundException('Place not found');
    return place;
  }
}
