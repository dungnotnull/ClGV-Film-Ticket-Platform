import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaymentService } from './payment.service';

@ApiTags('Payment Gateways (VNPAY & VietQR)')
@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // ==========================================
  // MOCK VNPAY ENDPOINTS
  // ==========================================

  @Post('vnpay/create-url')
  @ApiOperation({ summary: 'Khởi tạo Mock VNPAY Sandbox URL & chuỗi payload mã QR thanh toán' })
  async createVnpayUrl(@Body() body: { bookingId: string; amount: number; orderInfo?: string }) {
    return this.paymentService.createVnpayPaymentUrl(body.bookingId, body.amount, body.orderInfo);
  }

  @Get('vnpay/callback')
  @ApiOperation({ summary: 'Xử lý IPN / Redirect callback từ Mock VNPAY Gateway' })
  async handleVnpayCallback(
    @Query('vnp_ResponseCode') vnp_ResponseCode: string,
    @Query('vnp_TxnRef') vnp_TxnRef: string,
    @Query('vnp_Amount') vnp_Amount?: string,
  ) {
    return this.paymentService.handleVnpayCallback(vnp_ResponseCode, vnp_TxnRef, vnp_Amount);
  }

  // ==========================================
  // VIETQR NAPAS247 ENDPOINTS (Phase 6 Dev)
  // ==========================================

  @Post('vietqr/create-url')
  @ApiOperation({ summary: 'Khởi tạo mã VietQR Napas247 (Dev Environment)' })
  async createVietQrUrl(@Body() body: { bookingId: string; amount: number; orderInfo?: string }) {
    return this.paymentService.createVietQrPaymentUrl(body.bookingId, body.amount, body.orderInfo);
  }

  @Post('vietqr/callback')
  @ApiOperation({ summary: 'Xử lý xác nhận thanh toán thành công qua VietQR Callback' })
  async handleVietQrCallbackPost(
    @Body() body: { bookingId: string; status?: string; txnId?: string },
  ) {
    return this.paymentService.handleVietQrCallback(body.bookingId, body.status || 'SUCCESS', body.txnId);
  }

  @Get('vietqr/callback')
  @ApiOperation({ summary: 'Xử lý IPN / Redirect callback từ VietQR' })
  async handleVietQrCallbackGet(
    @Query('bookingId') bookingId: string,
    @Query('status') status?: string,
    @Query('txnId') txnId?: string,
  ) {
    return this.paymentService.handleVietQrCallback(bookingId, status || 'SUCCESS', txnId);
  }
}
