import { BadRequestException, Body, Controller, Get, Post, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/guard/jwt.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { UserRole } from 'src/schemas/user.schema';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { HashService } from 'src/utils/utils.service';
import { RecordPaymentDto } from './dto/record-payment.dto';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService:PaymentService,
        private hashService:HashService
    ){}

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiOperation({
        summary: 'Get Record plan payment',
        description: 'Get all payment records.',
        })
    async getAllPayment () {
    try {
        return this.paymentService.getRecordPayment();
    } catch (error) {
        throw error;
    }
}
}
