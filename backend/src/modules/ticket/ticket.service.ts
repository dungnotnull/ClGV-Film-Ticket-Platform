import { Injectable, NotFoundException, UnprocessableEntityException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getUserTickets(userId: string) {
    const tickets = await this.prisma.ticket.findMany({
      where: { booking: { userId } },
      include: {
        booking: {
          include: {
            showtime: {
              include: { movie: true, cinema: true, hall: true },
            },
            combos: {
              include: { combo: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets.map((t) => ({
      ticketId: t.id,
      seatId: t.seatId,
      status: t.status,
      qrToken: t.qrToken,
      movieTitle: t.booking.showtime.movie.title,
      posterUrl: t.booking.showtime.movie.posterUrl,
      cinemaName: t.booking.showtime.cinema.name,
      hallName: t.booking.showtime.hall.name,
      startTime: t.booking.showtime.startTime,
      endTime: t.booking.showtime.endTime,
      bookingStatus: t.booking.status,
      combos: t.booking.combos,
    }));
  }

  async getTicketDetail(id: string, userId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            showtime: {
              include: { movie: true, cinema: true, hall: true },
            },
            combos: {
              include: { combo: true },
            },
          },
        },
      },
    });

    if (!ticket || ticket.booking.userId !== userId) {
      throw new NotFoundException(`Không tìm thấy vé ID: ${id}`);
    }

    return ticket;
  }

  /**
   * Scanner turnstile validation (POST /tickets/verify-qr)
   */
  async verifyQrTicket(scannerKey: string, qrToken: string) {
    const expectedKey = this.configService.get<string>('TURNSTILE_SECRET_KEY', 'turnstile-secret-key-2026');
    if (scannerKey !== expectedKey) {
      throw new UnauthorizedException('Header X-Scanner-Key không hợp lệ');
    }

    const parts = qrToken.split('.');
    if (parts.length !== 3 || parts[0] !== 'TKT') {
      throw new UnprocessableEntityException({
        code: 'INVALID_HMAC_SIGNATURE',
        message: 'Mã QR không khớp định dạng vé ClGV',
      });
    }

    const payloadBase64 = parts[1];
    const signature = parts[2];

    const hmacSecret = this.configService.get<string>('TICKET_HMAC_SECRET', 'clgv-ticket-secret-key-2026');
    const expectedSig = crypto.createHmac('sha256', hmacSecret).update(payloadBase64).digest('base64url');

    if (signature !== expectedSig) {
      throw new UnprocessableEntityException({
        code: 'INVALID_HMAC_SIGNATURE',
        message: 'Chữ ký số HMAC QR vé không hợp lệ hoặc đã bị chỉnh sửa',
      });
    }

    const payloadJson = Buffer.from(payloadBase64, 'base64url').toString('utf-8');
    const payload = JSON.parse(payloadJson);

    // Kiểm tra Hạn hết giờ suất chiếu
    const nowUnix = Math.floor(Date.now() / 1000);
    if (payload.exp && nowUnix > payload.exp) {
      throw new UnprocessableEntityException({
        code: 'TICKET_EXPIRED',
        message: 'Vé đã hết hạn sử dụng do suất chiếu đã kết thúc',
      });
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id: payload.ticketId },
      include: {
        booking: {
          include: {
            showtime: { include: { movie: true, hall: true, cinema: true } },
            combos: { include: { combo: true } },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Vé không tồn tại trong cơ sở dữ liệu');
    }

    if (ticket.status === 'CHECKED_IN') {
      throw new UnprocessableEntityException({
        code: 'TICKET_ALREADY_USED',
        message: 'Vé này đã được soát và check-in vào rạp trước đó',
      });
    }

    // Cập nhật vé sang CHECKED_IN
    const updated = await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: 'CHECKED_IN' },
    });

    return {
      verified: true,
      ticketId: updated.id,
      movieTitle: ticket.booking.showtime.movie.title,
      cinemaName: ticket.booking.showtime.cinema.name,
      hallName: ticket.booking.showtime.hall.name,
      seatId: ticket.seatId,
      status: 'CHECKED_IN',
      checkedInAt: updated.updatedAt,
      combos: ticket.booking.combos.map((c) => ({
        name: c.combo.title,
        quantity: c.quantity,
      })),
    };
  }
}
