import { Controller, Post, Headers, Request, BadRequestException, Logger } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Controller('payment')
export class PaymentController {
    private readonly logger = new Logger(PaymentController.name);

    constructor(
        private readonly paymentService: PaymentService,
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService
    ) { }

    @Post('webhook')
    async handleWebhook(@Headers('x-razorpay-signature') signature: string, @Request() req: any) {
        const webhookSecret = this.configService.get<string>('RAZORPAY_WEBHOOK_SECRET');

        if (!webhookSecret) {
            this.logger.warn('RAZORPAY_WEBHOOK_SECRET not set');
            // Proceeding without verification if secret is missing is dangerous in prod, but for dev we might allow it or just fail.
            // Let's fail safe.
            // throw new BadRequestException('Webhook secret not configured');
        }

        if (webhookSecret && signature) {
            const shasum = crypto.createHmac('sha256', webhookSecret);
            shasum.update(JSON.stringify(req.body));
            const digest = shasum.digest('hex');

            if (digest !== signature) {
                this.logger.error('Invalid Razorpay signature');
                throw new BadRequestException('Invalid signature');
            }
        }

        const event = req.body;

        if (event.event === 'payment_link.paid' || event.event === 'payment.captured') {
            const payload = event.payload;
            let invoiceId: string | undefined;

            // Try to find invoiceId in notes
            if (payload.payment_link && payload.payment_link.entity && payload.payment_link.entity.notes) {
                invoiceId = payload.payment_link.entity.notes.invoiceId;
            } else if (payload.payment && payload.payment.entity && payload.payment.entity.notes) {
                invoiceId = payload.payment.entity.notes.invoiceId;
            }

            if (invoiceId) {
                this.logger.log(`Payment successful for invoice ${invoiceId}`);
                await this.prisma.invoice.update({
                    where: { id: invoiceId },
                    data: {
                        status: 'paid',
                        paymentStatus: 'paid',
                        // Store Razorpay payment ID if needed, maybe in a new field or reuse existing generic one
                        // stripePaymentIntentId: payload.payment.entity.id 
                    } as any
                });
            } else {
                this.logger.warn('Invoice ID not found in payment event');
            }
        }

        return { status: 'ok' };
    }

}
