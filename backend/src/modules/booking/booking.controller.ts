import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { HoldSeatDto } from './dto/hold-seat.dto';
import { CheckoutBookingDto } from './dto/checkout-booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Booking & Seat Holding')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('hold-seat')
  @ApiOperation({ summary: 'Giữ ghế tạm thời với Redis Redlock TTL 10 phút' })
  async holdSeat(@Req() req: any, @Body() dto: HoldSeatDto) {
    return this.bookingService.holdSeats(req.user.id, dto);
  }

  @Post('release-seat')
  @ApiOperation({ summary: 'Hủy giữ ghế tạm thời' })
  async releaseSeat(@Req() req: any, @Body() dto: HoldSeatDto) {
    return this.bookingService.releaseSeats(req.user.id, dto);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Khởi tạo thanh toán & tạo đơn đặt vé xem phim' })
  async checkout(@Req() req: any, @Body() dto: CheckoutBookingDto) {
    return this.bookingService.checkout(req.user.id, dto);
  }
}
