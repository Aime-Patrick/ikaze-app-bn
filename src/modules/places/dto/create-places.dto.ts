import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlacesDto {
  @ApiProperty({
    description: 'Array of image files for the place',
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: false,
  })
  @IsOptional()
  images: any[];

  @ApiProperty({
    description: 'Location of the place',
    example: 'Kayonza',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({
    description: 'Category of the place',
    example: 'Wildlife',
  })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Title of the place',
    example: 'Beach Paradise',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Price of the place',
    example: '$499',
  })
  @IsNotEmpty()
  @IsString()
  price: string;

  @ApiPropertyOptional({
    description: 'Description of the place',
    example: '',
  })
  @IsOptional()
  @IsString()
  description?: string;
}