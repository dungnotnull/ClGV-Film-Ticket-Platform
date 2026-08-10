import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { ApplyVoucherDto } from './dto/apply-voucher.dto';
import { AssignVoucherDto } from './dto/assign-voucher.dto';
import { BannerStatus } from '@prisma/client';

@Injectable()
export class VoucherService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Admin: Tạo mới Voucher giảm giá
   */
  async createVoucher(dto: CreateVoucherDto) {
    const existing = await this.prisma.voucher.findUnique({ where: { code: dto.code.toUpperCase() } });
    if (existing) {
      throw new ConflictException(`Mã Voucher ${dto.code} đã tồn tại trong hệ thống`);
    }

    return this.prisma.voucher.create({
      data: {
        code: dto.code.toUpperCase(),
        title: dto.title,
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        minOrderValue: dto.minOrderValue || 0,
        maxDiscountAmount: dto.maxDiscountAmount || null,
        status: dto.status || BannerStatus.ACTIVE,
        expiresAt: new Date(dto.expiresAt),
      },
    });
  }

  /**
   * Admin: Lấy danh sách tất cả Voucher (Hỗ trợ phân trang, tìm kiếm, lọc trạng thái)
   */
  async getAllVouchersAdmin(query: { search?: string; status?: BannerStatus; page?: number; limit?: number }) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { title: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.voucher.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              userVouchers: true,
              bookings: true,
            },
          },
        },
      }),
      this.prisma.voucher.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Admin: Xem chi tiết 1 Voucher kèm thống kê số lượt đã lưu ví và số lượt đã sử dụng
   */
  async getVoucherByIdAdmin(id: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            userVouchers: true,
            bookings: true,
          },
        },
      },
    });

    if (!voucher) {
      throw new NotFoundException(`Không tìm thấy Voucher với ID: ${id}`);
    }

    // Thống kê số lượng người dùng đã sử dụng voucher này
    const usedCount = await this.prisma.userVoucher.count({
      where: { voucherId: id, isUsed: true },
    });

    return {
      ...voucher,
      stats: {
        totalClaimed: voucher._count.userVouchers,
        totalUsed: usedCount,
        totalBookingsApplied: voucher._count.bookings,
      },
    };
  }

  /**
   * Admin: Cập nhật thông tin Voucher
   */
  async updateVoucher(id: string, dto: UpdateVoucherDto) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id } });
    if (!voucher) {
      throw new NotFoundException(`Không tìm thấy Voucher với ID: ${id}`);
    }

    if (dto.code && dto.code.toUpperCase() !== voucher.code) {
      const existing = await this.prisma.voucher.findUnique({ where: { code: dto.code.toUpperCase() } });
      if (existing) {
        throw new ConflictException(`Mã Voucher ${dto.code} đã tồn tại trong hệ thống`);
      }
    }

    return this.prisma.voucher.create ? this.prisma.voucher.update({
      where: { id },
      data: {
        ...(dto.code && { code: dto.code.toUpperCase() }),
        ...(dto.title && { title: dto.title }),
        ...(dto.discountType && { discountType: dto.discountType }),
        ...(dto.discountValue !== undefined && { discountValue: dto.discountValue }),
        ...(dto.minOrderValue !== undefined && { minOrderValue: dto.minOrderValue }),
        ...(dto.maxDiscountAmount !== undefined && { maxDiscountAmount: dto.maxDiscountAmount }),
        ...(dto.status && { status: dto.status }),
        ...(dto.expiresAt && { expiresAt: new Date(dto.expiresAt) }),
      },
    }) : null;
  }

  /**
   * Admin: Xóa Voucher (Nếu đã có đơn hàng sử dụng thì tự động chuyển sang INACTIVE)
   */
  async deleteVoucher(id: string) {
    const voucher = await this.prisma.voucher.findUnique({
      where: { id },
      include: {
        _count: {
          select: { bookings: true, userVouchers: true },
        },
      },
    });

    if (!voucher) {
      throw new NotFoundException(`Không tìm thấy Voucher với ID: ${id}`);
    }

    if (voucher._count.bookings > 0) {
      // Đã có đơn hàng sử dụng, chuyển trạng thái INACTIVE để đảm bảo toàn vẹn dữ liệu đơn hàng cũ
      return this.prisma.voucher.update({
        where: { id },
        data: { status: BannerStatus.INACTIVE },
      });
    }

    return this.prisma.voucher.delete({ where: { id } });
  }

  /**
   * Admin: Phát tặng trực tiếp mã giảm giá vào ví người dùng
   */
  async assignVouchersToUsers(dto: AssignVoucherDto) {
    const voucher = await this.prisma.voucher.findUnique({ where: { id: dto.voucherId } });
    if (!voucher) {
      throw new NotFoundException(`Không tìm thấy Voucher với ID: ${dto.voucherId}`);
    }

    const data = dto.userIds.map((userId) => ({
      userId,
      voucherId: dto.voucherId,
    }));

    // Bỏ qua các bản ghi trùng lặp (nếu người dùng đã có voucher này trong ví)
    const result = await this.prisma.userVoucher.createMany({
      data,
      skipDuplicates: true,
    });

    return {
      message: `Phát tặng thành công cho ${result.count} người dùng`,
      count: result.count,
    };
  }

  /**
   * Khách hàng: Lấy danh sách Voucher công khai đang phát hành (status=ACTIVE, chưa hết hạn)
   */
  async getAvailableVouchers(userId?: string) {
    const now = new Date();

    const vouchers = await this.prisma.voucher.findMany({
      where: {
        status: BannerStatus.ACTIVE,
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: 'asc' },
    });

    if (!userId) {
      return vouchers.map((v) => ({ ...v, isClaimed: false }));
    }

    // Kiểm tra danh sách voucher đã được user lưu vào ví
    const userVouchers = await this.prisma.userVoucher.findMany({
      where: { userId },
      select: { voucherId: true },
    });

    const claimedVoucherIds = new Set(userVouchers.map((uv) => uv.voucherId));

    return vouchers.map((v) => ({
      ...v,
      isClaimed: claimedVoucherIds.has(v.id),
    }));
  }

  /**
   * Khách hàng: Nhập mã để lưu voucher vào ví cá nhân
   */
  async claimVoucher(userId: string, code: string) {
    if (!code) {
      throw new BadRequestException('Vui lòng nhập mã giảm giá');
    }

    const voucher = await this.prisma.voucher.findUnique({ where: { code: code.toUpperCase() } });
    if (!voucher || voucher.status !== BannerStatus.ACTIVE) {
      throw new NotFoundException('Mã voucher không tồn tại hoặc đã bị vô hiệu hóa');
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

  /**
   * Khách hàng: Xem danh sách ví voucher cá nhân (Hỗ trợ lọc theo trạng thái UNUSED / USED / EXPIRED)
   */
  async getUserWallet(userId: string, filterStatus?: 'UNUSED' | 'USED' | 'EXPIRED') {
    const userVouchers = await this.prisma.userVoucher.findMany({
      where: { userId },
      include: { voucher: true },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    const result = userVouchers.map((uv) => {
      let walletStatus: 'UNUSED' | 'USED' | 'EXPIRED' = 'UNUSED';
      if (uv.isUsed) {
        walletStatus = 'USED';
      } else if (now > uv.voucher.expiresAt) {
        walletStatus = 'EXPIRED';
      }

      return {
        id: uv.id,
        voucherId: uv.voucherId,
        isUsed: uv.isUsed,
        usedAt: uv.usedAt,
        claimedAt: uv.createdAt,
        walletStatus,
        voucher: uv.voucher,
      };
    });

    if (filterStatus) {
      return result.filter((item) => item.walletStatus === filterStatus);
    }

    return result;
  }

  /**
   * Khách hàng: Thẩm định / Xem trước tiền giảm giá Voucher cho đơn hàng trước khi checkout
   */
  async applyVoucherPreview(userId: string, dto: ApplyVoucherDto) {
    const code = dto.code.toUpperCase();
    const voucher = await this.prisma.voucher.findUnique({ where: { code } });

    if (!voucher || voucher.status !== BannerStatus.ACTIVE) {
      throw new NotFoundException(`Mã giảm giá "${code}" không hợp lệ hoặc không tồn tại`);
    }

    const now = new Date();
    if (now > voucher.expiresAt) {
      throw new BadRequestException(`Mã giảm giá "${code}" đã hết hạn vào ngày ${voucher.expiresAt.toLocaleDateString('vi-VN')}`);
    }

    if (dto.orderAmount < voucher.minOrderValue) {
      throw new BadRequestException(
        `Đơn hàng chưa đạt giá trị tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')} VND để sử dụng mã này`,
      );
    }

    // Kiểm tra ví voucher của người dùng (nếu có)
    const userVoucher = await this.prisma.userVoucher.findUnique({
      where: {
        userId_voucherId: {
          userId,
          voucherId: voucher.id,
        },
      },
    });

    if (userVoucher && userVoucher.isUsed) {
      throw new BadRequestException(`Bạn đã sử dụng mã giảm giá này trước đó`);
    }

    // Tính toán số tiền được giảm giá VND (Integer)
    let discountAmount = 0;

    if (voucher.discountType === 'FIXED_AMOUNT') {
      discountAmount = voucher.discountValue;
    } else if (voucher.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((dto.orderAmount * voucher.discountValue) / 100);
      if (voucher.maxDiscountAmount && discountAmount > voucher.maxDiscountAmount) {
        discountAmount = voucher.maxDiscountAmount;
      }
    }

    // Số tiền giảm không vượt quá tổng đơn
    if (discountAmount > dto.orderAmount) {
      discountAmount = dto.orderAmount;
    }

    const finalAmount = dto.orderAmount - discountAmount;

    return {
      valid: true,
      voucherId: voucher.id,
      code: voucher.code,
      title: voucher.title,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      discountAmount,
      orderAmount: dto.orderAmount,
      finalAmount,
    };
  }
}
