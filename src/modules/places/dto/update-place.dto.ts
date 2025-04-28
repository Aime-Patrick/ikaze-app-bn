import { CreatePlacesDto } from "./create-places.dto";
import {PartialType} from "@nestjs/mapped-types";

export class UpdatePlaceDto extends PartialType(CreatePlacesDto) {}