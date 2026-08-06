import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            membershipTier: import(".prisma/client").$Enums.MembershipTier;
            points: number;
            cgvCardBalance: number;
            isU22Verified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            fullName: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.Role;
            membershipTier: import(".prisma/client").$Enums.MembershipTier;
            points: number;
            cgvCardBalance: number;
            isU22Verified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getMe(user: any): Promise<any>;
}
