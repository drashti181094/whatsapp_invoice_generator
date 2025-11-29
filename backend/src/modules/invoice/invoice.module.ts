import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { PrismaService } from '../../prisma/prisma.service';
import { WhatsappModule } from '../whatsapp/whatsapp.module';
import { PaymentModule } from '../payment/payment.module';

@Module({
    imports: [WhatsappModule, PaymentModule],
    controllers: [InvoiceController],
    providers: [InvoiceService, PrismaService],
})
export class InvoiceModule { }
