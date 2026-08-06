import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CGVCardService {
  constructor(private readonly prisma: PrismaService) {}

  async topupCard(userId: string, amount: number, paymentMethod = 'ATM') {
    if (amount <= 0) {
      throw new BadRequestException('Số tiền nạp phải lớn hơn 0 VNĐ');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          cgvCardBalance: { increment: amount },
        },
      });

      const txRecord = await tx.cGVCardTransaction.create({
        data: {
          userId,
          amount,
          type: 'TOPUP',
          description: `Nạp tiền vào thẻ CGV Card qua ${paymentMethod}`,
        },
      });

      return {
        balance: user.cgvCardBalance,
        transaction: txRecord,
      };
    });
  }

  async getBalanceAndHistory(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { cgvCardBalance: true, points: true, membershipTier: true },
    });

    const transactions = await this.prisma.cGVCardTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return {
      balance: user?.cgvCardBalance || 0,
      points: user?.points || 0,
      membershipTier: user?.membershipTier || 'MEMBER',
      transactions,
    };
  }
}
