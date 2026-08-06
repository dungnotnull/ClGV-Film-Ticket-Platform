import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CGVCardService } from './cgv-card.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('CGV E-Wallet & Member Card')
@Controller('cgv-card')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CGVCardController {
  constructor(private readonly cgvCardService: CGVCardService) {}

  @Post('topup')
  @ApiOperation({ summary: 'Nạp tiền vào thẻ thành viên CGV Card' })
  async topup(@Req() req: any, @Body('amount') amount: number, @Body('paymentMethod') paymentMethod?: string) {
    return this.cgvCardService.topupCard(req.user.id, amount, paymentMethod);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Xem số dư và lịch sử giao dịch thẻ CGV Card' })
  async getBalance(@Req() req: any) {
    return this.cgvCardService.getBalanceAndHistory(req.user.id);
  }
}
