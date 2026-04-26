import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from "../prisma/prisma.service";
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        name: string;
        email: string;
        password: string;
        id: string;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        email: string;
        id: string;
        createdAt: Date;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): string;
    remove(id: number): string;
}
