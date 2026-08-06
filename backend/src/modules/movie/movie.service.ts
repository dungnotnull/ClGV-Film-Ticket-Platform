import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieStatus } from '@prisma/client';

@Injectable()
export class MovieService {
  constructor(private prisma: PrismaService) {}

  // Admin tạo phim mới (xuất hiện động ngay trên trang chủ)
  async create(createMovieDto: CreateMovieDto) {
    return this.prisma.movie.create({
      data: {
        title: createMovieDto.title,
        titleOriginal: createMovieDto.titleOriginal,
        director: createMovieDto.director,
        cast: createMovieDto.cast,
        genres: createMovieDto.genres || [],
        durationMinutes: createMovieDto.durationMinutes,
        releaseDate: new Date(createMovieDto.releaseDate),
        posterUrl: createMovieDto.posterUrl,
        trailerUrl: createMovieDto.trailerUrl,
        ageRating: createMovieDto.ageRating,
        languageType: createMovieDto.languageType || 'SUB',
        status: createMovieDto.status || MovieStatus.NOW_SHOWING,
        description: createMovieDto.description,
      },
    });
  }

  // Danh sách phim lọc theo status, genre, search
  async findAll(status?: MovieStatus, genre?: string, search?: string) {
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
    const movie = await this.prisma.movie.findUnique({
      where: { id },
      include: {
        showtimes: {
          where: { startTime: { gte: new Date() } },
          include: {
            cinema: true,
            hall: { select: { id: true, name: true, screenType: true } },
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
