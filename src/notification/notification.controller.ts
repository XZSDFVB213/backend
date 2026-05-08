/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
  NotFoundException,
  Post,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationService) {}
  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Req() req: any) {
    try {
      return this.notificationsService.getAll(req.user.id);
    } catch (e: any) {
      throw new NotFoundException('Notifications not found', e);
    }
  }
  @Post('broadcast')
  async broadcast(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.createForAllUsers(dto);
  }
  @Get('unread')
  getUnread(@Req() req: any) {
    return this.notificationsService.getUnread(req.user.id);
  }

  @Get('unread/count')
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
