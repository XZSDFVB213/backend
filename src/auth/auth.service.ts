/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { SmsService } from 'src/sms/sms.service';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private smsService: SmsService,
  ) {}
  async requestPasswordReset(dto: RequestResetDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (!user) {
      console.log(`⚠️ Пользователь с номером ${dto.phone} не найден`);
      return { message: 'Если аккаунт существует, вам отправлен SMS-код' };
    }

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

    const hashedCode = await bcrypt.hash(resetCode, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: hashedCode,
        resetCodeExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    // Вывод кода в консоль
    console.log('\n🔥🔥🔥 КОД ДЛЯ СБРОСА 🔥🔥🔥');
    console.log(`📱 Телефон: ${dto.phone}`);
    console.log(`🔢 Код: ${resetCode}`);
    console.log('🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥\n');

    const sent = await this.smsService.sendResetCode(user.phone!, resetCode);

    if (!sent) {
      console.warn('⚠️ SMS не был отправлен');
    }

    return {
      message: 'SMS с кодом отправлен на ваш номер телефона',
    };
  }

  // ==================== СБРОС ПАРОЛЯ ====================
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetCodeExpires: { gt: new Date() },
      },
    });

    if (!user?.resetCode) {
      throw new BadRequestException('Код недействителен или истёк');
    }

    const isValid = await bcrypt.compare(dto.code, user.resetCode);
    if (!isValid) {
      throw new BadRequestException('Неверный код');
    }

    const newHash = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHash,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    return { message: 'Пароль успешно изменён' };
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        phone: dto.phone,
      },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    const valid = bcrypt.compareSync(dto.password, user.password);
    if (!valid) {
      throw new BadRequestException('Пароль не верный');
    }
    const token = this.jwt.sign({ id: user.id });
    const { password, ...safeUser } = user;
    return {
      token,
      user: safeUser,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: {
        phone: dto.phone,
      },
    });
    if (existing) {
      throw new Error('User already exists');
    }
    const hash = await bcrypt.hash(dto.password, 5);
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        name: dto.name,
        password: hash,
        acceptedPolicy: dto.acceptedPolicy,
        acceptedTerms: dto.agree,
        city: dto.city,
      },
    });
    const { password, ...result } = user;
    return result;
  }
}
