import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateBookingDto {

  @ApiProperty({ description: 'ID of the place being booked' })
  @IsNotEmpty()
  @IsString()
  placeId: string;

  @ApiProperty({ description: 'Date and time for the booking', example: '2025-06-01T15:00:00.000Z' })
  @IsNotEmpty()
  @IsDateString()
  bookingDate: Date;

  @ApiPropertyOptional({ description: 'Number of guests', example: 2 })
  @IsOptional()
  @IsNumber()
  guests?: number;

  @ApiPropertyOptional({ description: 'Additional notes or special requests' })
  @IsOptional()
  @IsString()
  notes?: string;

}