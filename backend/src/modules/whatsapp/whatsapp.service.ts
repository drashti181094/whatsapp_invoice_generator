import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

@Injectable()
export class WhatsappService {
    private client: Twilio;
    private readonly logger = new Logger(WhatsappService.name);

    constructor(private configService: ConfigService) {
        const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
        const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

        if (accountSid && authToken) {
            this.client = new Twilio(accountSid, authToken);
        } else {
            this.logger.warn('Twilio credentials not found. WhatsApp service will not work.');
        }
    }

    async sendInvoiceMessage(to: string, messageBody: string, mediaUrl?: string) {
        if (!this.client) {
            this.logger.warn('Twilio client not initialized');
            return false;
        }

        let from = this.configService.get<string>('TWILIO_WHATSAPP_NUMBER');

        if (!from) {
            this.logger.error('TWILIO_WHATSAPP_NUMBER is not defined in environment variables');
            return false;
        }

        // Ensure 'from' number has 'whatsapp:' prefix
        if (!from.startsWith('whatsapp:')) {
            from = `whatsapp:${from}`;
        }

        // Ensure 'to' number is in E.164 format (assuming IN +91 if missing)
        let formattedTo = to;
        if (!formattedTo.startsWith('+')) {
            formattedTo = `+91${formattedTo}`;
        }

        // Ensure 'to' number has 'whatsapp:' prefix
        const toNumber = formattedTo.startsWith('whatsapp:') ? formattedTo : `whatsapp:${formattedTo}`;

        this.logger.log(`Attempting to send WhatsApp message from ${from} to ${toNumber}`);

        try {
            const messageOptions: any = {
                from: from,
                to: toNumber,
                body: messageBody,
            };

            if (mediaUrl) {
                messageOptions.mediaUrl = [mediaUrl];
            }

            const message = await this.client.messages.create(messageOptions);

            this.logger.log(`WhatsApp message sent: ${message.sid}`);
            return message.sid;
        } catch (error) {
            this.logger.error(`Failed to send WhatsApp message: ${error.message}`, error.stack);
            throw error;
        }
    }
}
