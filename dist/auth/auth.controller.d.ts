import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
