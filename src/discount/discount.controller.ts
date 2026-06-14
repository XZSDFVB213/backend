/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';

@Controller('discount')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}
  @Get('all')
  getAllDiscount() {
    return this.discountService.getAllDiscount();
  }
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMyCard(@Req() req: any) {
    return this.discountService.getMyCard(req.user.id);
  }
}
