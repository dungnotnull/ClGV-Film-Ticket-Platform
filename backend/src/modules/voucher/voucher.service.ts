import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';

@Injectable()
export class VoucherService {
  constructor(private readonly prisma: PrismaService) {}

  async createVoucher(dto: CreateVoucherDto) {
    const existing = await this.prisma.voucher.findUnique({ where: { code: dto.code } });
    if (existing) {
      throw new ConflictException(`Mã Voucher ${dto.code} đã tồn tại`);
    }

    return this.prisma.voucher.create({
      data: {
        code: dto.code.toUpperCase(),
        title: dto.title,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue || 0,
        expiresAt: new Date(dto.expiresAt),
      },
    });
  }

  async claimVoucher(userId: string, code: string) {
    const voucher = await this.prisma.voucher.findUnique({ where: { code: code.toUpperCase() } });
    if (!voucher || voucher.status !== 'ACTIVE') {
      throw new NotFoundException('Mã voucher không tồn tại hoặc đã hết hiệu lực');
    }

    if (new Date() > voucher.expiresAt) {
      throw new BadRequestException('Mã voucher đã quá hạn sử dụng');
    }

    const existingClaim = await this.prisma.userVoucher.findUnique({
      where: {
        userId_voucherId: {
          userId,
          voucherId: voucher.id,
        },
      },
    });

    if (existingClaim) {
      throw new ConflictException('Bạn đã lưu mã voucher này vào ví trước đó');
    }

    return this.prisma.userVoucher.create({
      data: {
        userId,
        voucherId: voucher.id,
      },
      include: {
        voucher: true,
      },
    });
  }

  async getUserWallet(userId: string) {
    return this.prisma.userVoucher.findMany({
      where: { userId, isUsed: false },
      include: { voucher: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
