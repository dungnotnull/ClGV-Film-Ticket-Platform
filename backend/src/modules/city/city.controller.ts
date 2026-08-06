import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CityService } from './city.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Cities')
@Controller()
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @ApiOperation({ summary: 'Lấy danh sách tất cả các thành phố / khu vực' })
  @Get('cities')
  async findAll() {
    return this.cityService.findAll();
  }

  @ApiOperation({ summary: 'Lấy chi tiết thành phố theo ID' })
  @Get('cities/:id')
  async findOne(@Param('id') id: string) {
    return this.cityService.findOne(id);
  }

  @ApiOperation({ summary: 'Admin tạo mới địa điểm / thành phố' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/cities')
  async create(@Body() createCityDto: CreateCityDto) {
    return this.cityService.create(createCityDto);
  }

  @ApiOperation({ summary: 'Admin cập nhật thành phố' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('admin/cities/:id')
  async update(@Param('id') id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.cityService.update(id, updateCityDto);
  }

  @ApiOperation({ summary: 'Admin xóa thành phố' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/cities/:id')
  async remove(@Param('id') id: string) {
    return this.cityService.remove(id);
  }
}
