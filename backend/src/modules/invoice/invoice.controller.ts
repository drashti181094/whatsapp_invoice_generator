import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Prisma } from '@prisma/client';

@Controller('invoices')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Post()
    create(@Body() createInvoiceDto: Prisma.InvoiceCreateInput) {
        return this.invoiceService.create(createInvoiceDto);
    }

    @Get()
    findAll() {
        return this.invoiceService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.invoiceService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateInvoiceDto: Prisma.InvoiceUpdateInput) {
        return this.invoiceService.update(id, updateInvoiceDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.invoiceService.remove(id);
    }

    @Post(':id/export/pdf')
    generatePdf(@Param('id') id: string) {
        return this.invoiceService.generatePdf(id);
    }

    @Post(':id/send-whatsapp')
    sendWhatsapp(@Param('id') id: string) {
        return this.invoiceService.sendWhatsapp(id);
    }

    @Post(':id/pay-link')
    createPaymentLink(@Param('id') id: string) {
        return this.invoiceService.createPaymentLink(id);
    }
}
