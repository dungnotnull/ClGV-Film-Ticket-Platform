import { PrismaClient, SeatStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Generating sample showtimes for the first 5 movies...');

  // Get first cinema and hall
  const cinema = await prisma.cinema.findFirst({
    include: { halls: true },
  });

  if (!cinema || cinema.halls.length === 0) {
    throw new Error('No cinemas or halls found.');
  }

  const hall = cinema.halls[0];

  // Get first 5 NOW_SHOWING movies
  const movies = await prisma.movie.findMany({
    where: { status: 'NOW_SHOWING' },
    take: 5,
  });

  // Create showtimes for today at 18:30 and 20:30
  for (const movie of movies) {
    for (const hour of [18, 20]) {
      const startTime = new Date();
      startTime.setHours(hour, 30, 0, 0); // Local time
      const endTime = new Date(startTime.getTime() + movie.durationMinutes * 60000);

      const showtime = await prisma.showtime.create({
        data: {
          movieId: movie.id,
          cinemaId: cinema.id,
          hallId: hall.id,
          startTime,
          endTime,
          basePrice: 100000, // 100k VND
        },
      });

      // Generate Seats based on Room Matrix
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
          await prisma.showtimeSeat.createMany({
            data: seatsToCreate,
          });
        }
      }
    }
  }

  console.log('✅ Sample showtimes and seats seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding showtimes:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
