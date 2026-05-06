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
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}
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
