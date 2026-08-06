import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus, MovieStatus, SeatStatus } from '@prisma/client';
import { DateRangeQueryDto, OccupancyQueryDto } from './dto/analytics-query.dto';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Thống kê tổng quan Dashboard
  async getDashboardSummary() {
    // Tổng doanh thu từ các đơn hàng đã thanh toán PAID (VND Integer)
    const totalRevenueAggregate = await this.prisma.booking.aggregate({
      where: { status: BookingStatus.PAID },
      _sum: { totalAmount: true },
    });
    const totalRevenue = totalRevenueAggregate._sum.totalAmount || 0;

    // Tổng số vé đã bán ra thành công
    const totalTicketsSold = await this.prisma.ticket.count({
      where: {
        booking: { status: BookingStatus.PAID },
      },
    });

    // Số phim đang chiếu (NOW_SHOWING)
    const activeMoviesCount = await this.prisma.movie.count({
      where: { status: MovieStatus.NOW_SHOWING },
    });

    // Tổng số ghế khả dụng và đã bán để tính tỷ lệ lấp đầy tổng quan
    const totalSeatsCount = await this.prisma.showtimeSeat.count({
      where: { status: { not: SeatStatus.BLOCKED } },
    });
    const soldSeatsCount = await this.prisma.showtimeSeat.count({
      where: { status: SeatStatus.SOLD },
    });

    const overallOccupancyRate = totalSeatsCount > 0
      ? Math.round((soldSeatsCount / totalSeatsCount) * 100 * 100) / 100
      : 0;

    // Top 5 phim có doanh thu cao nhất
    const topMoviesRaw = await this.prisma.booking.groupBy({
      by: ['showtimeId'],
      where: { status: BookingStatus.PAID },
      _sum: { totalAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: 'desc' } },
      take: 10,
    });

    // Gom nhóm doanh thu theo Movie ID
    const movieRevenueMap = new Map<string, { revenue: number; tickets: number }>();
    for (const item of topMoviesRaw) {
      const showtime = await this.prisma.showtime.findUnique({
        where: { id: item.showtimeId },
        select: { movieId: true },
      });
      if (showtime) {
        const current = movieRevenueMap.get(showtime.movieId) || { revenue: 0, tickets: 0 };
        movieRevenueMap.set(showtime.movieId, {
          revenue: current.revenue + (item._sum.totalAmount || 0),
          tickets: current.tickets + (item._count.id || 0),
        });
      }
    }

    const topMovies: any[] = [];
    for (const [movieId, stats] of movieRevenueMap.entries()) {
      const movie = await this.prisma.movie.findUnique({
        where: { id: movieId },
        select: { id: true, title: true, posterUrl: true, ageRating: true },
      });
      if (movie) {
        topMovies.push({
          ...movie,
          revenue: stats.revenue,
          ticketsSold: stats.tickets,
        });
      }
    }
    topMovies.sort((a, b) => b.revenue - a.revenue);

    // 5 Đơn hàng vừa thanh toán gần nhất
    const recentBookings = await this.prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        showtime: {
          include: {
            movie: { select: { title: true } },
            cinema: { select: { name: true } },
          },
        },
      },
    });

    return {
      totalRevenue,
      totalTicketsSold,
      activeMoviesCount,
      overallOccupancyRate,
      topMovies: topMovies.slice(0, 5),
      recentBookings,
    };
  }

  // 2. Thống kê doanh thu chi tiết (theo ngày, rạp, phim)
  async getRevenueAnalytics(query: DateRangeQueryDto) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.startDate) {
      startDate = new Date(`${query.startDate}T00:00:00.000Z`);
    }
    if (query.endDate) {
      endDate = new Date(`${query.endDate}T23:59:59.999Z`);
    }

    const bookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PAID,
        ...(startDate && endDate && {
          createdAt: { gte: startDate, lte: endDate },
        }),
        ...(query.cinemaId && {
          showtime: { cinemaId: query.cinemaId },
        }),
        ...(query.movieId && {
          showtime: { movieId: query.movieId },
        }),
      },
      include: {
        showtime: {
          include: {
            cinema: { select: { id: true, name: true } },
            movie: { select: { id: true, title: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    let totalRevenue = 0;
    const byCinemaMap = new Map<string, { cinemaName: string; revenue: number; bookingsCount: number }>();
    const byMovieMap = new Map<string, { movieTitle: string; revenue: number; bookingsCount: number }>();
    const timelineMap = new Map<string, number>();

    for (const booking of bookings) {
      totalRevenue += booking.totalAmount;

      // Group by Cinema
      const cinemaId = booking.showtime.cinemaId;
      const cinemaName = booking.showtime.cinema.name;
      const cinemaStats = byCinemaMap.get(cinemaId) || { cinemaName, revenue: 0, bookingsCount: 0 };
      cinemaStats.revenue += booking.totalAmount;
      cinemaStats.bookingsCount += 1;
      byCinemaMap.set(cinemaId, cinemaStats);

      // Group by Movie
      const movieId = booking.showtime.movieId;
      const movieTitle = booking.showtime.movie.title;
      const movieStats = byMovieMap.get(movieId) || { movieTitle, revenue: 0, bookingsCount: 0 };
      movieStats.revenue += booking.totalAmount;
      movieStats.bookingsCount += 1;
      byMovieMap.set(movieId, movieStats);

      // Timeline (YYYY-MM-DD)
      const dateKey = booking.createdAt.toISOString().split('T')[0];
      timelineMap.set(dateKey, (timelineMap.get(dateKey) || 0) + booking.totalAmount);
    }

    return {
      totalRevenue,
      totalOrders: bookings.length,
      byCinema: Array.from(byCinemaMap.entries()).map(([cinemaId, val]) => ({ cinemaId, ...val })),
      byMovie: Array.from(byMovieMap.entries()).map(([movieId, val]) => ({ movieId, ...val })),
      timeline: Array.from(timelineMap.entries()).map(([date, revenue]) => ({ date, revenue })),
    };
  }

  // 3. Thống kê tỷ lệ lấp đầy phòng chiếu (Occupancy Rate)
  async getOccupancyAnalytics(query: OccupancyQueryDto) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (query.date) {
      startDate = new Date(`${query.date}T00:00:00.000Z`);
      endDate = new Date(`${query.date}T23:59:59.999Z`);
    }

    const showtimes = await this.prisma.showtime.findMany({
      where: {
        ...(query.cinemaId && { cinemaId: query.cinemaId }),
        ...(startDate && endDate && {
          startTime: { gte: startDate, lte: endDate },
        }),
      },
      include: {
        cinema: { select: { id: true, name: true } },
        hall: { select: { id: true, name: true } },
        movie: { select: { id: true, title: true } },
        seats: {
          select: { status: true },
        },
      },
    });

    const items = showtimes.map((st) => {
      const totalSeats = st.seats.filter((s) => s.status !== SeatStatus.BLOCKED).length;
      const soldSeats = st.seats.filter((s) => s.status === SeatStatus.SOLD).length;
      const occupancyPercentage = totalSeats > 0 ? Math.round((soldSeats / totalSeats) * 100 * 100) / 100 : 0;

      return {
        showtimeId: st.id,
        cinemaName: st.cinema.name,
        hallName: st.hall.name,
        movieTitle: st.movie.title,
        startTime: st.startTime,
        totalSeats,
        soldSeats,
        occupancyPercentage,
      };
    });

    const totalSeatsSum = items.reduce((acc, curr) => acc + curr.totalSeats, 0);
    const soldSeatsSum = items.reduce((acc, curr) => acc + curr.soldSeats, 0);
    const overallOccupancy = totalSeatsSum > 0 ? Math.round((soldSeatsSum / totalSeatsSum) * 100 * 100) / 100 : 0;

    return {
      overallOccupancyPercentage: overallOccupancy,
      totalShowtimes: items.length,
      showtimes: items,
    };
  }

  // 4. Thống kê phân bổ hội viên CGV
  async getMembersAnalytics() {
    const totalUsers = await this.prisma.user.count();

    const tierCountsRaw = await this.prisma.user.groupBy({
      by: ['membershipTier'],
      _count: { id: true },
    });

    const tierBreakdown = tierCountsRaw.map((item) => ({
      tier: item.membershipTier,
      count: item._count.id,
      percentage: totalUsers > 0 ? Math.round((item._count.id / totalUsers) * 100 * 100) / 100 : 0,
    }));

    const u22VerifiedCount = await this.prisma.user.count({
      where: { isU22Verified: true },
    });

    const totalPointsAggregate = await this.prisma.user.aggregate({
      _sum: { points: true, cgvCardBalance: true },
    });

    return {
      totalUsers,
      u22VerifiedCount,
      totalPointsIssued: totalPointsAggregate._sum.points || 0,
      totalCGVCardBalance: totalPointsAggregate._sum.cgvCardBalance || 0,
      tierBreakdown,
    };
  }
}
