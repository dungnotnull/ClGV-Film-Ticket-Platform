import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { HoldSeatDto } from './dto/hold-seat.dto';
import { CheckoutBookingDto } from './dto/checkout-booking.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class BookingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly websocketGateway: WebsocketGateway,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Giữ ghế tạm thời trong 10 phút (Redis Redlock Tier 1)
   */
  async holdSeats(userId: string, dto: HoldSeatDto) {
    const showtimeId = dto.showtimeId;
    const seatIds = dto.seatIds || [];

    if (!showtimeId || seatIds.length === 0) {
      throw new BadRequestException('Vui lòng cung cấp showtimeId và danh sách seatIds');
    }

    const showtime = await this.prisma.showtime.findUnique({ where: { id: showtimeId } });
    if (!showtime) {
      throw new NotFoundException(`Không tìm thấy suất chiếu ID: ${showtimeId}`);
    }

    if (new Date(showtime.startTime) < new Date()) {
      throw new BadRequestException('Suất chiếu này đã bắt đầu hoặc đã kết thúc, không thể đặt vé nữa.');
    }

    // Sửa Bug 6: Kiểm tra trạng thái ghế thực tế từ Database PostgreSQL trước khi giữ
    const existingSeats = (await this.prisma.showtimeSeat.findMany({
      where: {
        showtimeId,
        seatId: { in: seatIds },
      },
    })) || [];

    for (const seat of existingSeats) {
      if (seat.status === 'SOLD') {
        throw new ConflictException({
          code: 'SEAT_ALREADY_SOLD',
          message: `Ghế ${seat.seatId} đã được mua thành công trước đó, không thể chọn lại`,
        });
      }
      if (seat.status === 'BLOCKED') {
        throw new ConflictException({
          code: 'SEAT_BLOCKED',
          message: `Ghế ${seat.seatId} hiện đang bị tạm khóa`,
        });
      }
    }

    const lockedSeats: string[] = [];

    for (const seatId of seatIds) {
      const acquired = await this.redisService.acquireSeatLock(showtimeId, seatId, userId, 600);
      if (!acquired) {
        // Rollback lại các ghế đã lỡ lock trong vòng lặp này
        for (const locked of lockedSeats) {
          await this.redisService.releaseSeatLock(showtimeId, locked);
        }
        throw new ConflictException({
          code: 'SEAT_ALREADY_HELD',
          message: `Ghế ${seatId} hiện đang được giữ bởi người dùng khác`,
          details: [{ field: 'seatId', issue: `Lock key lock:seat:${showtimeId}:${seatId} exists in Redis` }],
        });
      }
      lockedSeats.push(seatId);
    }

    const expiresAt = new Date(Date.now() + 600 * 1000).toISOString();
    const reservationId = `res_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    // Broadcast sự kiện tới room Socket.io
    lockedSeats.forEach((seatId) => {
      this.websocketGateway.broadcastSeatState(showtimeId, seatId, 'HOLDING', userId, expiresAt);
    });

    return {
      reservationId,
      showtimeId,
      heldSeats: lockedSeats,
      expiresAt,
      ttlSeconds: 600,
    };
  }

  /**
   * Hủy giữ ghế tạm thời (Yêu cầu 5: Xóa lock trên Redis và broadcast Socket.io)
   */
  async releaseSeats(userId: string, dto: HoldSeatDto) {
    const { showtimeId, seatIds = [] } = dto;
    if (showtimeId && seatIds.length > 0) {
      for (const seatId of seatIds) {
        await this.redisService.releaseSeatLock(showtimeId, seatId);
        this.websocketGateway.broadcastSeatState(showtimeId, seatId, 'AVAILABLE', null, null);
      }
    }
    return { success: true, releasedSeats: seatIds };
  }

  /**
   * Checkout thanh toán vé & bắp nước (Pessimistic Lock Tier 2 & Transaction)
   */
  async checkout(userId: string, dto: CheckoutBookingDto) {
    const { showtimeId, seatIds, paymentMethod, comboIds, voucherCode, pointsToUse = 0 } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra suất chiếu
      const showtime = await tx.showtime.findUnique({
        where: { id: showtimeId },
        include: { movie: true, cinema: true, hall: true },
      });
      if (!showtime) {
        throw new NotFoundException('Suất chiếu không tồn tại');
      }

      if (new Date(showtime.startTime) < new Date()) {
        throw new BadRequestException('Suất chiếu này đã bắt đầu hoặc đã kết thúc, không thể thanh toán.');
      }

      // 2. Lock hàng ghế PostgreSQL bằng SELECT FOR UPDATE
      const seats = await tx.showtimeSeat.findMany({
        where: {
          showtimeId,
          seatId: { in: seatIds },
        },
      });

      if (seats.length !== seatIds.length) {
        throw new NotFoundException('Một số ghế được chọn không tồn tại trong suất chiếu');
      }

      for (const seat of seats) {
        if (seat.status === 'SOLD') {
          throw new ConflictException(`Ghế ${seat.seatId} đã được bán cho khách hàng khác`);
        }
      }

      // 3. Tính tiền vé theo loại ghế
      let ticketTotal = 0;
      seats.forEach((seat) => {
        const price = Math.round(showtime.basePrice * (seat.priceModifier || 1.0));
        ticketTotal += price;
      });

      // 4. Tính tiền F&B Combos
      let comboTotal = 0;
      const comboRecordsToInsert: { comboId: string; quantity: number; price: number }[] = [];

      if (comboIds && comboIds.length > 0) {
        const comboDbList = await tx.combo.findMany({
          where: { id: { in: comboIds.map((c) => c.comboId) }, status: 'ACTIVE' },
        });

        for (const item of comboIds) {
          const combo = comboDbList.find((c) => c.id === item.comboId);
          if (combo) {
            comboTotal += combo.price * item.quantity;
            comboRecordsToInsert.push({ comboId: combo.id, quantity: item.quantity, price: combo.price });
          }
        }
      }

      let grandTotal = ticketTotal + comboTotal;
      let discountAmount = 0;
      let appliedVoucherId: string | undefined = undefined;

      // 5. Áp dụng Voucher giảm giá
      if (voucherCode) {
        const voucher = await tx.voucher.findUnique({ where: { code: voucherCode.toUpperCase() } });
        if (voucher && voucher.status === 'ACTIVE' && new Date() <= voucher.expiresAt) {
          if (grandTotal >= voucher.minOrderValue) {
            if (voucher.discountType === 'FIXED_AMOUNT') {
              discountAmount += voucher.discountValue;
            } else if (voucher.discountType === 'PERCENTAGE') {
              let calc = Math.round((grandTotal * voucher.discountValue) / 100);
              if (voucher.maxDiscountAmount && calc > voucher.maxDiscountAmount) {
                calc = voucher.maxDiscountAmount;
              }
              discountAmount += calc;
            }
            appliedVoucherId = voucher.id;
          }
        }
      }

      // 6. Áp dụng Điểm thưởng CGV Rewards (1 điểm = 1.000 VNĐ)
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new NotFoundException('Người dùng không tồn tại');

      let pointsUsed = 0;
      if (pointsToUse > 0) {
        if (user.points < pointsToUse) {
          throw new BadRequestException('Số điểm CGV Rewards không đủ');
        }
        const pointDiscount = pointsToUse * 1000;
        discountAmount += pointDiscount;
        pointsUsed = pointsToUse;
      }

      // Đảm bảo số tiền sau giảm giá không nhỏ hơn 0
      const finalAmount = Math.max(0, grandTotal - discountAmount);

      // 7. Xử lý thanh toán (Hỗ trợ CGV_CARD, VNPAY và VIETQR)
      let bookingStatus: 'PENDING_PAYMENT' | 'PAID' = 'PENDING_PAYMENT';
      let paymentUrl: string | undefined = undefined;

      if (paymentMethod === 'CGV_CARD') {
        if (user.cgvCardBalance < finalAmount) {
          throw new BadRequestException('Số dư thẻ CGV Card không đủ để thanh toán');
        }
        // Trừ tiền thẻ CGV Card
        await tx.user.update({
          where: { id: userId },
          data: {
            cgvCardBalance: { decrement: finalAmount },
            points: { decrement: pointsUsed },
          },
        });
        await tx.cGVCardTransaction.create({
          data: {
            userId,
            amount: finalAmount,
            type: 'SPEND',
            description: `Thanh toán vé xem phim suất chiếu ${showtime.id}`,
          },
        });
        bookingStatus = 'PAID';
      } else if (paymentMethod === 'VIETQR') {
        const bankId = '970423';
        const accountNo = '1234567890';
        const accountName = 'CLGV FILM TICKET PLATFORM';
        paymentUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${finalAmount}&accountName=${encodeURIComponent(accountName)}`;
      } else {
        // MOCK VNPAY Sandbox URL
        const mockHost = this.configService.get<string>('MOCK_VNPAY_HOST', 'http://localhost:4000');
        paymentUrl = `${mockHost}/api/v1/payments/vnpay/mock-gateway?orderId=TEMP&amount=${finalAmount}`;
      }

      // 8. Tính điểm CGV Rewards thưởng (1 điểm cho mỗi 1.000 VNĐ chi tiêu)
      const pointsEarned = Math.floor(finalAmount / 1000);

      // 9. Tạo đơn hàng Booking
      const booking = await tx.booking.create({
        data: {
          userId,
          showtimeId,
          totalAmount: finalAmount,
          discountAmount,
          cgvPointsUsed: pointsUsed,
          cgvPointsEarned: pointsEarned,
          voucherId: appliedVoucherId,
          status: bookingStatus,
          paymentMethod,
          paymentUrl,
        },
      });

      // 10. Cập nhật lại Payment URL chính xác với booking.id
      if (paymentMethod === 'VNPAY' && paymentUrl) {
        paymentUrl = paymentUrl.replace('TEMP', booking.id);
        await tx.booking.update({
          where: { id: booking.id },
          data: { paymentUrl },
        });
      } else if (paymentMethod === 'VIETQR' && paymentUrl) {
        const addInfo = `CLGV_${booking.id.substring(0, 8)}`;
        paymentUrl = `${paymentUrl}&addInfo=${encodeURIComponent(addInfo)}`;
        await tx.booking.update({
          where: { id: booking.id },
          data: { paymentUrl },
        });
      }

      // 11. Tạo thông tin Chi tiết Bắp nước (BookingCombo)
      if (comboRecordsToInsert.length > 0) {
        await tx.bookingCombo.createMany({
          data: comboRecordsToInsert.map((c) => ({
            bookingId: booking.id,
            comboId: c.comboId,
            quantity: c.quantity,
            price: c.price,
          })),
        });
      }

      // 12. Tạo Vé điện tử & QR Ticket Token (HMAC-SHA256)
      const hmacSecret = this.configService.get<string>('TICKET_HMAC_SECRET', 'clgv_hmac_qr_secret_key_2026');
      const ticketRecordsToInsert = seatIds.map((seatId) => {
        const payload = `${booking.id}:${userId}:${showtimeId}:${seatId}:${Date.now()}`;
        const signature = crypto.createHmac('sha256', hmacSecret).update(payload).digest('hex');
        const qrToken = Buffer.from(JSON.stringify({ payload, signature })).toString('base64url');

        return {
          bookingId: booking.id,
          seatId,
          qrToken,
          status: bookingStatus === 'PAID' ? ('UNUSED' as const) : ('UNUSED' as const),
        };
      });

      await tx.ticket.createMany({
        data: ticketRecordsToInsert,
      });

      // 13. Nếu thanh toán ngay bằng CGV_CARD: Chuyển ghế sang SOLD & giải phóng Redis lock
      if (bookingStatus === 'PAID') {
        await tx.showtimeSeat.updateMany({
          where: { showtimeId, seatId: { in: seatIds } },
          data: { status: 'SOLD' },
        });

        // Xóa lock Redis & broadcast trạng thái SOLD
        for (const seatId of seatIds) {
          await this.redisService.releaseSeatLock(showtimeId, seatId);
          this.websocketGateway.broadcastSeatState(showtimeId, seatId, 'SOLD');
        }
      }

      return {
        bookingId: booking.id,
        status: bookingStatus,
        totalAmount: finalAmount,
        discountAmount,
        pointsEarned,
        paymentMethod,
        paymentUrl,
      };
    });
  }

  /**
   * Lấy lịch sử đặt vé cá nhân
   */
  async getUserBookings(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        showtime: {
          include: { movie: true, cinema: true, hall: true },
        },
        tickets: true,
        combos: { include: { combo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
