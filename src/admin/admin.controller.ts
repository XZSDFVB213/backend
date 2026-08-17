/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt/jwt.guard';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { AdminCreateProductDto } from './dto/admin-create-product.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('check')
  check(@Req() req: any) {
    return {
      success: true,
      message: 'Доступ администратора разрешён',
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      userId: req.user.id,
    };
  }

  @Get('user')
  findUser(@Query('phone') phone: string) {
    return this.adminService.findUser(phone);
  }

  @Post('subscription')
  activateSubscription(
    @Body()
    dto: {
      phone: string;
      days: number;
    },
  ) {
    return this.adminService.activateSubscription(dto.phone, dto.days);
  }

  @Post('reset-password')
  resetPassword(
    @Body()
    dto: {
      phone: string;
      newPassword: string;
    },
  ) {
    return this.adminService.resetPassword(dto.phone, dto.newPassword);
  }
  @Post('product')
  createProduct(@Body() dto: AdminCreateProductDto) {
    return this.adminService.createProduct(dto);
  }
}
