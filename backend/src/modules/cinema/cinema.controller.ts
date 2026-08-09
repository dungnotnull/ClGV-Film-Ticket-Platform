import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CinemaService } from './cinema.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
import { UpdateCinemaDto } from './dto/update-cinema.dto';
import { CreateHallDto } from './dto/create-hall.dto';
import { UpdateMatrixDto } from './dto/update-matrix.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Cinemas & Halls')
@Controller()
export class CinemaController {
  constructor(private readonly cinemaService: CinemaService) {}

  @ApiOperation({ summary: 'Lấy danh sách các cụm rạp (có thể lọc theo thành phố)' })
  @ApiQuery({ name: 'cityId', required: false, description: 'ID thành phố' })
  @Get('cinemas')
  async findAllCinemas(@Query('cityId') cityId?: string) {
    return this.cinemaService.findAllCinemas(cityId);
  }

  @ApiOperation({ summary: 'Lấy thông tin chi tiết cụm rạp' })
  @Get('cinemas/:id')
  async findOneCinema(@Param('id') id: string) {
    return this.cinemaService.findOneCinema(id);
  }

  @ApiOperation({ summary: 'Admin tạo mới cụm rạp' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('cinemas')
  async createCinema(@Body() createCinemaDto: CreateCinemaDto) {
    return this.cinemaService.createCinema(createCinemaDto);
  }

  @ApiOperation({ summary: 'Admin cập nhật thông tin cụm rạp' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('cinemas/:id')
  async updateCinema(@Param('id') id: string, @Body() updateCinemaDto: UpdateCinemaDto) {
    return this.cinemaService.updateCinema(id, updateCinemaDto);
  }

  @ApiOperation({ summary: 'Admin xóa cụm rạp' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('cinemas/:id')
  async deleteCinema(@Param('id') id: string) {
    return this.cinemaService.deleteCinema(id);
  }

  @ApiOperation({ summary: 'Admin tạo mới phòng chiếu' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('halls')
  async createHall(@Body() createHallDto: CreateHallDto) {
    return this.cinemaService.createHall(createHallDto);
  }

  @ApiOperation({ summary: 'Admin xóa phòng chiếu' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('halls/:id')
  async deleteHall(@Param('id') id: string) {
    return this.cinemaService.deleteHall(id);
  }

  @ApiOperation({ summary: 'Lấy sơ đồ ma trận ghế của phòng chiếu' })
  @Get('halls/:id/matrix')
  async getHallMatrix(@Param('id') id: string) {
    return this.cinemaService.getHallMatrix(id);
  }

  @ApiOperation({ summary: 'Admin cập nhật sơ đồ ma trận ghế động' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('halls/:id/matrix')
  async updateHallMatrix(@Param('id') id: string, @Body() updateMatrixDto: UpdateMatrixDto) {
    return this.cinemaService.updateHallMatrix(id, updateMatrixDto);
  }
}

