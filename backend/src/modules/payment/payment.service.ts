import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import { RedisService } from '../redis/redis.service';
import * as QRCode from 'qrcode';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly websocketGateway: WebsocketGateway,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Khởi tạo Mock VNPAY Sandbox URL & QR Code Payload
   */
  async createVnpayPaymentUrl(bookingId: string, amount: number, orderInfo?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${bookingId}`);
    }

    const mockVnpayHost = this.configService.get<string>('MOCK_VNPAY_HOST', 'http://localhost:4000');
    const paymentUrl = `${mockVnpayHost}/api/v1/payments/vnpay/mock-gateway?orderId=${bookingId}&amount=${amount}`;
    
    // Tạo QR Payload giả lập theo chuẩn VNPAY VietQR
    const qrPayload = `00020101021238540010A000000727012400069704230110${bookingId}53037045406${amount}5802VN5904CLGV6007HANOI62190815${bookingId}63041D9C`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload);

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { paymentUrl },
    });

    return {
      paymentUrl,
      qrPayload,
      qrDataUrl,
    };
  }

  /**
   * Helper tập trung xử lý sau khi thanh toán thành công (VNPAY / VietQR)
   * 1. Đổi trạng thái Booking -> PAID
   * 2. Đổi trạng thái Ghế -> SOLD
   * 3. Cộng điểm thưởng CGV Rewards & trừ điểm sử dụng vào tài khoản User
   * 4. Đánh dấu UserVoucher đã sử dụng (isUsed = true)
   * 5. Giải phóng khoá Redis Redlock
   * 6. Broadcast WebSocket 'SOLD' cho toàn bộ Client
   */
  private async processSuccessfulPayment(bookingId: string, paymentMethod: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { tickets: true },
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${bookingId}`);
    }

    if (booking.status === 'PAID') {
      return { success: true, booking, message: 'Đơn hàng đã được thanh toán trước đó' };
    }

    const updatedBooking = await this.prisma.$transaction(async (tx) => {
      // 1. Cập nhật Booking -> PAID
      const b = await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'PAID', paymentMethod },
        include: { tickets: true },
      });

      // 2. Chuyển ghế sang SOLD
      const seats = b.tickets.map((t) => t.seatId);
      await tx.showtimeSeat.updateMany({
        where: {
          showtimeId: b.showtimeId,
          seatId: { in: seats },
        },
        data: { status: 'SOLD' },
      });

      // 3. Tích điểm CGV Rewards & Trừ điểm sử dụng cho User
      const netPointsChange = b.cgvPointsEarned - b.cgvPointsUsed;
      if (netPointsChange !== 0) {
        await tx.user.update({
          where: { id: b.userId },
          data: {
            points: { increment: netPointsChange },
          },
        });
      }

      // 4. Nếu có sử dụng Voucher -> Đánh dấu UserVoucher đã sử dụng
      if (b.voucherId) {
        await tx.userVoucher.updateMany({
          where: {
            userId: b.userId,
            voucherId: b.voucherId,
            isUsed: false,
          },
          data: {
            isUsed: true,
            usedAt: new Date(),
          },
        });
      }

      return b;
    });

    // 5 & 6. Xóa Redis Lock & Broadcast WebSocket tới tất cả Client
    for (const t of updatedBooking.tickets) {
      await this.redisService.releaseSeatLock(updatedBooking.showtimeId, t.seatId);
      this.websocketGateway.broadcastSeatState(updatedBooking.showtimeId, t.seatId, 'SOLD');
    }

    return {
      success: true,
      data: updatedBooking,
    };
  }

  /**
   * Xử lý IPN / Callback thanh toán Mock VNPAY
   */
  async handleVnpayCallback(vnp_ResponseCode: string, vnp_TxnRef: string, vnp_Amount?: string) {
    if (vnp_ResponseCode !== '00') {
      return { success: false, message: 'Thanh toán không thành công hoặc đã hủy' };
    }

    return this.processSuccessfulPayment(vnp_TxnRef, 'VNPAY');
  }

  /**
   * Khởi tạo mã VietQR Napas247 (Môi trường Dev Phase 6)
   */
  async createVietQrPaymentUrl(bookingId: string, amount: number, orderInfo?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${bookingId}`);
    }

    const bankId = '970423'; // TPBank / MBBank BIN code
    const accountNo = '1234567890';
    const accountName = 'CLGV FILM TICKET PLATFORM';
    const addInfo = `CLGV_${bookingId.substring(0, 8)}`;

    // Tạo URL ảnh VietQR chuẩn dịch vụ img.vietqr.io
    const vietQrImageUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(addInfo)}&accountName=${encodeURIComponent(accountName)}`;
    
    // Chuỗi mã hóa QR chuẩn EMVCo / Napas247
    const qrPayload = `00020101021238570010A00000072701270006${bankId}0110${accountNo}5204599953037045406${amount}5802VN5926${accountName}6007HANOI62220818${addInfo}63048B12`;
    const qrDataUrl = await QRCode.toDataURL(qrPayload);

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { paymentUrl: vietQrImageUrl, paymentMethod: 'VIETQR' },
    });

    return {
      paymentMethod: 'VIETQR',
      paymentUrl: vietQrImageUrl,
      vietQrImageUrl,
      qrPayload,
      qrDataUrl,
      bankInfo: {
        bankName: 'TPBank',
        bin: bankId,
        accountNo,
        accountName,
        amount,
        addInfo,
      },
    };
  }

  /**
   * Xử lý xác nhận thanh toán thành công qua VietQR Callback (Phase 6)
   */
  async handleVietQrCallback(bookingId: string, status = 'SUCCESS', txnId?: string) {
    if (status !== 'SUCCESS') {
      return { success: false, message: 'Thanh toán VietQR không thành công hoặc đã bị hủy' };
    }

    const res = await this.processSuccessfulPayment(bookingId, 'VIETQR');
    return {
      ...res,
      message: 'Xác nhận thanh toán VietQR thành công',
    };
  }
}
