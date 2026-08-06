import { Controller, Post, Body, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { VerifyQrDto } from './dto/verify-qr.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tickets & Turnstile Check-in')
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiOperation({ summary: 'Soát vé qua mã QR (dành cho thiết bị máy quét turnstile / nhân viên soát vé)' })
  @ApiHeader({ name: 'X-Scanner-Key', required: false, description: 'Mã xác thực thiết bị máy quét' })
  @Post('verify-qr')
  async verifyQr(
    @Body() verifyQrDto: VerifyQrDto,
    @Headers('x-scanner-key') scannerKey?: string,
  ) {
    return this.ticketService.verifyQrToken(verifyQrDto, scannerKey);
  }

  @ApiOperation({ summary: 'Khách hàng lấy danh sách vé điện tử của mình' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('my-tickets')
  async getMyTickets(@CurrentUser() user: any) {
    return this.ticketService.getMyTickets(user.id);
  }
}
