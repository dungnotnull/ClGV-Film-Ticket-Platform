import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { SeatStatus } from '@prisma/client';

@Injectable()
export class ShowtimeService {
  constructor(private prisma: PrismaService) {}

  // Admin tạo suất chiếu mới kèm kiểm tra trùng lặp lịch (Conflict Detection Engine)
  async create(createShowtimeDto: CreateShowtimeDto) {
    const startTime = new Date(createShowtimeDto.startTime);
    const endTime = new Date(createShowtimeDto.endTime);

    // Thêm 15 phút dọn dẹp vệ sinh phòng chiếu
    const bufferedStartTime = new Date(startTime.getTime() - 15 * 60 * 1000);
    const bufferedEndTime = new Date(endTime.getTime() + 15 * 60 * 1000);

    // Kiểm tra xung đột lịch chiếu trong phòng
    const conflictingShowtimes = await this.prisma.showtime.findMany({
      where: {
        hallId: createShowtimeDto.hallId,
        OR: [
          {
            startTime: { lte: bufferedEndTime },
            endTime: { gte: bufferedStartTime },
          },
        ],
      },
    });

    if (conflictingShowtimes.length > 0) {
      throw new ConflictException({
        code: 'SHOWTIME_CONFLICT',
        message: 'Suất chiếu bị trùng lặp thời gian hoặc vi phạm khoảng nghỉ 15 phút dọn phòng chiếu',
      });
    }

    const hall = await this.prisma.hall.findUnique({
      where: { id: createShowtimeDto.hallId },
    });

    if (!hall) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Phòng chiếu không tồn tại',
      });
    }

    // Tạo suất chiếu mới
    const showtime = await this.prisma.showtime.create({
      data: {
        movieId: createShowtimeDto.movieId,
        cinemaId: createShowtimeDto.cinemaId,
        hallId: createShowtimeDto.hallId,
        startTime,
        endTime,
        basePrice: createShowtimeDto.basePrice,
      },
    });

    // Tự động khởi tạo sơ đồ các ghế trong suất chiếu dựa trên RoomMatrix của Hall
    const matrix = hall.roomMatrix as any;
    if (matrix && matrix.grid && Array.isArray(matrix.grid)) {
      const seatsToCreate: any[] = [];
      for (const row of matrix.grid) {
        if (Array.isArray(row)) {
          for (const seat of row) {
            if (seat && seat.type !== 'EMPTY_SPACE') {
              seatsToCreate.push({
                showtimeId: showtime.id,
                seatId: seat.id,
                row: seat.row,
                col: seat.col,
                type: seat.type,
                status: seat.isBlocked ? SeatStatus.BLOCKED : SeatStatus.AVAILABLE,
                priceModifier: seat.priceModifier || 1.0,
              });
            }
          }
        }
      }

      if (seatsToCreate.length > 0) {
        await this.prisma.showtimeSeat.createMany({
          data: seatsToCreate,
        });
      }
    }

    return showtime;
  }

  // Danh sách suất chiếu theo movieId, cinemaId, date
  async findAll(movieId?: string, cinemaId?: string, date?: string) {
    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (date) {
      startDate = new Date(`${date}T00:00:00.000Z`);
      endDate = new Date(`${date}T23:59:59.999Z`);
    }

    return this.prisma.showtime.findMany({
      where: {
        ...(movieId && { movieId }),
        ...(cinemaId && { cinemaId }),
        ...(date && {
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      include: {
        movie: { select: { id: true, title: true, durationMinutes: true, posterUrl: true, ageRating: true } },
        cinema: { select: { id: true, name: true, address: true } },
        hall: { select: { id: true, name: true, screenType: true } },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  // Lấy sơ đồ ghế và trạng thái thời gian thực của 1 suất chiếu
  async getShowtimeSeats(showtimeId: string) {
    const showtime = await this.prisma.showtime.findUnique({
      where: { id: showtimeId },
      include: {
        movie: { select: { title: true } },
        cinema: { select: { name: true } },
        hall: { select: { name: true, screenType: true } },
        seats: {
          orderBy: [{ row: 'asc' }, { col: 'asc' }],
        },
      },
    });

    if (!showtime) {
      throw new NotFoundException({
        code: 'NOT_FOUND',
        message: 'Suất chiếu không tồn tại',
      });
    }

    return showtime;
  }
}
