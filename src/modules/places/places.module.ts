import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { Place, PlaceSchema } from 'src/schemas/places.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { PlacesController } from './places.controller';
import { UtilsModule } from 'src/utils/utils.module';
import { WebSocketModule } from '../webSocket/webSocket.module';
import { Activity, ActivitySchema } from 'src/schemas/activity.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Place.name, schema: PlaceSchema },
      { name: User.name, schema: UserSchema },
      { name: Activity.name, schema: ActivitySchema }
    ]),
    UtilsModule,
    WebSocketModule
  ],
  controllers: [PlacesController],
  providers: [PlacesService, WebSocketModule],
})
export class PlacesModule {}
