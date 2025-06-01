import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, IsMongoId, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../enums/payment-method.enum';

export class RecordPaymentDto {
  @ApiProperty({ description: 'ID of the user making the payment' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'ID of the place being booked/paid for' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  placeId: string;

  @ApiProperty({ description: 'ID of the booking this payment is for' })
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  bookingId: string;

  @ApiProperty({ example: 5000, description: 'Payment amount' })
  @IsNumber({}, { message: "Amount must be a number" })
  @Type(() => Number)
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Payment currency', default: 'usd' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiPropertyOptional({ description: 'Payment description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}