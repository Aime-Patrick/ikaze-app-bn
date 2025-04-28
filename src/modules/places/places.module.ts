import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { Place, PlaceSchema } from 'src/schemas/places.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PlacesController } from './places.controller';
import { UtilsModule } from 'src/utils/utils.module';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Place.name, schema: PlaceSchema }]),
    UtilsModule
  ],
  controllers: [
    PlacesController
  ],
  providers: [PlacesService]
})
export class PlacesModule {}
