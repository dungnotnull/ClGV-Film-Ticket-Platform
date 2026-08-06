import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { MovieStatus, Role } from '@prisma/client';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Movies')
@Controller()
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @ApiOperation({ summary: 'Lấy danh sách phim (lọc theo trạng thái, thể loại, từ khóa)' })
  @ApiQuery({ name: 'status', enum: MovieStatus, required: false, description: 'Trạng thái phim (NOW_SHOWING, COMING_SOON, SNEAK_SHOW)' })
  @ApiQuery({ name: 'genre', required: false, description: 'Thể loại phim' })
  @ApiQuery({ name: 'search', required: false, description: 'Từ khóa tìm kiếm' })
  @Get('movies')
  async findAll(
    @Query('status') status?: MovieStatus,
    @Query('genre') genre?: string,
    @Query('search') search?: string,
  ) {
    return this.movieService.findAll(status, genre, search);
  }

  @ApiOperation({ summary: 'Lấy chi tiết thông tin phim theo ID' })
  @Get('movies/:id')
  async findOne(@Param('id') id: string) {
    return this.movieService.findOne(id);
  }

  @ApiOperation({ summary: 'Admin tạo mới phim (hiển thị động ngay lên trang chủ)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('admin/movies')
  async create(@Body() createMovieDto: CreateMovieDto) {
    return this.movieService.create(createMovieDto);
  }

  @ApiOperation({ summary: 'Admin cập nhật thông tin phim' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Put('admin/movies/:id')
  async update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.update(id, updateMovieDto);
  }

  @ApiOperation({ summary: 'Admin xóa phim' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Delete('admin/movies/:id')
  async remove(@Param('id') id: string) {
    return this.movieService.remove(id);
  }
}
