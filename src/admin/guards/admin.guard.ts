/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user?.id;

    if (!userId) {
      throw new ForbiddenException('Нет доступа');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        phone: true,
      },
    });

    if (!user?.phone) {
      throw new ForbiddenException('Нет доступа');
    }

    const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

    const currentPhone = normalizePhone(user.phone);

    const adminPhone = normalizePhone(process.env.ADMIN_PHONE ?? '');

    if (!adminPhone || currentPhone !== adminPhone) {
      throw new ForbiddenException('Доступ только для администратора');
    }

    return true;
  }
}
