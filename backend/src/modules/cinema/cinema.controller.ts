import { Controller, Get, Post, Body, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CinemaService } from './cinema.service';
import { CreateCinemaDto } from './dto/create-cinema.dto';
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

  @ApiOperation({ summary: 'Admin tạo mới phòng chiếu' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('halls')
  async createHall(@Body() createHallDto: CreateHallDto) {
    return this.cinemaService.createHall(createHallDto);
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
