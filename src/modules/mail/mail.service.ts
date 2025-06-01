import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { AppWebSocketGateway } from '../webSocket/webSocket.gateway';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly fromEmail: string;
    private readonly appName: string;
    private readonly supportEmail: string;

    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private readonly webSocketGateway: AppWebSocketGateway,
    ) {
        this.fromEmail = this.configService.get<string>('MAIL_FROM') || 'noreply@example.com';
        this.appName = this.configService.get<string>('APP_NAME') || 'Ikaze App';
        this.supportEmail = this.configService.get<string>('SUPPORT_EMAIL') || 'ndagijimanapazo64@gmail.com';
    }

    async sendAccountInfoEmail(
        to: string,
        fullName: string,
        password: string,
        role: string,
        platform: 'mobile' | 'web' = 'web',
    ) {
        try {
            const template = platform === 'mobile' ? 'mobile-account-info' : 'account-info';
            await this.mailerService.sendMail({
                to,
                from: this.fromEmail,
                subject: `Welcome to ${this.appName}`,
                template,
                context: {
                    fullName,
                    email: to,
                    password,
                    role,
                    contactEmail: this.supportEmail,
                    year: new Date().getFullYear(),
                    appName: this.appName,
                    platform,
                    downloadAppUrl: this.configService.get('MOBILE_APP_DOWNLOAD_URL'),
                },
            });

            // Send real-time notification for mobile users
            if (platform === 'mobile') {
                this.webSocketGateway.sendMobilePushNotification(to, {
                    title: 'Account Created',
                    message: `Welcome to ${this.appName}! Your account has been created successfully.`,
                    type: 'ACCOUNT_CREATED',
                    data: {
                        email: to,
                        role,
                    }
                });
            }

            this.logger.log(`Account info email sent to ${to} (${platform})`);
        } catch (error) {
            this.logger.error(`Failed to send account info email to ${to}: ${error.message}`);
            throw error;
        }
    }

    async sendPasswordResetEmail(to: string, resetToken: string, platform: 'mobile' | 'web' = 'web') {
        try {
            const template = platform === 'mobile' ? 'mobile-password-reset' : 'password-reset';
            const resetUrl = platform === 'mobile'
                ? `${this.configService.get('MOBILE_APP_URL')}/reset-password?token=${resetToken}`
                : `${this.configService.get('FRONTEND_URL')}/reset-password?token=${resetToken}`;

            await this.mailerService.sendMail({
                to,
                from: this.fromEmail,
                subject: 'Password Reset Request',
                template,
                context: {
                    resetToken,
                    resetUrl,
                    year: new Date().getFullYear(),
                    appName: this.appName,
                    platform,
                    supportEmail: this.supportEmail,
                },
            });

            // Send real-time notification for mobile users
            if (platform === 'mobile') {
                this.webSocketGateway.sendMobilePushNotification(to, {
                    title: 'Password Reset Requested',
                    message: 'A password reset has been requested for your account.',
                    type: 'PASSWORD_RESET',
                    data: {
                        resetToken,
                    }
                });
            }

            this.logger.log(`Password reset email sent to ${to} (${platform})`);
        } catch (error) {
            this.logger.error(`Failed to send password reset email to ${to}: ${error.message}`);
            throw error;
        }
    }

    async sendPaymentConfirmationEmail(
        to: string,
        fullName: string,
        paymentDetails: {
            amount: number;
            currency: string;
            paymentId: string;
            date: Date;
            method: string;
        },
        platform: 'mobile' | 'web' = 'web',
    ) {
        try {
            const template = platform === 'mobile' ? 'mobile-payment-confirmation' : 'payment-confirmation';
            await this.mailerService.sendMail({
                to,
                from: this.fromEmail,
                subject: 'Payment Confirmation',
                template,
                context: {
                    fullName,
                    ...paymentDetails,
                    year: new Date().getFullYear(),
                    appName: this.appName,
                    platform,
                    supportEmail: this.supportEmail,
                    receiptUrl: `${this.configService.get('API_URL')}/payment/${paymentDetails.paymentId}/receipt`,
                },
            });

            // Send real-time notification for mobile users
            if (platform === 'mobile') {
                this.webSocketGateway.sendMobilePushNotification(to, {
                    type: 'PAYMENT_CONFIRMED',
                    title: 'Payment Confirmed',
                    message: `Payment of ${paymentDetails.amount} ${paymentDetails.currency} has been confirmed.`,
                    data: {
                        paymentId: paymentDetails.paymentId,
                        amount: paymentDetails.amount,
                        currency: paymentDetails.currency,
                    },
                });
            }

            this.logger.log(`Payment confirmation email sent to ${to} (${platform})`);
        } catch (error) {
            this.logger.error(`Failed to send payment confirmation email to ${to}: ${error.message}`);
            throw error;
        }
    }

    async sendWelcomeEmail(to: string, fullName: string, platform: 'mobile' | 'web' = 'web') {
        try {
            const template = platform === 'mobile' ? 'mobile-welcome' : 'welcome';
            await this.mailerService.sendMail({
                to,
                from: this.fromEmail,
                subject: `Welcome to ${this.appName}`,
                template,
                context: {
                    fullName,
                    loginUrl: platform === 'mobile'
                        ? this.configService.get('MOBILE_APP_URL')
                        : `${this.configService.get('FRONTEND_URL')}/login`,
                    year: new Date().getFullYear(),
                    appName: this.appName,
                    platform,
                    supportEmail: this.supportEmail,
                    downloadAppUrl: this.configService.get('MOBILE_APP_DOWNLOAD_URL'),
                },
            });

            // Send real-time notification for mobile users
            if (platform === 'mobile') {
                this.webSocketGateway.sendMobilePushNotification(to, {
                    title: `Welcome to ${this.appName}`,
                    message: 'Thank you for joining us!',
                    type: 'WELCOME',
                    data: {
                        fullName,
                    }
                });
            }

            this.logger.log(`Welcome email sent to ${to} (${platform})`);
        } catch (error) {
            this.logger.error(`Failed to send welcome email to ${to}: ${error.message}`);
            throw error;
        }
    }

    async sendNotificationEmail(
        to: string,
        subject: string,
        template: string,
        context: Record<string, any>,
        platform: 'mobile' | 'web' = 'web',
    ) {
        try {
            const templateName = platform === 'mobile' ? `mobile-${template}` : template;
            await this.mailerService.sendMail({
                to,
                from: this.fromEmail,
                subject,
                template: templateName,
                context: {
                    ...context,
                    year: new Date().getFullYear(),
                    appName: this.appName,
                    platform,
                    supportEmail: this.supportEmail,
                },
            });

            // Send real-time notification for mobile users
            if (platform === 'mobile') {
                this.webSocketGateway.sendMobilePushNotification(to, {
                    title: subject,
                    message: context.message || subject,
                    type: 'NOTIFICATION',
                    data: context
                });
            }

            this.logger.log(`Notification email sent to ${to} (${platform})`);
        } catch (error) {
            this.logger.error(`Failed to send notification email to ${to}: ${error.message}`);
            throw error;
        }
    }

    // Mobile-specific notification methods
    async sendMobilePushNotification(
        to: string,
        notification: {
            type: string;
            title: string;
            message: string;
            data?: Record<string, any>;
        },
    ) {
        try {
            this.webSocketGateway.sendMobilePushNotification(to, notification);
            this.logger.log(`Mobile push notification sent to ${to}`);
        } catch (error) {
            this.logger.error(`Failed to send mobile push notification to ${to}: ${error.message}`);
            throw error;
        }
    }

    async sendPasswordResetOTP(email: string, otp: string): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Password Reset OTP',
                template: 'password-reset-otp',
                context: {
                    otp,
                    expiryMinutes: 15,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to send password reset OTP email: ${error.message}`);
            throw new Error('Failed to send password reset OTP email');
        }
    }

    async sendEmailVerificationOTP(email: string, otp: string): Promise<void> {
        try {
            await this.mailerService.sendMail({
                to: email,
                subject: 'Email Verification',
                template: 'email-verification-otp',
                context: {
                    otp,
                    expiryMinutes: 15,
                },
            });
        } catch (error) {
            this.logger.error(`Failed to send email verification OTP: ${error.message}`);
            throw new Error('Failed to send email verification OTP');
        }
    }
}
