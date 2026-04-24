import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        token: string;
    }>;
    register(dto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string;
        createdAt: Date;
    }>;
}
