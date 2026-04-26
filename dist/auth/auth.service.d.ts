import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    login(dto: LoginDto): Promise<{
        token: string;
        user: {
            name: string;
            email: string;
            id: string;
            createdAt: Date;
        };
    }>;
    register(dto: RegisterDto): Promise<{
        name: string;
        email: string;
        id: string;
        createdAt: Date;
    }>;
}
