// src/frontol/frontol.module.ts
import { Module } from '@nestjs/common';
import { FrontolController } from './frontol.controller';
import { FrontolService } from './frontol.service';
import { NotificationModule } from '../notification/notification.module'; // важно!

@Module({
  imports: [NotificationModule],
  controllers: [FrontolController],
  providers: [FrontolService],
  exports: [FrontolService],
})
export class FrontolModule {}
