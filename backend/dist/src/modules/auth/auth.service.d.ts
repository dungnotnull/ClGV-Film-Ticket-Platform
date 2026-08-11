import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
            membershipTier: import(".prisma/client").$Enums.MembershipTier;
            points: number;
            cgvCardBalance: number;
            isU22Verified: boolean;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string | null;
            email: string;
            fullName: string;
            role: import(".prisma/client").$Enums.Role;
            membershipTier: import(".prisma/client").$Enums.MembershipTier;
            points: number;
            cgvCardBalance: number;
            isU22Verified: boolean;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
    private saveRefreshToken;
}
