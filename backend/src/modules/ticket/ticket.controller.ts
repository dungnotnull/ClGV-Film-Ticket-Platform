import { Controller, Get, Post, Param, Body, Headers, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Tickets & QR Check-in Scanner')
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('my-tickets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khách hàng xem danh sách vé điện tử đã mua' })
  async getMyTickets(@Req() req: any) {
    return this.ticketService.getUserTickets(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xem chi tiết vé điện tử & hóa đơn' })
  async getTicketDetail(@Req() req: any, @Param('id') id: string) {
    return this.ticketService.getTicketDetail(id, req.user.id);
  }

  @Post('verify-qr')
  @ApiOperation({ summary: 'Máy quét cổng soát vé QR rạp CGV (HMAC Validation)' })
  @ApiHeader({ name: 'X-Scanner-Key', description: 'Secret Key cấp cho thiết bị máy quét turnstile' })
  async verifyQrTicket(
    @Headers('x-scanner-key') scannerKey: string,
    @Body('qrToken') qrToken: string,
  ) {
    return this.ticketService.verifyQrTicket(scannerKey, qrToken);
  }
}
