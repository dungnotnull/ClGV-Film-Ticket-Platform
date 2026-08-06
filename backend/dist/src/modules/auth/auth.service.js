"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException({
                code: 'EMAIL_EXISTS',
                message: 'Email này đã được đăng ký trong hệ thống',
            });
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: registerDto.email,
                password: hashedPassword,
                fullName: registerDto.fullName,
                phone: registerDto.phone,
            },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async login(loginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: loginDto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException({
                code: 'UNAUTHORIZED',
                message: 'Email hoặc mật khẩu không chính xác',
            });
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException({
                code: 'UNAUTHORIZED',
                message: 'Email hoặc mật khẩu không chính xác',
            });
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        const { password, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async refreshToken(refreshTokenDto) {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshTokenDto.refreshToken },
            include: { user: true },
        });
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException({
                code: 'INVALID_REFRESH_TOKEN',
                message: 'Refresh token không hợp lệ hoặc đã hết hạn',
            });
        }
        const tokens = await this.generateTokens(tokenRecord.user.id, tokenRecord.user.email, tokenRecord.user.role);
        await this.prisma.refreshToken.delete({ where: { id: tokenRecord.id } });
        await this.saveRefreshToken(tokenRecord.user.id, tokens.refreshToken);
        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        };
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_SECRET') || 'clgv_jwt_super_secret_key_2026',
            expiresIn: '1d',
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_REFRESH_SECRET') || 'clgv_refresh_super_secret_key_2026',
            expiresIn: '7d',
        });
        return { accessToken, refreshToken };
    }
    async saveRefreshToken(userId, token) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        await this.prisma.refreshToken.create({
            data: {
                userId,
                token,
                expiresAt,
            },
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map