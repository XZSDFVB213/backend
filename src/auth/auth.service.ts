/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestResetDto } from './dto/request-reset.dto';
import { MailService } from 'src/sms/sms.service';
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mailService: MailService,
  ) {}
  private generateAccessToken(userId: string) {
    return this.jwt.sign(
      {
        id: userId,
        type: 'access',
      },
      {
        expiresIn: '14d',
      },
    );
  }

  private generateRefreshToken(userId: string) {
    return this.jwt.sign(
      {
        id: userId,
        type: 'refresh',
      },
      {
        expiresIn: '120d',
      },
    );
  }

  private async createTokens(userId: string) {
    const token = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: hashedRefreshToken,

        refreshTokenExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      token,
      refreshToken,
    };
  }
  async requestPasswordReset(dto: RequestResetDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return {
        message: 'Если аккаунт существует, на вашу почту отправлен код',
      };
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

    this.logger.log(`🔑 Код сброса для ${dto.email}: ${resetCode}`);

    // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←
    // Отправляем письмо в фоне, не ждём ответа
    this.mailService
      .sendResetCode(user.email!, resetCode)
      .then((sent) => {
        if (!sent) {
          this.logger.warn(`Не удалось отправить письмо на ${dto.email}`);
        }
      })
      .catch((err) => {
        this.logger.error(`Ошибка при отправке письма ${dto.email}:`, err);
      });
    // ←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←

    return {
      message: 'Если аккаунт существует, на вашу почту отправлен код',
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user?.resetCode || !user.resetCodeExpires) {
      throw new BadRequestException('Код недействителен или истёк');
    }

    if (user.resetCodeExpires < new Date()) {
      throw new BadRequestException('Код истёк');
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
      throw new BadRequestException('Пользователь не найден');
    }

    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) {
      throw new BadRequestException('Пароль не верный');
    }

    const tokens = await this.createTokens(user.id);

    const { password, refreshToken, resetCode, ...safeUser } = user;

    return {
      ...tokens,
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
      throw new BadRequestException('User already exists');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        name: dto.name,
        password: hash,
        acceptedPolicy: dto.acceptedPolicy,
        acceptedTerms: dto.agree,
        email: dto.email,
        city: dto.city,

        discountCard: {
          create: {
            cardNumber: crypto.randomUUID(),
          },
        },
      },
      include: {
        discountCard: true,
      },
    });

    // 🔥 генерируем JWT сразу после регистрации
    const tokens = await this.createTokens(user.id);

    const { password, refreshToken, resetCode, ...safeUser } = user;

    return {
      ...tokens,
      user: safeUser,
    };
  }
  async refresh(oldRefreshToken: string) {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token отсутствует');
    }

    let payload: {
      id: string;
      type: string;
    };

    try {
      payload = this.jwt.verify(oldRefreshToken);
    } catch {
      throw new UnauthorizedException('Refresh token истёк или недействителен');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Неверный тип токена');
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.id,
      },
    });

    if (!user || !user.refreshToken || !user.refreshTokenExpiresAt) {
      throw new UnauthorizedException('Refresh token недействителен');
    }

    if (user.refreshTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token истёк');
    }

    const valid = await bcrypt.compare(oldRefreshToken, user.refreshToken);

    if (!valid) {
      throw new UnauthorizedException('Refresh token недействителен');
    }

    // Ротация:
    // выдаём и access, и новый refresh
    return this.createTokens(user.id);
  }
}
