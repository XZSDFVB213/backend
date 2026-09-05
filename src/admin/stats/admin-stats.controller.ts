import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AdminStatsService } from './admin-stats.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { OwnerGuard } from '../guards/owner.guard';

@Controller('admin/stats')
@UseGuards(JwtAuthGuard, OwnerGuard)
export class AdminStatsController {
  constructor(private statsService: AdminStatsService) {}

  @Get('summary')
  getSummary() {
    return this.statsService.getSummary();
  }

  @Get('users')
  getUsers(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.statsService.getUsers(Number(page), Number(limit));
  }

  @Get('subscription-usage')
  getSubscriptionUsage(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.statsService.getSubscriptionUsage(Number(page), Number(limit));
  }
}
