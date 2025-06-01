import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { OTPService } from './otp.service';

@ApiTags('OTP')
@Controller('otp')
export class OTPController {
    constructor(private readonly otpService: OTPService) {}

    @Post('request-reset')
    @ApiOperation({ summary: 'Request password reset OTP' })
    @ApiHeader({ name: 'platform', required: true, description: 'Platform type (mobile/web)' })
    @ApiResponse({ status: 200, description: 'OTP sent successfully' })
    async requestPasswordReset(
        @Body('email') email: string,
        @Headers('platform') platform: 'mobile' | 'web' = 'web'
    ) {
        try {
            await this.otpService.requestPasswordResetOTP(email, platform);
            return { message: 'OTP sent successfully' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post('verify')
    @ApiOperation({ summary: 'Verify OTP' })
    @ApiResponse({ status: 200, description: 'OTP verified successfully' })
    async verifyOTP(
        @Body('email') email: string,
        @Body('code') code: string,
        @Body('type') type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION'
    ) {
        try {
            const isValid = await this.otpService.verifyOTP(email, code, type);
            return { message: 'OTP verified successfully', isValid };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }

    @Post('resend')
    @ApiOperation({ summary: 'Resend OTP' })
    @ApiHeader({ name: 'platform', required: true, description: 'Platform type (mobile/web)' })
    @ApiResponse({ status: 200, description: 'OTP resent successfully' })
    async resendOTP(
        @Body('email') email: string,
        @Body('type') type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION',
        @Headers('platform') platform: 'mobile' | 'web' = 'web'
    ) {
        try {
            await this.otpService.resendOTP(email, type, platform);
            return { message: 'OTP resent successfully' };
        } catch (error) {
            throw new BadRequestException(error.message);
        }
    }
} 