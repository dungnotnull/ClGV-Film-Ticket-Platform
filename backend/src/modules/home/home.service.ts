import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BannerStatus, MovieStatus } from '@prisma/client';

@Injectable()
export class HomeService {
  constructor(private prisma: PrismaService) {}

  // Dynamic Homepage Aggregator API: Tự động tổng hợp Banners, Phim đang chiếu, Phim sắp chiếu và Cụm rạp theo cityId do Admin tạo
  async getHomePageData(cityId?: string) {
    const [banners, nowShowingMovies, comingSoonMovies, cities, featuredCinemas] = await Promise.all([
      // Active promotional banners for slider
      this.prisma.banner.findMany({
        where: { status: BannerStatus.ACTIVE },
        orderBy: { displayOrder: 'asc' },
      }),
      // Phim đang chiếu
      this.prisma.movie.findMany({
        where: { status: MovieStatus.NOW_SHOWING },
        orderBy: { releaseDate: 'desc' },
        take: 10,
      }),
      // Phim sắp chiếu
      this.prisma.movie.findMany({
        where: { status: MovieStatus.COMING_SOON },
        orderBy: { releaseDate: 'asc' },
        take: 10,
      }),
      // Danh sách tất cả các địa điểm thành phố
      this.prisma.city.findMany({
        orderBy: { displayOrder: 'asc' },
        include: {
          _count: { select: { cinemas: true } },
        },
      }),
      // Cụm rạp nổi bật lọc theo cityId (nếu chọn)
      this.prisma.cinema.findMany({
        where: {
          ...(cityId && { cityId }),
        },
        include: {
          city: true,
          halls: { select: { id: true, name: true, screenType: true } },
        },
        take: 12,
      }),
    ]);

    return {
      banners,
      movies: {
        nowShowing: nowShowingMovies,
        comingSoon: comingSoonMovies,
      },
      cities: cities.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        cinemaCount: c._count.cinemas,
      })),
      featuredCinemas,
    };
  }
}
