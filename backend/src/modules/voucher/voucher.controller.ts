import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VoucherService } from './voucher.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
import { UpdateVoucherDto } from './dto/update-voucher.dto';
import { ApplyVoucherDto } from './dto/apply-voucher.dto';
import { AssignVoucherDto } from './dto/assign-voucher.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, BannerStatus } from '@prisma/client';

@ApiTags('Vouchers & Coupons')
@Controller()
export class VoucherController {
  constructor(private readonly voucherService: VoucherService) {}

  // ==========================================
  // ADMIN CMS ENDPOINTS
  // ==========================================

  @Get('admin/vouchers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Danh sách tất cả Voucher (Phân trang, Tìm kiếm, Lọc)' })
  @ApiQuery({ name: 'search', required: false, description: 'Tìm theo mã code hoặc tiêu đề' })
  @ApiQuery({ name: 'status', enum: BannerStatus, required: false, description: 'Lọc theo trạng thái ACTIVE / INACTIVE' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  async getAllVouchersAdmin(
    @Query('search') search?: string,
    @Query('status') status?: BannerStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.voucherService.getAllVouchersAdmin({ search, status, page, limit });
  }

  @Get('admin/vouchers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Xem chi tiết 1 Voucher kèm thống kê số lượt đã lưu ví và số lượt đã dùng' })
  async getVoucherByIdAdmin(@Param('id') id: string) {
    return this.voucherService.getVoucherByIdAdmin(id);
  }

  @Post('admin/vouchers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Tạo mới Voucher / Mã giảm giá' })
  async createVoucher(@Body() dto: CreateVoucherDto) {
    return this.voucherService.createVoucher(dto);
  }

  @Put('admin/vouchers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Cập nhật thông tin Voucher' })
  async updateVoucher(@Param('id') id: string, @Body() dto: UpdateVoucherDto) {
    return this.voucherService.updateVoucher(id, dto);
  }

  @Delete('admin/vouchers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Xóa Voucher hoặc vô hiệu hóa' })
  async deleteVoucher(@Param('id') id: string) {
    return this.voucherService.deleteVoucher(id);
  }

  @Post('admin/vouchers/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin: Phát tặng trực tiếp mã giảm giá vào ví người dùng' })
  async assignVouchersToUsers(@Body() dto: AssignVoucherDto) {
    return this.voucherService.assignVouchersToUsers(dto);
  }

  // ==========================================
  // CUSTOMER / PUBLIC ENDPOINTS
  // ==========================================

  @Get('vouchers/available')
  @ApiOperation({ summary: 'Khách hàng: Lấy danh sách Voucher công khai đang phát hành' })
  async getAvailableVouchers(@Req() req: any) {
    // Nếu có token gửi kèm thì kiểm tra voucher đã được user lưu ví chưa
    const userId = req.user?.id;
    return this.voucherService.getAvailableVouchers(userId);
  }

  @Get('vouchers/wallet')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khách hàng: Xem ví voucher cá nhân' })
  @ApiQuery({ name: 'status', required: false, enum: ['UNUSED', 'USED', 'EXPIRED'], description: 'Lọc trạng thái voucher trong ví' })
  async getUserWallet(
    @Req() req: any,
    @Query('status') status?: 'UNUSED' | 'USED' | 'EXPIRED',
  ) {
    return this.voucherService.getUserWallet(req.user.id, status);
  }

  @Post('vouchers/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khách hàng: Nhập mã để lưu voucher vào ví' })
  async claimVoucher(@Req() req: any, @Body('code') code: string) {
    return this.voucherService.claimVoucher(req.user.id, code);
  }

  @Post('vouchers/apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Khách hàng: Thẩm định / Xem trước số tiền giảm giá của Voucher cho đơn hàng' })
  async applyVoucherPreview(@Req() req: any, @Body() dto: ApplyVoucherDto) {
    return this.voucherService.applyVoucherPreview(req.user.id, dto);
  }
}
