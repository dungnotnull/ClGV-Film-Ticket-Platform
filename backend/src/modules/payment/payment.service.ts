import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { WebsocketGateway } from '../websocket/websocket.gateway';
import * as QRCode from 'qrcode';

@Injectable()
export class PaymentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly websocketGateway: WebsocketGateway,
  ) {}

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

  async handleVnpayCallback(vnp_ResponseCode: string, vnp_TxnRef: string, vnp_Amount?: string) {
    if (vnp_ResponseCode !== '00') {
      return { success: false, message: 'Thanh toán không thành công hoặc đã hủy' };
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: vnp_TxnRef },
      include: { tickets: true },
    });

    if (!booking) {
      throw new NotFoundException(`Không tìm thấy đơn hàng ${vnp_TxnRef}`);
    }

    if (booking.status === 'PAID') {
      return { success: true, booking, message: 'Đơn hàng đã được thanh toán trước đó' };
    }

    const updatedBooking = await this.prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id: vnp_TxnRef },
        data: { status: 'PAID' },
        include: { tickets: true },
      });

      // Chuyển ghế sang SOLD
      const seats = b.tickets.map((t) => t.seatId);
      await tx.showtimeSeat.updateMany({
        where: {
          showtimeId: b.showtimeId,
          seatId: { in: seats },
        },
        data: { status: 'SOLD' },
      });

      return b;
    });

    // Broadcast tới tất cả client đang xem ma trận ghế
    updatedBooking.tickets.forEach((t) => {
      this.websocketGateway.broadcastSeatState(updatedBooking.showtimeId, t.seatId, 'SOLD');
    });

    return {
      success: true,
      data: updatedBooking,
    };
  }
}
