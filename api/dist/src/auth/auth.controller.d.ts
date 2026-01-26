import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<{
        user: {
            email: string;
            name: string;
            role: import("../users/entities/user.entity").UserRole;
            id: string;
        } & {
            role: "admin";
        };
        accessToken: string;
    }>;
    login(body: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import("../users/entities/user.entity").UserRole;
        };
        accessToken: string;
    }>;
}
