import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OTP } from '../../schemas/otp.schema';
import { MailService } from '../mail/mail.service';
import { AppWebSocketGateway } from '../webSocket/webSocket.gateway';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class OTPService {
    constructor(
        @InjectModel(OTP.name) private otpModel: Model<OTP>,
        @InjectModel(User.name) private userModel: Model<User>,
        private mailService: MailService,
        private webSocketGateway: AppWebSocketGateway,
    ) {}

    private generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    private async createOTP(email: string, type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION', userId: string, platform: 'mobile' | 'web'): Promise<OTP> {
        // Invalidate any existing OTPs for this user and type
        await this.otpModel.updateMany(
            { email, type, isUsed: false },
            { isUsed: true }
        );

        const otp = new this.otpModel({
            code: this.generateOTP(),
            email,
            type,
            userId,
            platform,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes expiry
        });

        return otp.save();
    }

    async requestEmailVerification(email: string, platform: 'mobile' | 'web'): Promise<void> {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (user.isEmailVerified) {
            throw new BadRequestException('Email is already verified');
        }

        const otp = await this.createOTP(email, 'EMAIL_VERIFICATION', user._id.toString(), platform);

        // Send OTP via email
        await this.mailService.sendEmailVerificationOTP(email, otp.code);
        
        // Send real-time notification if user is connected
        await this.webSocketGateway.sendNotification(
            user._id.toString(),
            'Email Verification',
            `Your email verification OTP is: ${otp.code}`,
            platform,
            'EMAIL_VERIFICATION',
            { email }
        );
    }

    async verifyEmail(email: string, code: string): Promise<boolean> {
        const otp = await this.otpModel.findOne({
            email,
            code,
            type: 'EMAIL_VERIFICATION',
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otp) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        // Mark OTP as used
        otp.isUsed = true;
        await otp.save();

        // Update user's email verification status
        await this.userModel.updateOne(
            { email },
            { 
                isEmailVerified: true,
                emailVerifiedAt: new Date()
            }
        );

        return true;
    }

    async requestPasswordResetOTP(email: string, platform: 'mobile' | 'web'): Promise<void> {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const otp = await this.createOTP(email, 'PASSWORD_RESET', user._id.toString(), platform);

        if (platform === 'mobile') {
            // Send OTP via email for mobile
            await this.mailService.sendPasswordResetOTP(email, otp.code);
            
            // Also send real-time notification if user is connected
            await this.webSocketGateway.sendNotification(
                user._id.toString(),
                'Password Reset',
                `Your password reset OTP is: ${otp.code}`,
                'mobile',
                'PASSWORD_RESET',
                { email }
            );
        } else {
            // Send reset link for web
            const resetToken = otp.code; // Using OTP code as reset token for web
            await this.mailService.sendPasswordResetEmail(email, resetToken, 'web');
        }
    }

    async verifyOTP(email: string, code: string, type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION'): Promise<boolean> {
        const otp = await this.otpModel.findOne({
            email,
            code,
            type,
            isUsed: false,
            expiresAt: { $gt: new Date() }
        });

        if (!otp) {
            throw new BadRequestException('Invalid or expired OTP');
        }

        // Mark OTP as used
        otp.isUsed = true;
        await otp.save();

        return true;
    }

    async resendOTP(email: string, type: 'PASSWORD_RESET' | 'EMAIL_VERIFICATION', platform: 'mobile' | 'web'): Promise<void> {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new BadRequestException('User not found');
        }

        const otp = await this.createOTP(email, type, user._id.toString(), platform);

        if (type === 'EMAIL_VERIFICATION') {
            await this.mailService.sendEmailVerificationOTP(email, otp.code);
            
            await this.webSocketGateway.sendNotification(
                user._id.toString(),
                'Email Verification',
                `Your new email verification OTP is: ${otp.code}`,
                platform,
                'EMAIL_VERIFICATION',
                { email }
            );
        } else if (platform === 'mobile') {
            await this.mailService.sendPasswordResetOTP(email, otp.code);
            
            await this.webSocketGateway.sendNotification(
                user._id.toString(),
                'Password Reset',
                `Your new password reset OTP is: ${otp.code}`,
                'mobile',
                'PASSWORD_RESET',
                { email }
            );
        } else {
            const resetToken = otp.code;
            await this.mailService.sendPasswordResetEmail(email, resetToken, 'web');
        }
    }
} 