import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateShowtimeDto } from './dto/create-showtime.dto';
import { SeatStatus } from '@prisma/client';

/**
 * Định nghĩa hệ số nhân giá theo từng loại ghế (SeatType dynamic pricing)
 * - STANDARD: 1.0 (Giá gốc suất chiếu)
 * - VIP: 1.2 (+20% phụ thu ghế VIP)
 * - COUPLE: 2.0 (Hệ số 2.0 cho ghế đôi Sweetbox)
 * - ACCESSIBLE: 1.0 (Bằng giá chuẩn)
 */
export const SEAT_TYPE_PRICE_MODIFIERS: Record<string, number> = {
  STANDARD: 1.0,
  VIP: 1.2,
  COUPLE: 2.0,
  ACCESSIBLE: 1.0,
  EMPTY_SPACE: 0.0,
};

@Injectable()
export class ShowtimeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  // Admin tạo suất chiếu mới kèm kiểm tra trùng lặp lịch (Conflict Detection Engine)
  async create(createShowtimeDto: CreateShowtimeDto) {
    const startTime = new Date(createShowtimeDto.startTime);
    const endTime = new Date(createShowtimeDto.endTime);

    // Thêm 30 phút khoảng nghỉ và dọn dẹp vệ sinh giữa các suất chiếu trong cùng phòng
    const bufferedStartTime = new Date(startTime.getTime() - 30 * 60 * 1000);
    const bufferedEndTime = new Date(endTime.getTime() + 30 * 60 * 1000);

    // Kiểm tra xung đột lịch chiếu trong cùng phòng chiếu
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
        message: 'Suất chiếu bị trùng lặp thời gian hoặc vi phạm khoảng nghỉ 30 phút dọn phòng chiếu',
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
              const defaultModifier = SEAT_TYPE_PRICE_MODIFIERS[seat.type] || 1.0;
              const priceModifier = seat.priceModifier && seat.priceModifier !== 1.0 ? seat.priceModifier : defaultModifier;

              seatsToCreate.push({
                showtimeId: showtime.id,
                seatId: seat.id,
                row: seat.row,
                col: seat.col,
                type: seat.type,
                status: seat.isBlocked ? SeatStatus.BLOCKED : SeatStatus.AVAILABLE,
                priceModifier,
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

  // Lấy sơ đồ ghế và trạng thái thời gian thực của 1 suất chiếu (Đồng bộ với Redis Redlock)
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

    // Đồng bộ trạng thái khoá ghế Redis và tính toán mức giá cụ thể theo loại ghế
    const seatsWithPriceAndLock = await Promise.all(
      showtime.seats.map(async (seat) => {
        const modifier =
          seat.priceModifier && seat.priceModifier !== 1.0
            ? seat.priceModifier
            : SEAT_TYPE_PRICE_MODIFIERS[seat.type] || 1.0;
        const calculatedPrice = Math.round(showtime.basePrice * modifier);

        let currentStatus = seat.status;
        let heldByUserId: string | null = seat.heldByUserId || null;

        // Nếu DB hiển thị AVAILABLE, kiểm tra xem có ai đang giữ tạm thời ở Redis không
        if (seat.status === SeatStatus.AVAILABLE) {
          const lockHolder = await this.redisService.getSeatLockHolder(showtimeId, seat.seatId);
          if (lockHolder) {
            currentStatus = SeatStatus.HOLDING;
            heldByUserId = lockHolder;
          }
        }

        return {
          ...seat,
          status: currentStatus,
          heldByUserId,
          priceModifier: modifier,
          price: calculatedPrice,
        };
      }),
    );

    return {
      ...showtime,
      seats: seatsWithPriceAndLock,
    };
  }
}
