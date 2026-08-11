import { PrismaClient, SeatStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Generating LOGICAL sample showtimes for ALL NOW_SHOWING movies...');

  // Xóa các showtimes cũ bị đè
  await prisma.showtimeSeat.deleteMany();
  await prisma.showtime.deleteMany();

  const cinema = await prisma.cinema.findFirst({
    include: { halls: true },
  });

  if (!cinema || cinema.halls.length === 0) {
    throw new Error('No cinemas or halls found.');
  }

  const hall = cinema.halls[0];

  const movies = await prisma.movie.findMany({
    where: { status: 'NOW_SHOWING' },
  });

  // Bắt đầu xếp lịch từ 09:00 sáng hôm nay
  let currentDate = new Date();
  currentDate.setHours(9, 0, 0, 0);

  for (const movie of movies) {
    const startTime = new Date(currentDate);
    const endTime = new Date(startTime.getTime() + movie.durationMinutes * 60000);

    const showtime = await prisma.showtime.create({
      data: {
        movieId: movie.id,
        cinemaId: cinema.id,
        hallId: hall.id,
        startTime,
        endTime,
        basePrice: 100000,
      },
    });

    // Cộng thêm thời lượng phim và 30 phút dọn rạp cho suất chiếu tiếp theo
    currentDate = new Date(endTime.getTime() + 30 * 60000);

    // Nếu suất chiếu tiếp theo bắt đầu sau 23:00 đêm, chuyển sang 09:00 sáng hôm sau
    if (currentDate.getHours() >= 23 || currentDate.getHours() < 9) {
      // Đặt lại thành 09:00 sáng
      currentDate.setHours(9, 0, 0, 0);
      // Cộng thêm 1 ngày
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const matrix = hall.roomMatrix as any;
    if (matrix && matrix.grid && Array.isArray(matrix.grid)) {
      const seatsToCreate = [];
      for (const row of matrix.grid) {
        if (Array.isArray(row)) {
          for (const seat of row) {
            if (seat && seat.type !== 'EMPTY_SPACE' && seat.type !== 'EMPTY') {
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
        await prisma.showtimeSeat.createMany({ data: seatsToCreate });
      }
    }
  }
  console.log('✅ Logical sample showtimes seeded for all NOW_SHOWING movies without overlaps!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
