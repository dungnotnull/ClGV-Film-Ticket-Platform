import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Banners')
@Controller()
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @ApiOperation({ summary: 'Lấy danh sách các banner quảng cáo active' })
  @Get('banners/active')
  async findActive() {
    return this.bannerService.findActive();
  }

  @ApiOperation({ summary: 'Admin lấy danh sách tất cả banner' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Get('admin/banners')
  async findAll() {
    return this.bannerService.findAll();
  }

  @ApiOperation({ summary: 'Admin tạo mới banner' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/banners')
  async create(@Body() createBannerDto: CreateBannerDto) {
    return this.bannerService.create(createBannerDto);
  }

  @ApiOperation({ summary: 'Admin xóa banner' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/banners/:id')
  async remove(@Param('id') id: string) {
    return this.bannerService.remove(id);
  }
}
