/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { VerifyCodeDto } from './dto/veryfy.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

  // Создать уведомление
  async create(userId: string, dto: CreateNotificationDto) {
    const notification = await this.prisma.notification.create({
      data: {
        userId,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data ?? null,
      },
    });
    if (!notification) {
      new Error('Notification not created');
    }
    return notification;
  }

  // Получить все уведомления пользователя
  async getAll(userId: string, skip = 0, take = 30) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    });
    return notifications;
  }

  // Получить только непрочитанные
  async getUnread(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    });
    return notifications;
  }

  // Отметить как прочитанное
  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.updateMany({
      where: { id, userId }, // защита от изменения чужих уведомлений
      data: { isRead: true },
    });
    return notification;
  }

  // Отметить все как прочитанные
  async markAllAsRead(userId: string) {
    const notification = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return notification;
  }

  // Количество непрочитанных
  async getUnreadCount(userId: string): Promise<number> {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return count;
  }
  // notifications.service.ts
  async createForAllUsers(dto: CreateNotificationDto) {
    // Получаем всех пользователей
    const users = await this.prisma.user.findMany({
      select: { id: true },
    });

    if (users.length === 0) return;

    const notifications = users.map((user) => ({
      userId: user.id,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data ?? null,
      isRead: false,
    }));

    // Массовое создание — очень быстро
    return this.prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true,
    });
  }
  async sendVerificationCode(phone: string) {
    const user = await this.prisma.user.findFirst({
      where: { phone },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    return this.create(user.id, {
      type: 'verification',
      title: 'Код подтверждения',
      message: 'Покажите код сотруднику',

      data: {
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  }
  async verifyCode(dto: VerifyCodeDto) {
    const { phone, code } = dto;
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });
    if (!user) {
      return { verified: false };
    }
    // 1. найти код
    const notification = await this.prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: 'verification',
        data: {
          path: ['code'],
          equals: code,
        },
      },
    });

    if (!notification) {
      return { verified: false };
    }
    const now = new Date();

    const active =
      user.subscriptionExpiresAt && user.subscriptionExpiresAt > now;

    return {
      verified: true,
      user: {
        id: user.id,
        phone: user.phone,
      },
      subscription: {
        active,
        expiresAt: user.subscriptionExpiresAt ?? null,
      },
    };
  }
  async sendDiscountCode(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // подписка неактивна
    if (
      !user.subscriptionExpiresAt ||
      user.subscriptionExpiresAt < new Date()
    ) {
      throw new Error('Subscription inactive');
    }

    // проверка 12 часов
    if (user.lastDiscountUsedAt) {
      const diff = Date.now() - new Date(user.lastDiscountUsedAt).getTime();

      const twelveHours = 12 * 60 * 60 * 1000;

      if (diff < twelveHours) {
        throw new Error('Discount already used');
      }
    }

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    return this.create(user.id, {
      type: 'discount',
      title: 'Подтверждение скидки',
      message: 'Покажите код кассиру',

      data: {
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });
  }
  async verifyDiscountCode(dto: VerifyCodeDto) {
    const { phone, code } = dto;

    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return {
        success: false,
        message: 'Пользователь не найден',
      };
    }

    // подписка
    if (
      !user.subscriptionExpiresAt ||
      user.subscriptionExpiresAt < new Date()
    ) {
      return {
        success: false,
        message: 'Подписка не активна',
      };
    }

    // ограничение 12 часов
    if (user.lastDiscountUsedAt) {
      const diff = Date.now() - new Date(user.lastDiscountUsedAt).getTime();

      const twelveHours = 12 * 60 * 60 * 1000;

      if (diff < twelveHours) {
        return {
          success: false,
          message: 'Скидка уже использована',
        };
      }
    }

    // ищем код
    const notification = await this.prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: 'discount',
        data: {
          path: ['code'],
          equals: code,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!notification) {
      return {
        success: false,
        message: 'Неверный код',
      };
    }

    const data: any = notification.data;

    if (new Date(data.expiresAt) < new Date()) {
      return {
        success: false,
        message: 'Код истек',
      };
    }

    // успех
    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        lastDiscountUsedAt: new Date(),
      },
    });

    return {
      success: true,
      discount: 30,
    };
  }
}
