import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Vouchers & Coupons')
@Controller()
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  @Post('admin/vouchers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin tạo mới Voucher / Mã giảm giá' })
  async createVoucher(@Body() dto: CreateVoucherDto) {
    return this.voucherService.createVoucher(dto);
  }

  @Get('vouchers/wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khách hàng xem ví voucher cá nhân' })
  async getUserWallet(@Req() req: any) {
    return this.voucherService.getUserWallet(req.user.id);
  }

  @Post('vouchers/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khách hàng nhập mã để lưu voucher vào ví' })
  async claimVoucher(@Req() req: any, @Body('code') code: string) {
    return this.voucherService.claimVoucher(req.user.id, code);
  }
}
