import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Place } from 'src/schemas/places.schema';
import { CreatePlacesDto } from './dto/create-places.dto';

@Injectable()
export class PlacesService {
  constructor(
    @InjectModel(Place.name) private readonly placeModel: Model<Place>,
  ) {}

  async createPlace(createPlacesDto: CreatePlacesDto): Promise<Place> {
    const newPlace = new this.placeModel(createPlacesDto);
    return await newPlace.save();
  }

  async getAllPlaces(): Promise<Place[]> {
    return await this.placeModel.find().exec();
  }

  async getPlaceById(id: string): Promise<Place> {
    const place = await this.placeModel.findById(id).exec();
    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }
    return place;
  }

  async updatePlace(id: string, updateData: Partial<CreatePlacesDto>): Promise<Place> {
    const updatedPlace = await this.placeModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updatedPlace) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }
    return updatedPlace;
  }

  async deletePlace(id: string): Promise<{ message: string }> {
    const result = await this.placeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }
    return { message: 'Place deleted successfully' };
  }
}
