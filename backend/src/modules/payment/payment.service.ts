import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';

@Injectable()
export class PaymentService {
    private razorpay: any;
    private readonly logger = new Logger(PaymentService.name);

    constructor(private configService: ConfigService) {
        const keyId = this.configService.get<string>('RAZORPAY_KEY_ID');
        const keySecret = this.configService.get<string>('RAZORPAY_KEY_SECRET');

        if (keyId && keySecret) {
            this.razorpay = new Razorpay({
                key_id: keyId,
                key_secret: keySecret,
            });
        } else {
            this.logger.warn('Razorpay credentials not found. Payment service will not work.');
        }
    }

    async createPaymentLink(amount: number, currency: string, invoiceId: string, customerEmail?: string, customerPhone?: string) {
        if (!this.razorpay) {
            this.logger.warn('Razorpay not initialized');
            return null;
        }

        try {
            // Razorpay expects amount in smallest currency unit (paise for INR)
            // But unlike Stripe, Razorpay might handle standard units depending on API, 
            // usually it's also in smallest unit. 
            // Documentation says: "Amount in smallest currency unit".
            const amountInSmallestUnit = Math.round(amount * 100);

            const paymentLink = await this.razorpay.paymentLink.create({
                amount: amountInSmallestUnit,
                currency: currency.toUpperCase(),
                accept_partial: false,
                description: `Invoice #${invoiceId}`,
                customer: {
                    email: customerEmail,
                    contact: customerPhone
                },
                notify: {
                    sms: true,
                    email: true
                },
                reminder_enable: true,
                callback_url: `${this.configService.get('FRONTEND_URL')}/invoices/${invoiceId}?payment=success`,
                callback_method: 'get',
                notes: {
                    invoiceId: invoiceId
                }
            });

            return paymentLink.short_url;
        } catch (error) {
            this.logger.error(`Failed to create payment link: ${error.message}`);
            throw error;
        }
    }

    async verifyPaymentLink(linkId: string) {
        if (!this.razorpay) {
            throw new Error('Razorpay not initialized');
        }

        try {
            const link = await this.razorpay.paymentLink.fetch(linkId);
            this.logger.log(`Fetched payment link ${linkId}: status=${link.status}, notes=${JSON.stringify(link.notes)}`);

            if (link.status === 'paid') {
                const invoiceId = link.notes?.invoiceId;
                return { status: 'paid', invoiceId };
            }
            return { status: link.status };
        } catch (error) {
            this.logger.error(`Failed to verify payment link: ${error.message}`);
            throw error;
        }
    }
}
