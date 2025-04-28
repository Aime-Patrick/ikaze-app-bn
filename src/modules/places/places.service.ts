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

  async createPlace(createPlacesDto: CreatePlacesDto): Promise<{place: Place, statusCode: number}> {
    const newPlace = new this.placeModel(createPlacesDto);
    const place = await newPlace.save();
    return {place, statusCode: 201};
  }

  async getAllPlaces(): Promise<{statusCode: number, places:Place[]}> {
    const places = await this.placeModel.find().exec();
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
}
