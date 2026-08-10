import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieStatus } from '@prisma/client';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tự động quét và chuyển đổi trạng thái phim từ COMING_SOON (Sắp chiếu)
   * sang NOW_SHOWING (Đang chiếu) dựa trên việc phim đã được lên lịch chiếu (Showtime startTime <= now).
   */
  async autoUpdateMovieStatuses() {
    const now = new Date();
    const moviesWithShowtimes = await this.prisma.movie.findMany({
      where: {
        status: MovieStatus.COMING_SOON,
        showtimes: {
          some: {
            startTime: { lte: now },
          },
        },
      },
      select: { id: true },
    });

    if (moviesWithShowtimes.length > 0) {
      await this.prisma.movie.updateMany({
        where: {
          id: { in: moviesWithShowtimes.map((m) => m.id) },
        },
        data: {
          status: MovieStatus.NOW_SHOWING,
        },
      });
    }
  }

  // Admin tạo phim mới (Mặc định trạng thái COMING_SOON)
  async create(createMovieDto: CreateMovieDto) {
    const releaseDate = new Date(createMovieDto.releaseDate);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Không cho phép chọn ngày/giờ khởi chiếu trong quá khứ
    if (releaseDate < startOfToday) {
      throw new BadRequestException('Ngày khởi chiếu không được ở trong quá khứ');
    }

    // Mặc định trạng thái khi tạo phim mới luôn là COMING_SOON (trừ khi có truyền status cụ thể)
    const status = createMovieDto.status || MovieStatus.COMING_SOON;

    return this.prisma.movie.create({
      data: {
        title: createMovieDto.title,
        titleOriginal: createMovieDto.titleOriginal,
        director: createMovieDto.director,
        cast: createMovieDto.cast,
        genres: createMovieDto.genres || [],
        durationMinutes: createMovieDto.durationMinutes,
        releaseDate,
        posterUrl: createMovieDto.posterUrl,
        trailerUrl: createMovieDto.trailerUrl,
        ageRating: createMovieDto.ageRating,
        languageType: createMovieDto.languageType || 'SUB',
        status,
        description: createMovieDto.description,
      },
    });
  }

  // Danh sách phim lọc theo status, genre, search (Tự động cập nhật trạng thái trước khi trả về)
  async findAll(status?: MovieStatus, genre?: string, search?: string) {
    await this.autoUpdateMovieStatuses();

    return this.prisma.movie.findMany({
      where: {
        ...(status && { status }),
        ...(genre && { genres: { has: genre } }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { director: { contains: search, mode: 'insensitive' } },
            { cast: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { releaseDate: 'desc' },
    });
  }

  // Chi tiết phim và các suất chiếu khả dụng
  async findOne(id: string) {
    await this.autoUpdateMovieStatuses();

    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          where: { startTime: { gte: new Date() } },
          include: {
            cinema: true,
            hall: { select: { id: true, name: true, screenType: true, roomMatrix: true } },
          },
          orderBy: { startTime: 'asc' },
        },
        reviews: {
          include: { user: { select: { id: true, fullName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!movie) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Phim không tồn tại',
      });
    }

    return movie;
  }

  // Admin cập nhật thông tin phim
  async update(id: string, updateMovieDto: UpdateMovieDto) {
    await this.findOne(id);

    if (updateMovieDto.releaseDate) {
      const releaseDate = new Date(updateMovieDto.releaseDate);
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      if (releaseDate < startOfToday) {
        throw new BadRequestException('Ngày khởi chiếu không được ở trong quá khứ');
      }
    }

    return this.prisma.movie.update({
      where: { id },
      data: {
        ...(updateMovieDto.title && { title: updateMovieDto.title }),
        ...(updateMovieDto.titleOriginal && { titleOriginal: updateMovieDto.titleOriginal }),
        ...(updateMovieDto.director && { director: updateMovieDto.director }),
        ...(updateMovieDto.cast && { cast: updateMovieDto.cast }),
        ...(updateMovieDto.genres && { genres: updateMovieDto.genres }),
        ...(updateMovieDto.durationMinutes && { durationMinutes: updateMovieDto.durationMinutes }),
        ...(updateMovieDto.releaseDate && { releaseDate: new Date(updateMovieDto.releaseDate) }),
        ...(updateMovieDto.posterUrl && { posterUrl: updateMovieDto.posterUrl }),
        ...(updateMovieDto.trailerUrl && { trailerUrl: updateMovieDto.trailerUrl }),
        ...(updateMovieDto.ageRating && { ageRating: updateMovieDto.ageRating }),
        ...(updateMovieDto.languageType && { languageType: updateMovieDto.languageType }),
        ...(updateMovieDto.status && { status: updateMovieDto.status }),
        ...(updateMovieDto.description && { description: updateMovieDto.description }),
      },
    });
  }

  // Admin xóa phim
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.movie.delete({
      where: { id },
    });
  }
}
