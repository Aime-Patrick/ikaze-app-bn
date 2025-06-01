import { IsNotEmpty, IsNumber, IsString, Min, Max, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID of the place being reviewed' })
  @IsNotEmpty()
  @IsString()
  placeId: string;

  @ApiProperty({ description: 'Review comment' })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: 'Rating from 1 to 5', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;
}