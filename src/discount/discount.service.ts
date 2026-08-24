/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DiscountUsedDto } from './dto/discount-user.dto';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}
  async getAllDiscount() {
    const discounts = await this.prisma.discountCard.findMany({
      include: {
        user: {
          select: {
            phone: true,
            name: true,
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
            name: true,
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
  async registerDiscountUsage(dto: DiscountUsedDto) {
    const card = await this.prisma.discountCard.findUnique({
      where: {
        cardNumber: dto.cardNumber,
      },
    });

    if (!card) {
      throw new BadRequestException('Discount card not found');
    }

    const usedAt = dto.usedAt ? new Date(dto.usedAt) : new Date();

    await this.prisma.$transaction([
      // История
      this.prisma.discountUsage.create({
        data: {
          discountCardId: card.id,
          userId: card.userId,
          usedAt,
          receiptNumber: dto.receiptNumber,
          purchasedFrom: dto.purchasedFrom,
        },
      }),

      // Последнее использование
      this.prisma.discountCard.update({
        where: {
          id: card.id,
        },
        data: {
          lastDiscountUsedAt: usedAt,
        },
      }),
    ]);

    return {
      success: true,
      cardNumber: card.cardNumber,
      usedAt,
    };
  }
  async getFraudStatistics() {
    const weekAgo = new Date();

    weekAgo.setDate(weekAgo.getDate() - 7);

    const usages = await this.prisma.discountUsage.findMany({
      where: {
        usedAt: {
          gte: weekAgo,
        },
      },

      include: {
        discountCard: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                city: true,
              },
            },
          },
        },
      },

      orderBy: {
        usedAt: 'desc',
      },
    });

    const cards = new Map<
      string,
      {
        discountCardId: string;
        cardNumber: string;
        count: number;

        user: {
          id: string;
          name: string;
          phone: string | null;
        } | null;

        lastUsedAt: Date;

        usages: {
          id: string;
          usedAt: Date;
          receiptNumber: string | null;
          purchasedFrom: string | null;
        }[];
      }
    >();

    for (const usage of usages) {
      const card = usage.discountCard;

      const existing = cards.get(card.id);

      if (existing) {
        existing.count++;

        existing.usages.push({
          id: usage.id,
          usedAt: usage.usedAt,
          receiptNumber: usage.receiptNumber,
          purchasedFrom: usage.purchasedFrom,
        });

        if (usage.usedAt > existing.lastUsedAt) {
          existing.lastUsedAt = usage.usedAt;
        }

        continue;
      }

      cards.set(card.id, {
        discountCardId: card.id,
        cardNumber: card.cardNumber,
        count: 1,
        user: card.user,
        lastUsedAt: usage.usedAt,

        usages: [
          {
            id: usage.id,
            usedAt: usage.usedAt,
            receiptNumber: usage.receiptNumber,
            purchasedFrom: usage.purchasedFrom,
          },
        ],
      });
    }

    const allCards = Array.from(cards.values());

    const suspicious = allCards
      .filter((card) => card.count > 2)
      .sort((a, b) => b.count - a.count);

    return {
      periodDays: 7,

      totalUses: usages.length,

      cardsUsed: allCards.length,

      suspiciousCount: suspicious.length,

      suspicious,
    };
  }
  async useMyDiscount(userId: string) {
    const card = await this.prisma.discountCard.findUnique({
      where: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!card) {
      throw new BadRequestException('Дисконтная карта не найдена');
    }

    if (!card.isActive) {
      throw new BadRequestException('Дисконтная карта заблокирована');
    }

    if (
      !card.subscriptionActive ||
      !card.subscriptionExpiresAt ||
      card.subscriptionExpiresAt < new Date()
    ) {
      throw new BadRequestException('Подписка не активна');
    }

    const now = new Date();

    // 12 часов
    const BLOCK_TIME = 12 * 60 * 60 * 1000;

    if (card.lastDiscountUsedAt) {
      const nextAvailableAt = new Date(
        card.lastDiscountUsedAt.getTime() + BLOCK_TIME,
      );

      if (now < nextAvailableAt) {
        throw new BadRequestException({
          message:
            'Скидка уже использовалась. Повторное использование доступно через 12 часов.',
          nextAvailableAt,
        });
      }
    }

    await this.prisma.$transaction([
      this.prisma.discountUsage.create({
        data: {
          discountCardId: card.id,
          userId: card.userId,
          usedAt: now,
          source: 'APP_QR',
        },
      }),

      this.prisma.discountCard.update({
        where: {
          id: card.id,
        },
        data: {
          lastDiscountUsedAt: now,
        },
      }),
    ]);

    return {
      success: true,

      cardNumber: card.cardNumber,

      usedAt: now,

      nextAvailableAt: new Date(now.getTime() + BLOCK_TIME),
    };
  }
}
