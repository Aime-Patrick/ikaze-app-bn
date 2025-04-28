import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PlacesService } from './places.service';
import { CreatePlacesDto } from './dto/create-places.dto';
import { JwtAuthGuard } from 'src/guard/jwt.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';
import { HashService } from 'src/utils/utils.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UpdatePlaceDto } from './dto/update-place.dto';

@ApiTags('places')
@Controller('places')
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
    private hashService: HashService,
  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images'))
  @ApiOperation({
    summary: 'Create a new place',
    description: 'Create a new place with images.',
  })
  async createPlace(
    @Body() createPlacesDto: CreatePlacesDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files uploaded');
    }

    const uploadedFiles = await Promise.all(
      files.map((file) => this.hashService.uploadFileToCloudinary(file)),
    );

    const urls = uploadedFiles.map((f) => f.url);
    return this.placesService.createPlace({ ...createPlacesDto, images: urls });
  }

  @Get()
  @ApiOperation({ summary: 'Get all places' })
  async getAllPlaces() {
    return this.placesService.getAllPlaces();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a place by ID' })
  async getPlaceById(@Param('id') id: string) {
    return this.placesService.getPlaceById(id);
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Update a place by ID' })
  async updatePlace(
    @Param('id') id: string,
    @Body() updateData: UpdatePlaceDto,
  ) {
    return this.placesService.updatePlace(id, updateData);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSTEM_ADMIN)
  @ApiOperation({ summary: 'Delete a place by ID' })
  async deletePlace(@Param('id') id: string) {
    return this.placesService.deletePlace(id);
  }
}
