import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AdminCreateProductDto } from './dto/admin-create-product.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async findUser(phone: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        phone,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        city: true,

        discountCard: {
          select: {
            id: true,
            cardNumber: true,
            subscriptionActive: true,
            subscriptionExpiresAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    return user;
  }

  async activateSubscription(phone: string, days: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        phone,
      },
      include: {
        discountCard: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    if (!user.discountCard) {
      throw new BadRequestException('У пользователя нет дисконтной карты');
    }

    const now = new Date();

    let startDate = now;

    if (
      user.discountCard.subscriptionExpiresAt &&
      user.discountCard.subscriptionExpiresAt > now
    ) {
      startDate = new Date(user.discountCard.subscriptionExpiresAt);
    }

    const expiresAt = new Date(startDate);

    expiresAt.setDate(expiresAt.getDate() + days);

    return this.prisma.discountCard.update({
      where: {
        id: user.discountCard.id,
      },
      data: {
        subscriptionActive: true,
        subscriptionExpiresAt: expiresAt,
      },
    });
  }

  async resetPassword(phone: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException(
        'Пароль должен содержать минимум 6 символов',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        phone,
      },
    });

    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hash,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    return {
      success: true,
      message: 'Пароль успешно изменён',
    };
  }
  async createProduct(dto: AdminCreateProductDto) {
    const product = await this.prisma.product.create({
      data: {
        title: dto.title,
        description: dto.description,
        price: dto.price,
        image: dto.image,
        category: dto.category,
        subcategory: dto.subcategory,
        stock: dto.stock,
      },
    });

    return {
      success: true,
      message: 'Товар добавлен',
      product,
    };
  }
}
