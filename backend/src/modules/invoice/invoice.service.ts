import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as puppeteer from 'puppeteer';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { PaymentService } from '../payment/payment.service';

@Injectable()
export class InvoiceService {
  private readonly logger = new Logger(InvoiceService.name);

  constructor(
    private prisma: PrismaService,
    private whatsappService: WhatsappService,
    private paymentService: PaymentService,
    private configService: ConfigService,
  ) { }

  create(data: Prisma.InvoiceCreateInput) {
    return this.prisma.invoice.create({
      data,
      include: { items: true },
    });
  }

  findAll() {
    return this.prisma.invoice.findMany({
      include: { customer: true, items: true },
    });
  }

  findOne(id: string) {
    return this.prisma.invoice.findUnique({
      where: { id },
      include: { customer: true, items: true },
    });
  }

  update(id: string, data: Prisma.InvoiceUpdateInput) {
    return this.prisma.invoice.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  remove(id: string) {
    return this.prisma.invoice.delete({ where: { id } });
  }

  async generatePdf(id: string) {
    const invoice = await this.findOne(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Professional HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; }
            .container { width: 80%; margin: 0 auto; padding: 20px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
            .header h1 { color: #2c3e50; }
            .details { margin-bottom: 30px; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .table th { background-color: #f8f9fa; }
            .total { text-align: right; font-size: 1.2em; font-weight: bold; }
            .footer { margin-top: 50px; text-align: center; color: #777; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div>
                <h1>INVOICE</h1>
                <p>#${invoice.id.substring(0, 8)}</p>
              </div>
              <div style="text-align: right;">
                <h3>Business Name</h3>
                <p>123 Business St<br>City, Country</p>
              </div>
            </div>

            <div class="details">
              <h3>Bill To:</h3>
              <p><strong>${invoice.customer.name}</strong><br>
              ${invoice.customer.email || ''}<br>
              ${invoice.customer.phone || ''}</p>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>₹${(item.qty * item.price).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="total">
              <p>Subtotal: ₹${invoice.subtotal.toFixed(2)}</p>
              <p>Tax: ₹${invoice.tax.toFixed(2)}</p>
              <p>Total: ₹${invoice.total.toFixed(2)}</p>
            </div>

            <div class="footer">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    const pdf = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    return pdf;
  }

  async sendWhatsapp(id: string) {
    const invoice = await this.findOne(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    if (!invoice.customer.phone) {
      throw new Error('Customer phone number is missing');
    }

    // Let's try to send the link to the frontend invoice view which will have a download button.
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const invoiceUrl = `${frontendUrl}/invoices/${id}`;

    try {
      // Using the service to send a message. 
      // We'll send a text message with the link.
      const messageBody = `Hello ${invoice.customer.name}, here is your invoice #${invoice.id.substring(0, 8)} for ${invoice.total} INR. View and pay here: ${invoiceUrl}`;

      await this.whatsappService.sendInvoiceMessage(
        invoice.customer.phone,
        messageBody
      );

      await this.prisma.invoice.update({
        where: { id },
        data: { whatsappStatus: 'sent' } as any
      });

      return { success: true, message: 'WhatsApp message sent' };
    } catch (error) {
      this.logger.error(error);
      await this.prisma.invoice.update({
        where: { id },
        data: { whatsappStatus: 'failed' } as any
      });
      throw error;
    }
  }

  async createPaymentLink(id: string) {
    const invoice = await this.findOne(id);
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const link = await this.paymentService.createPaymentLink(
      invoice.total,
      'inr', // Changed to INR to avoid international payment errors on Razorpay
      invoice.id,
      invoice.customer.email || undefined,
      invoice.customer.phone || undefined
    );

    if (link) {
      await this.prisma.invoice.update({
        where: { id },
        data: { paymentLink: link } as any
      });
    }

    return { link };
  }
}
