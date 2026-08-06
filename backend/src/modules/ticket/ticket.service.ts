import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { TicketStatus } from '@prisma/client';
import { VerifyQrDto } from './dto/verify-qr.dto';

@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // Soát vé cổng rạp turnstile QR Check-in
  async verifyQrToken(verifyQrDto: VerifyQrDto, scannerKeyHeader?: string) {
    const validScannerKey = this.configService.get<string>('SCANNER_SECRET_KEY') || 'clgv_scanner_secret_key_2026';
    if (scannerKeyHeader && scannerKeyHeader !== validScannerKey) {
      throw new UnauthorizedException({
        code: 'INVALID_SCANNER_KEY',
        message: 'Khóa thiết bị soát vé (X-Scanner-Key) không hợp lệ',
      });
    }

    const ticket = await this.prisma.ticket.findFirst({
      where: { qrToken: verifyQrDto.qrToken },
      include: {
        booking: {
          include: {
            user: { select: { id: true, fullName: true, phone: true, membershipTier: true } },
            showtime: {
              include: {
                movie: { select: { title: true, ageRating: true, posterUrl: true } },
                cinema: { select: { name: true } },
                hall: { select: { name: true, screenType: true } },
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException({
        code: 'TICKET_NOT_FOUND',
        message: 'Vé điện tử không tồn tại hoặc mã QR không hợp lệ',
      });
    }

    if (ticket.status === TicketStatus.CHECKED_IN) {
      throw new BadRequestException({
        code: 'TICKET_ALREADY_USED',
        message: 'Vé này đã được check-in sử dụng trước đó',
      });
    }

    if (ticket.status === TicketStatus.CANCELLED || ticket.status === TicketStatus.EXPIRED) {
      throw new BadRequestException({
        code: 'TICKET_INVALID_STATUS',
        message: `Vé không thể sử dụng do trạng thái là ${ticket.status}`,
      });
    }

    // Cập nhật trạng thái vé sang CHECKED_IN
    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: TicketStatus.CHECKED_IN },
    });

    return {
      success: true,
      message: 'Xác thực và Check-in vé thành công!',
      ticketId: updatedTicket.id,
      seatId: ticket.seatId,
      status: updatedTicket.status,
      checkedInAt: updatedTicket.updatedAt,
      movie: ticket.booking.showtime.movie,
      cinema: ticket.booking.showtime.cinema.name,
      hall: ticket.booking.showtime.hall.name,
      startTime: ticket.booking.showtime.startTime,
      user: ticket.booking.user,
    };
  }

  // Khách hàng lấy danh sách vé điện tử đã mua
  async getMyTickets(userId: string) {
    return this.prisma.ticket.findMany({
      where: {
        booking: {
          userId,
        },
      },
      include: {
        booking: {
          include: {
            showtime: {
              include: {
                movie: { select: { id: true, title: true, posterUrl: true, durationMinutes: true, ageRating: true } },
                cinema: { select: { id: true, name: true, address: true } },
                hall: { select: { id: true, name: true, screenType: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
