/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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
    let discountCardId: string | null = null;
    let userId: string | null = null;

    const card = await this.prisma.discountCard.findUnique({
      where: {
        cardNumber: dto.cardNumber,
      },
    });

    if (card) {
      discountCardId = card.id;
      userId = card.userId;
    }

    // 1С может повторно отправить один и тот же чек
    if (dto.receiptNumber) {
      const existingPurchase = await this.prisma.purchase.findUnique({
        where: {
          receiptNumber: dto.receiptNumber,
        },
      });

      if (existingPurchase) {
        return {
          success: true,
          duplicate: true,
          purchase: existingPurchase,
        };
      }
    }

    const purchase = await this.prisma.purchase.create({
      data: {
        receiptNumber: dto.receiptNumber,
        purchasedAt: new Date(dto.purchasedAt),
        totalAmount: dto.totalAmount,

        cardNumber: dto.cardNumber,
        discountCardId,
        userId,

        purchasedFrom: dto.purchasedFrom,
      },
    });

    return {
      success: true,
      duplicate: false,
      purchase,
    };
  }
  async getFraudStatistics() {
    const weekAgo = new Date();

    weekAgo.setDate(weekAgo.getDate() - 7);

    const purchases = await this.prisma.purchase.findMany({
      where: {
        purchasedAt: {
          gte: weekAgo,
        },

        discountCardId: {
          not: null,
        },
      },

      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },

        discountCard: {
          select: {
            id: true,
            cardNumber: true,
            subscriptionActive: true,
            subscriptionExpiresAt: true,
          },
        },
      },

      orderBy: {
        purchasedAt: 'desc',
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

        purchases: {
          id: string;
          receiptNumber: string | null;
          totalAmount: number;
          purchasedAt: Date;
        }[];
      }
    >();

    for (const purchase of purchases) {
      if (!purchase.discountCard) {
        continue;
      }

      const cardId = purchase.discountCard.id;

      const existing = cards.get(cardId);

      if (existing) {
        existing.count++;

        existing.purchases.push({
          id: purchase.id,
          receiptNumber: purchase.receiptNumber,
          totalAmount: purchase.totalAmount,
          purchasedAt: purchase.purchasedAt,
        });

        if (purchase.purchasedAt > existing.lastUsedAt) {
          existing.lastUsedAt = purchase.purchasedAt;
        }

        continue;
      }

      cards.set(cardId, {
        discountCardId: cardId,

        cardNumber: purchase.discountCard.cardNumber,

        count: 1,

        user: purchase.user,

        lastUsedAt: purchase.purchasedAt,

        purchases: [
          {
            id: purchase.id,
            receiptNumber: purchase.receiptNumber,
            totalAmount: purchase.totalAmount,
            purchasedAt: purchase.purchasedAt,
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

      totalPurchases: purchases.length,

      cardsUsed: allCards.length,

      suspiciousCount: suspicious.length,

      suspicious,
    };
  }
}
