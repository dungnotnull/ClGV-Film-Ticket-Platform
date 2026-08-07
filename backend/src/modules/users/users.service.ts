import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserQueryDto } from './dto/user-query.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserMembershipDto } from './dto/update-user-membership.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Admin xem danh sách tất cả người dùng (hỗ trợ phân trang, lọc role, hạng thẻ, tìm kiếm)
  async findAll(query: UserQueryDto) {
    const { role, membershipTier, search, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      ...(role && { role }),
      ...(membershipTier && { membershipTier }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { fullName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          role: true,
          membershipTier: true,
          points: true,
          cgvCardBalance: true,
          isU22Verified: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      users,
    };
  }

  // Admin xem chi tiết người dùng
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        membershipTier: true,
        points: true,
        cgvCardBalance: true,
        isU22Verified: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            totalAmount: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
            showtime: {
              select: {
                movie: { select: { title: true } },
                cinema: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Không tìm thấy người dùng với ID này',
      });
    }

    return user;
  }

  // Admin cập nhật quyền (Role) của người dùng
  async updateRole(id: string, dto: UpdateUserRoleDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Không tìm thấy người dùng',
      });
    }

    return this.prisma.user.update({
      where: { id },
      data: { role: dto.role },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        updatedAt: true,
      },
    });
  }

  // Admin cập nhật hạng hội viên & điểm thưởng / số dư ví CGV Card
  async updateMembership(id: string, dto: UpdateUserMembershipDto) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Không tìm thấy người dùng',
      });
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.membershipTier && { membershipTier: dto.membershipTier }),
        ...(dto.points !== undefined && { points: dto.points }),
        ...(dto.cgvCardBalance !== undefined && { cgvCardBalance: dto.cgvCardBalance }),
        ...(dto.isU22Verified !== undefined && { isU22Verified: dto.isU22Verified }),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        membershipTier: true,
        points: true,
        cgvCardBalance: true,
        isU22Verified: true,
        updatedAt: true,
      },
    });
  }

  // Admin xóa người dùng
  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Không tìm thấy người dùng',
      });
    }

    await this.prisma.user.delete({ where: { id } });
    return {
      success: true,
      message: 'Xóa người dùng thành công',
    };
  }
}
