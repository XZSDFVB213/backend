import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}
  async addToFavorite(userId: string, productId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      return { success: true, alreadyExists: true, message: 'already_exists' };
    }

    const favorite = await this.prisma.favorite.create({
      data: { userId, productId },
    });

    return { success: true, alreadyExists: false, favorite };
  }
  async removeFromFavorites(userId: string, favoriteId: string) {
    return this.prisma.favorite.delete({
      where: {
        id: favoriteId,
        userId, // защита что удаляет только своё
      },
    });
  }
  async getFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });
  }
  async getFavoriteCount(userId: string) {
    return this.prisma.favorite.count({
      where: { userId },
    });
  }
}
