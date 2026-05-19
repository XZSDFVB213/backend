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
  Headers,
  Body,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { SendVerificationDto } from './dto/send-notification.dto';
@Controller('notifications')
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

  @Post('verification/send')
  sendVerification(
    @Body() dto: SendVerificationDto,
    @Headers('x-staff-key') staffKey: string,
  ) {
    if (staffKey !== process.env.STAFF_KEY) {
      console.log('staffKey:', staffKey);
      console.log('env:', process.env.STAFF_KEY);
      throw new ForbiddenException();
    }

    return this.notificationsService.sendVerificationCode(dto.phone);
  }
  @Post('broadcast')
  @UseGuards(JwtAuthGuard)
  async broadcast(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.createForAllUsers(dto);
  }
  @Get('unread')
  getUnread(@Req() req: any) {
    return this.notificationsService.getUnread(req.user.id);
  }

  @Get('unread/count')
  @UseGuards(JwtAuthGuard)
  getUnreadCount(@Req() req: any) {
    return this.notificationsService.getUnreadCount(req.user.id);
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.notificationsService.markAsRead(id, req.user.id);
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  markAllAsRead(@Req() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id);
  }
}
