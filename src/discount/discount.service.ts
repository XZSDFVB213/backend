/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}
  async getAllDiscount() {
    const discounts = await this.prisma.discountCard.findMany();
    if (!discounts) {
      throw new Error('Discounts not found');
    }
  }
  async getDiscount(userId: string) {
    const discount = await this.prisma.discountCard.findUnique({
      where: {
        userId,
      },
    });

    if (!discount) {
      throw new Error('Discount card not found');
    }

    return discount;
  }
  async getMyCard(userId: string) {
    const myCard = await this.prisma.discountCard.findUnique({
      where: {
        userId,
      },
    });

    return myCard;
  }
}
