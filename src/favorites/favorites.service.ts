import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}
  async addToFavorite(userId: string, productId: string) {
    return this.prisma.favorite.upsert({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      create: {
        userId,
        productId,
      },
      update: {},
    });
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
}
