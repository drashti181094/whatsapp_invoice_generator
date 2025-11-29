import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: string) {
        return this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                businessName: true,
                businessAddress: true,
                businessPhone: true,
                currency: true,
                logoUrl: true,
                plan: true,
            },
        });
    }

    async update(id: string, data: any) {
        return this.prisma.user.update({
            where: { id },
            data: {
                businessName: data.businessName,
                businessAddress: data.businessAddress,
                businessPhone: data.businessPhone,
                currency: data.currency,
                logoUrl: data.logoUrl,
            },
        });
    }
}
