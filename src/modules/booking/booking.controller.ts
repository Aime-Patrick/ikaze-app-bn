import { Controller, Post, Body, Param, Get, Patch, UseGuards, Req } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/guard/jwt.guard';
import { Roles } from 'src/decorator/roles.decorator';
import { UserRole } from 'src/schemas/user.schema';

@ApiTags('booking')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Roles(UserRole.USER)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  async createBooking(@Body() dto: CreateBookingDto, @Req() req) {
    return this.bookingService.createBooking(dto, req.user.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all bookings for a user' })
  async getUserBookings(@Param('userId') userId: string) {
    return this.bookingService.getUserBookings(userId);
  }

  @Get('place/:placeId')
  @ApiOperation({ summary: 'Get all bookings for a place' })
  async getPlaceBookings(@Param('placeId') placeId: string) {
    return this.bookingService.getPlaceBookings(placeId);
  }

  @Patch(':bookingId/status')
  @ApiOperation({ summary: 'Update booking status' })
  async updateBookingStatus(
    @Param('bookingId') bookingId: string,
    @Body('status') status: string
  ) {
    return this.bookingService.updateBookingStatus(bookingId, status);
  }

  @Patch(':bookingId/cancel')
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancelBooking(@Param('bookingId') bookingId: string) {
    return this.bookingService.cancelBooking(bookingId);
  }
}