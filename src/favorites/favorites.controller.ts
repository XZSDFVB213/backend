/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import type { Request } from 'express';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}
  @UseGuards(JwtAuthGuard)
  @Post(':productId')
  addToFavorite(@Param('productId') productId: string, @Req() req: Request) {
    const userId: string = (req.user as { id: string }).id;
    return this.favoritesService.addToFavorite(userId, productId);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':favoriteId')
  remove(@Param('favoriteId') favoriteId: string, @Req() req: any) {
    const userId = req.user.id;
    return this.favoritesService.removeFromFavorites(userId, favoriteId);
  }
  @UseGuards(JwtAuthGuard)
  @Get()
  getFavorites(@Req() req: Request) {
    const userId: string = (req.user as { id: string }).id;
    return this.favoritesService.getFavorites(userId);
  }
}
