import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminStatsService {
  constructor(private prisma: PrismaService) {}

  private startOfTodayMoscow() {
    const MOSCOW_OFFSET = 3 * 60 * 60 * 1000;

    const now = new Date();

    const moscowNow = new Date(now.getTime() + MOSCOW_OFFSET);

    const midnight = Date.UTC(
      moscowNow.getUTCFullYear(),
      moscowNow.getUTCMonth(),
      moscowNow.getUTCDate(),
      0,
      0,
      0,
      0,
    );

    return new Date(midnight - MOSCOW_OFFSET);
  }

  async getSummary() {
    const now = new Date();

    const today = this.startOfTodayMoscow();

    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      registeredToday,
      registeredWeek,
      registeredMonth,
      totalPurchases,
    ] = await Promise.all([
      this.prisma.user.count(),

      this.prisma.user.count({
        where: {
          createdAt: {
            gte: today,
          },
        },
      }),

      this.prisma.user.count({
        where: {
          createdAt: {
            gte: weekAgo,
          },
        },
      }),

      this.prisma.user.count({
        where: {
          createdAt: {
            gte: monthAgo,
          },
        },
      }),

      this.prisma.purchase.count({
        where: {
          userId: {
            not: null,
          },
        },
      }),
    ]);

    const uniqueUsersResult = await this.prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(DISTINCT "userId")::int AS count
        FROM "Purchase"
        WHERE "userId" IS NOT NULL
      `;

    return {
      totalUsers,
      registeredToday,
      registeredWeek,
      registeredMonth,

      totalPurchaseUses: totalPurchases,

      usersUsedSubscription: uniqueUsersResult[0]?.count ?? 0,
    };
  }

  async getUsers(page = 1, limit = 20) {
    page = Math.max(page, 1);
    limit = Math.min(Math.max(limit, 1), 50);

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          name: true,
          phone: true,
          city: true,
          createdAt: true,

          discountCard: {
            select: {
              subscriptionActive: true,
              subscriptionExpiresAt: true,
              lastDiscountUsedAt: true,
            },
          },
        },
      }),

      this.prisma.user.count(),
    ]);

    return {
      users,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSubscriptionUsage(page = 1, limit = 20) {
    page = Math.max(page, 1);
    limit = Math.min(Math.max(limit, 1), 50);

    const offset = (page - 1) * limit;

    const users = await this.prisma.$queryRaw<
      {
        id: string;
        name: string;
        phone: string | null;
        city: string;
        usesCount: number;
        lastUsedAt: Date;
      }[]
    >`
        SELECT
          u.id,
          u.name,
          u.phone,
          u.city::text AS city,
          COUNT(p.id)::int AS "usesCount",
          MAX(p."purchasedAt") AS "lastUsedAt"

        FROM "User" u

        INNER JOIN "Purchase" p
          ON p."userId" = u.id

        GROUP BY
          u.id,
          u.name,
          u.phone,
          u.city

        ORDER BY
          COUNT(p.id) DESC,
          MAX(p."purchasedAt") DESC

        LIMIT ${limit}
        OFFSET ${offset}
      `;

    const totalResult = await this.prisma.$queryRaw<{ count: number }[]>`
        SELECT
          COUNT(DISTINCT "userId")::int AS count

        FROM "Purchase"

        WHERE "userId" IS NOT NULL
      `;

    const total = totalResult[0]?.count ?? 0;

    return {
      users,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
