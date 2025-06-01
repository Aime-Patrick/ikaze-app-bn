import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from '../../schemas/payment.schema';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { Activity } from 'src/schemas/activity.schema';
import { Booking } from 'src/schemas/booking.schema';

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);    
    private stripe: Stripe;

    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<Payment>,
        @InjectModel(Activity.name) private activityModel: Model<Activity>,
        @InjectModel(Booking.name) private bookingModel: Model<Booking>,
        private configService: ConfigService,
    ) {
        const stripeKey = this.configService.get<string>('STRIPE_SECRET_KEY');
        if (!stripeKey) {
            throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
        }
        this.stripe = new Stripe(stripeKey, {
            apiVersion: '2025-05-28.basil',
        });
    }

    async createPaymentIntent(amount: number, currency: string = 'usd', platform: 'mobile' | 'web' = 'web') {
        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: amount * 100, // Convert to cents
                currency,
                payment_method_types: platform === 'mobile' 
                    ? ['card', 'mobile_money'] 
                    : ['card'],
                metadata: {
                    platform,
                },
            });
            this.logger.log(`Payment intent created: ${paymentIntent.id} for amount ${amount} ${currency}`);
            // Log activity
            const activity = new this.activityModel({
                action: 'create_payment_intent',
                details: `Payment intent ${paymentIntent.id} created for amount ${amount} ${currency}`,
                createdAt: new Date(),
            });
            await activity.save();
            return paymentIntent;
        } catch (error) {
            this.logger.error(`Error creating payment intent: ${error.message}`);
            throw new BadRequestException('Failed to create payment intent');
        }
    }

    async processPayment(paymentData: RecordPaymentDto, platform: 'mobile' | 'web' = 'web') {
        try {
            const payment = new this.paymentModel({
                ...paymentData,
                status: PaymentStatus.PENDING,
                createdAt: new Date(),
                metadata: {
                    ...paymentData.metadata,
                    platform,
                    bookingId: paymentData.bookingId,
                },
            });
            await payment.save();

            // Process payment based on method and platform
            switch (paymentData.method) {
                case PaymentMethod.CREDIT_CARD:
                    return await this.processCreditCardPayment(payment, platform);
                case PaymentMethod.BANK_TRANSFER:
                    return await this.processBankTransfer(payment);
                case PaymentMethod.MOBILE_PAYMENT:
                    return await this.processMobilePayment(payment);
                default:
                    throw new BadRequestException('Invalid payment method');
            }
        } catch (error) {
            this.logger.error(`Payment processing error: ${error.message}`);
            throw new BadRequestException('Payment processing failed');
        }
    }

    private async processCreditCardPayment(payment: Payment, platform: 'mobile' | 'web') {
        try {
            const paymentIntent = await this.createPaymentIntent(payment.amount, payment.currency, platform);
            
            payment.paymentIntentId = paymentIntent.id;
            payment.status = PaymentStatus.PROCESSING;
            await payment.save();

            return {
                clientSecret: paymentIntent.client_secret,
                paymentId: payment._id,
                platform,
            };
        } catch (error) {
            payment.status = PaymentStatus.FAILED;
            await payment.save();
            throw error;
        }
    }

    private async processBankTransfer(payment: Payment) {
        try {
            payment.status = PaymentStatus.PENDING;
            await payment.save();
            return {
                paymentId: payment._id,
                status: PaymentStatus.PENDING,
                bankDetails: {
                    accountName: this.configService.get('BANK_ACCOUNT_NAME'),
                    accountNumber: this.configService.get('BANK_ACCOUNT_NUMBER'),
                    bankName: this.configService.get('BANK_NAME'),
                },
            };
        } catch (error) {
            payment.status = PaymentStatus.FAILED;
            await payment.save();
            throw error;
        }
    }

    private async processMobilePayment(payment: Payment) {
        try {
            // Implement mobile money payment logic here
            payment.status = PaymentStatus.PENDING;
            await payment.save();
            return {
                paymentId: payment._id,
                status: PaymentStatus.PENDING,
                mobilePaymentDetails: {
                    provider: payment.metadata?.provider || 'default',
                    phoneNumber: payment.metadata?.phoneNumber,
                },
            };
        } catch (error) {
            payment.status = PaymentStatus.FAILED;
            await payment.save();
            throw error;
        }
    }

    async getRecordPayment(platform?: 'mobile' | 'web') {
        try {
            const query = platform ? { 'metadata.platform': platform } : {};
            return await this.paymentModel.find(query).sort({ createdAt: -1 });
        } catch (error) {
            this.logger.error(`Error fetching payment records: ${error.message}`);
            throw new BadRequestException('Failed to fetch payment records');
        }
    }

    async getPaymentById(id: string) {
        try {
            const payment = await this.paymentModel.findById(id);
            if (!payment) {
                throw new BadRequestException('Payment not found');
            }
            return payment;
        } catch (error) {
            this.logger.error(`Error fetching payment: ${error.message}`);
            throw new BadRequestException('Failed to fetch payment');
        }
    }

    async updatePaymentStatus(id: string, status: PaymentStatus) {
        try {
            const payment = await this.paymentModel.findById(id);
            if (!payment) {
                throw new BadRequestException('Payment not found');
            }

            payment.status = status;
            await payment.save();

            // In your payment confirmation logic
            if (status === PaymentStatus.SUCCESS || status === PaymentStatus.PROCESSING) {
                const bookingId = payment.metadata?.bookingId;
                if (bookingId) {
                    await this.bookingModel.findByIdAndUpdate(
                        bookingId,
                        { status: 'confirmed', paymentId: payment._id },
                        { new: true }
                    );
                }
            }

            return payment;
        } catch (error) {
            this.logger.error(`Error updating payment status: ${error.message}`);
            throw new BadRequestException('Failed to update payment status');
        }
    }

    async generatePaymentReceipt(id: string) {
        try {
            const payment = await this.paymentModel.findById(id);
            if (!payment) {
                throw new BadRequestException('Payment not found');
            }

            const receiptData = {
                receiptId: `REC-${Date.now()}`,
                payment,
                generatedAt: new Date(),
                platform: payment.metadata?.platform || 'web',
            };

            // Generate receipt URL or data based on platform
            if (payment.metadata?.platform === 'mobile') {
                // Generate mobile-friendly receipt
                return {
                    ...receiptData,
                    format: 'mobile',
                    downloadUrl: await this.generateMobileReceipt(payment),
                };
            } else {
                // Generate web receipt
                return {
                    ...receiptData,
                    format: 'pdf',
                    downloadUrl: await this.generateWebReceipt(payment),
                };
            }
        } catch (error) {
            this.logger.error(`Error generating receipt: ${error.message}`);
            throw new BadRequestException('Failed to generate receipt');
        }
    }

    private async generateMobileReceipt(payment: Payment) {
        // Implement mobile receipt generation
        return `receipts/mobile/${payment._id}.pdf`;
    }

    private async generateWebReceipt(payment: Payment) {
        // Implement web receipt generation
        return `receipts/web/${payment._id}.pdf`;
    }
}
