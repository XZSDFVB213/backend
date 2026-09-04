import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminStatsController } from './stats/admin-stats.controller';
import { AdminStatsService } from './stats/admin-stats.service';

@Module({
  controllers: [AdminController, AdminStatsController],

  providers: [AdminService, AdminGuard, PrismaService, AdminStatsService],
})
export class AdminModule {}
