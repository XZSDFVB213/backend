/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Controller, Get, Req, UseGuards, Post, Body } from '@nestjs/common';
import { DiscountService } from './discount.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { DiscountUsedDto } from './dto/discount-user.dto';

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
  @Post('activate')

  activate(@Body() dto: { phone: string; days: number }) {
    return this.discountService.activateSubscriptionOnCard(dto.phone, dto.days);
  }
  @Post('used')
  registerUsage(@Body() dto: DiscountUsedDto) {
    return this.discountService.registerDiscountUsage(dto);
  }
  @Get('fraud')
  getFraudStatistics() {
    return this.discountService.getFraudStatistics();
  }
}
