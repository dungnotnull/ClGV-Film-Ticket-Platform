import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MembershipTier } from '@prisma/client';
import { RedeemPointsDto, RewardType } from './dto/redeem-points.dto';

@Injectable()
export class MembershipService {
  constructor(private readonly prisma: PrismaService) {}

  // Lịch sử điểm thưởng và thông tin hạng hội viên CGV
  async getHistory(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        membershipTier: true,
        points: true,
        cgvCardBalance: true,
        isU22Verified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Người dùng không tồn tại',
      });
    }

    // Lấy lịch sử các đơn hàng đã tích điểm
    const paidBookings = await this.prisma.booking.findMany({
      where: { userId, status: 'PAID' },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        showtime: {
          select: {
            movie: { select: { title: true } },
            cinema: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Tính toán số điểm đã tích từ các đơn hàng (1 điểm cho mỗi 10.000 VNĐ chi tiêu)
    const history = paidBookings.map((b) => ({
      bookingId: b.id,
      movieTitle: b.showtime.movie.title,
      cinemaName: b.showtime.cinema.name,
      amount: b.totalAmount,
      pointsEarned: Math.floor(b.totalAmount / 10000),
      date: b.createdAt,
    }));

    return {
      user,
      nextTierRequirement: this.getNextTierRequirement(user.membershipTier, user.points),
      pointHistory: history,
    };
  }

  // Đổi điểm CGV Rewards lấy quà / voucher
  async redeemPoints(userId: string, redeemDto: RedeemPointsDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException({
        code: 'USER_NOT_FOUND',
        message: 'Người dùng không tồn tại',
      });
    }

    if (user.points < redeemDto.pointsToRedeem) {
      throw new BadRequestException({
        code: 'INSUFFICIENT_POINTS',
        message: `Số điểm thưởng hiện tại (${user.points} điểm) không đủ để quy đổi phần quà này`,
      });
    }

    // Trừ điểm thưởng của người dùng
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        points: { decrement: redeemDto.pointsToRedeem },
      },
    });

    // Tạo mã quà tặng quy đổi (Reward Code)
    const rewardCode = `CGV-REWARD-${redeemDto.rewardType}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      message: 'Đổi điểm CGV Rewards thành công!',
      rewardType: redeemDto.rewardType,
      pointsRedeemed: redeemDto.pointsToRedeem,
      remainingPoints: updatedUser.points,
      rewardCode,
    };
  }

  private getNextTierRequirement(currentTier: MembershipTier, currentPoints: number) {
    if (currentTier === MembershipTier.VVIP) {
      return { nextTier: 'Tối đa (VVIP)', pointsNeeded: 0 };
    }
    if (currentTier === MembershipTier.VIP) {
      return { nextTier: MembershipTier.VVIP, pointsNeeded: Math.max(0, 500 - currentPoints) };
    }
    return { nextTier: MembershipTier.VIP, pointsNeeded: Math.max(0, 200 - currentPoints) };
  }
}
