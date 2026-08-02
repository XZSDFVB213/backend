/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchaseService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePurchaseDto) {
    const card = await this.prisma.discountCard.findUnique({
      where: {
        cardNumber: dto.cardNumber,
      },
    });

    let discountCardId: string | null = null;
    let userId: string | null = null;

    if (card) {
      discountCardId = card.id;

      userId = card.userId;
    }

    return this.prisma.purchase.create({
      data: {
        cardNumber: dto.cardNumber,

        discountCardId,

        userId,

        purchasedFrom: dto.purchasedFrom,

        receiptNumber: dto.receiptNumber,

        totalAmount: dto.totalAmount,

        purchasedAt: new Date(dto.purchasedAt),
      },
    });
  }
}
