import { BadRequestException, Body, Controller, Get, Param, Post, Put, UseGuards, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiHeader } from '@nestjs/swagger';
import { Roles } from 'src/decorator/roles.decorator';
import { JwtAuthGuard } from 'src/guard/jwt.guard';
import { RolesGuard } from 'src/guard/roles.guard';
import { UserRole } from 'src/schemas/user.schema';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { PaymentStatus } from './enums/payment-status.enum';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService,
    ) {}

    @Post()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiHeader({ name: 'x-platform', description: 'Platform type (mobile/web)', required: true })
    @ApiOperation({
        summary: 'Process payment',
        description: 'Process a new payment with the specified method.',
    })
    async processPayment(
        @Body() paymentData: RecordPaymentDto,
        @Headers('x-platform') platform: 'mobile' | 'web' = 'web',
    ) {
        try {
            return await this.paymentService.processPayment(paymentData, platform);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get()
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiHeader({ name: 'x-platform', description: 'Platform type (mobile/web)', required: false })
    @ApiOperation({
        summary: 'Get all payments',
        description: 'Get all payment records (Admin only).',
    })
    async getAllPayments(@Headers('x-platform') platform?: 'mobile' | 'web') {
        try {
            return await this.paymentService.getRecordPayment(platform);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(':id')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Get payment by ID',
        description: 'Get payment details by payment ID.',
    })
    async getPaymentById(@Param('id') id: string) {
        try {
            return await this.paymentService.getPaymentById(id);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Put(':id/status')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SYSTEM_ADMIN)
    @ApiOperation({
        summary: 'Update payment status',
        description: 'Update the status of a payment (Admin only).',
    })
    async updatePaymentStatus(
        @Param('id') id: string,
        @Body('status') status: PaymentStatus,
    ) {
        try {
            return await this.paymentService.updatePaymentStatus(id, status);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Get(':id/receipt')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @ApiHeader({ name: 'x-platform', description: 'Platform type (mobile/web)', required: true })
    @ApiOperation({
        summary: 'Generate payment receipt',
        description: 'Generate a receipt for a completed payment.',
    })
    async generateReceipt(
        @Param('id') id: string,
        @Headers('x-platform') platform: 'mobile' | 'web' = 'web',
    ) {
        try {
            return await this.paymentService.generatePaymentReceipt(id);
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
}
