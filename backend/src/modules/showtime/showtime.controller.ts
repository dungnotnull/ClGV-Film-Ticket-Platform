import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { ShowtimeService } from './showtime.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Showtimes')
@Controller()
export class ShowtimeController {
  constructor(private readonly showtimeService: ShowtimeService) {}

  @ApiOperation({ summary: 'Lấy danh sách các suất chiếu (lọc theo phim, rạp, ngày)' })
  @ApiQuery({ name: 'movieId', required: false, description: 'ID Phim' })
  @ApiQuery({ name: 'cinemaId', required: false, description: 'ID Cụm rạp' })
  @ApiQuery({ name: 'date', required: false, description: 'Ngày chiếu (YYYY-MM-DD)' })
  @Get('showtimes')
  async findAll(
    @Query('movieId') movieId?: string,
    @Query('cinemaId') cinemaId?: string,
    @Query('date') date?: string,
  ) {
    return this.showtimeService.findAll(movieId, cinemaId, date);
  }

  @ApiOperation({ summary: 'Lấy sơ đồ ma trận ghế và trạng thái thời gian thực của suất chiếu' })
  @Get('showtimes/:id/seats')
  async getShowtimeSeats(@Param('id') id: string) {
    return this.showtimeService.getShowtimeSeats(id);
  }

  @ApiOperation({ summary: 'Admin tạo mới suất chiếu (kiểm tra trùng lặp lịch chiếu)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/showtimes')
  async create(@Body() createShowtimeDto: CreateShowtimeDto) {
    return this.showtimeService.create(createShowtimeDto);
  }
}
