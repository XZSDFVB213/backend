import { Module } from '@nestjs/common';

import { AdminController } from './admin.controller';
import { AdminGuard } from './guards/admin.guard';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AdminController],

  providers: [AdminService, AdminGuard, PrismaService],
})
export class AdminModule {}
