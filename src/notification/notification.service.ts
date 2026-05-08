/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
