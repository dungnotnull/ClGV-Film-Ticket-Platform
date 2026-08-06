import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@ApiTags('Mock VNPAY Payment Gateway')
@Controller('payments/vnpay')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-url')
  @ApiOperation({ summary: 'Khởi tạo Mock VNPAY Sandbox URL & chuỗi payload mã QR thanh toán' })
  async createUrl(@Body() body: { bookingId: string; amount: number; orderInfo?: string }) {
    return this.paymentService.createVnpayPaymentUrl(body.bookingId, body.amount, body.orderInfo);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Xử lý IPN / Redirect callback từ Mock VNPAY Gateway' })
  async handleCallback(
    @Query('vnp_ResponseCode') vnp_ResponseCode: string,
    @Query('vnp_TxnRef') vnp_TxnRef: string,
    @Query('vnp_Amount') vnp_Amount?: string,
  ) {
    return this.paymentService.handleVnpayCallback(vnp_ResponseCode, vnp_TxnRef, vnp_Amount);
  }
}
