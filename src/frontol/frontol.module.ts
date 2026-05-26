// src/frontol/frontol.module.ts
import { Module } from '@nestjs/common';
import { FrontolController } from './frontol.controller';
import { FrontolService } from './frontol.service';
import { NotificationModule } from '../notification/notification.module'; // важно!
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [NotificationModule],
  controllers: [FrontolController],
  providers: [FrontolService, NotificationService, PrismaService],
  exports: [FrontolService],
})
export class FrontolModule {}
