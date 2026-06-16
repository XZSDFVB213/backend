/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}
  async getAllDiscount() {
    const discounts = await this.prisma.discountCard.findMany({
      include: {
        user: {
          select: {
            phone: true,
          },
        },
      },
    });
    if (!discounts) {
      throw new Error('Discounts not found');
    }
    return discounts;
  }
  async getDiscount(userId: string) {
    const discount = await this.prisma.discountCard.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            phone: true,
          },
        },
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
  async activateSubscriptionOnCard(phone: string, days: number) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
      include: { discountCard: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (!user.discountCard) {
      throw new BadRequestException('Discount card not found');
    }

    const expires = new Date();
    expires.setDate(expires.getDate() + days);

    return this.prisma.discountCard.update({
      where: { id: user.discountCard.id },
      data: {
        subscriptionActive: true,
        subscriptionExpiresAt: expires,
      },
    });
  }
}
